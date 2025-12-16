import { MongoClient, Db, Collection, ObjectId } from "mongodb";

export interface TranscriptionData {
  text: string;
  duration: number;
  cost: number;
  timestamp: Date;
  date?: string;
}

export interface TranscriptionRecord extends TranscriptionData {
  _id: ObjectId;
}

export interface HistoryDay {
  date: string;
  count: number;
}

export class DatabaseService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private collection: Collection<TranscriptionRecord> | null = null;

  constructor(
    private connectionString: string,
    private dbName: string,
    private collectionName: string = "transcriptions"
  ) {}

  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.collection = this.db.collection<TranscriptionRecord>(
        this.collectionName
      );
    } catch (error) {
      throw new Error(
        `Failed to connect to MongoDB: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async saveTranscription(
    data: TranscriptionData
  ): Promise<{ insertedId: string }> {
    if (!this.collection) {
      throw new Error("Database not connected. Call connect() first.");
    }

    try {
      // Calculate date from timestamp if not provided
      const date =
        data.date ||
        data.timestamp.toISOString().split("T")[0];

      const document = {
        ...data,
        date,
      };

      const result = await this.collection.insertOne(
        document as TranscriptionRecord
      );

      return {
        insertedId: result.insertedId.toString(),
      };
    } catch (error) {
      throw new Error(
        `Failed to save transcription: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getHistoryDays(): Promise<HistoryDay[]> {
    if (!this.collection) {
      throw new Error("Database not connected. Call connect() first.");
    }

    try {
      const result = await this.collection
        .aggregate([
          {
            $group: {
              _id: "$date",
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: -1 },
          },
        ])
        .toArray();

      return result.map((item) => ({
        date: item._id as string,
        count: item.count as number,
      }));
    } catch (error) {
      throw new Error(
        `Failed to get history days: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getTranscriptionsByDay(date: string): Promise<TranscriptionRecord[]> {
    if (!this.collection) {
      throw new Error("Database not connected. Call connect() first.");
    }

    try {
      const result = await this.collection
        .find({ date })
        .sort({ timestamp: -1 })
        .toArray();

      return result;
    } catch (error) {
      throw new Error(
        `Failed to get transcriptions: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.collection = null;
    }
  }
}


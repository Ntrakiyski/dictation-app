import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MongoClient, Db, Collection } from "mongodb";
import { DatabaseService } from "../services/database";

// Mock MongoDB
vi.mock("mongodb");

describe("DatabaseService", () => {
  let mockClient: any;
  let mockDb: any;
  let mockCollection: any;
  let dbService: DatabaseService;

  const connectionString =
    "mongodb://root:vzIg4RDiKVsmvnBg2L1uHLnx0Mu8CKpWuH5bzJJKqOXVTmVJYb4ayARnmyL5ezee@159.69.35.245:7777/?directConnection=true";
  const dbName = "voice_clipboard";
  const collectionName = "transcriptions";

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock collection
    mockCollection = {
      insertOne: vi.fn(),
      aggregate: vi.fn(),
      find: vi.fn(),
    };

    // Setup mock database
    mockDb = {
      collection: vi.fn().mockReturnValue(mockCollection),
    };

    // Setup mock client
    mockClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      db: vi.fn().mockReturnValue(mockDb),
      close: vi.fn().mockResolvedValue(undefined),
    };

    // Mock MongoClient constructor
    (MongoClient as any).mockImplementation(() => mockClient);

    dbService = new DatabaseService(connectionString, dbName);
  });

  afterEach(async () => {
    if (dbService) {
      await dbService.disconnect();
    }
  });

  describe("connect", () => {
    it("should connect to MongoDB successfully", async () => {
      await dbService.connect();

      expect(mockClient.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.db).toHaveBeenCalledWith(dbName);
    });

    it("should throw error if connection fails", async () => {
      const error = new Error("Connection failed");
      mockClient.connect.mockRejectedValueOnce(error);

      await expect(dbService.connect()).rejects.toThrow("Connection failed");
    });
  });

  describe("saveTranscription", () => {
    beforeEach(async () => {
      await dbService.connect();
    });

    it("should save transcription with correct data structure", async () => {
      const transcriptionData = {
        text: "Hello world",
        duration: 5.5,
        cost: 0.000061,
        timestamp: new Date("2025-12-16T10:00:00Z"),
        date: "2025-12-16",
      };

      mockCollection.insertOne.mockResolvedValueOnce({
        insertedId: "507f1f77bcf86cd799439011",
      });

      const result = await dbService.saveTranscription(transcriptionData);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          text: transcriptionData.text,
          duration: transcriptionData.duration,
          cost: transcriptionData.cost,
          timestamp: transcriptionData.timestamp,
          date: transcriptionData.date,
        })
      );
      expect(result.insertedId).toBe("507f1f77bcf86cd799439011");
    });

    it("should calculate date from timestamp if not provided", async () => {
      const transcriptionData = {
        text: "Test",
        duration: 2.0,
        cost: 0.000022,
        timestamp: new Date("2025-12-16T10:30:00Z"),
      };

      mockCollection.insertOne.mockResolvedValueOnce({
        insertedId: "507f1f77bcf86cd799439012",
      });

      await dbService.saveTranscription(transcriptionData);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          date: "2025-12-16",
        })
      );
    });

    it("should throw error if save fails", async () => {
      const error = new Error("Database error");
      mockCollection.insertOne.mockRejectedValueOnce(error);

      await expect(
        dbService.saveTranscription({
          text: "Test",
          duration: 1.0,
          cost: 0.000011,
          timestamp: new Date(),
        })
      ).rejects.toThrow("Database error");
    });
  });

  describe("getHistoryDays", () => {
    beforeEach(async () => {
      await dbService.connect();
    });

    it("should return list of days with transcription counts", async () => {
      const mockCursor = {
        toArray: vi.fn().mockResolvedValue([
          { _id: "2025-12-16", count: 3 },
          { _id: "2025-12-15", count: 5 },
          { _id: "2025-12-14", count: 2 },
        ]),
      };

      mockCollection.aggregate.mockReturnValueOnce(mockCursor);

      const result = await dbService.getHistoryDays();

      expect(mockCollection.aggregate).toHaveBeenCalledWith([
        {
          $group: {
            _id: "$date",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: -1 },
        },
      ]);

      expect(result).toEqual([
        { date: "2025-12-16", count: 3 },
        { date: "2025-12-15", count: 5 },
        { date: "2025-12-14", count: 2 },
      ]);
    });

    it("should return empty array if no transcriptions exist", async () => {
      const mockCursor = {
        toArray: vi.fn().mockResolvedValue([]),
      };

      mockCollection.aggregate.mockReturnValueOnce(mockCursor);

      const result = await dbService.getHistoryDays();

      expect(result).toEqual([]);
    });
  });

  describe("getTranscriptionsByDay", () => {
    beforeEach(async () => {
      await dbService.connect();
    });

    it("should return transcriptions for a specific day", async () => {
      const date = "2025-12-16";
      const mockTranscriptions = [
        {
          _id: "507f1f77bcf86cd799439011",
          text: "First transcription",
          duration: 5.5,
          cost: 0.000061,
          timestamp: new Date("2025-12-16T10:00:00Z"),
          date: "2025-12-16",
        },
        {
          _id: "507f1f77bcf86cd799439012",
          text: "Second transcription",
          duration: 3.2,
          cost: 0.000036,
          timestamp: new Date("2025-12-16T11:00:00Z"),
          date: "2025-12-16",
        },
      ];

      const mockCursor = {
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue(mockTranscriptions),
      };

      mockCollection.find.mockReturnValueOnce(mockCursor);

      const result = await dbService.getTranscriptionsByDay(date);

      expect(mockCollection.find).toHaveBeenCalledWith({ date });
      expect(mockCursor.sort).toHaveBeenCalledWith({ timestamp: -1 });
      expect(result).toEqual(mockTranscriptions);
    });

    it("should return empty array if no transcriptions for date", async () => {
      const date = "2025-12-20";
      const mockCursor = {
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue([]),
      };

      mockCollection.find.mockReturnValueOnce(mockCursor);

      const result = await dbService.getTranscriptionsByDay(date);

      expect(result).toEqual([]);
    });
  });

  describe("disconnect", () => {
    it("should close MongoDB connection", async () => {
      await dbService.connect();
      await dbService.disconnect();

      expect(mockClient.close).toHaveBeenCalledTimes(1);
    });

    it("should handle disconnect when not connected", async () => {
      await expect(dbService.disconnect()).resolves.not.toThrow();
    });
  });
});


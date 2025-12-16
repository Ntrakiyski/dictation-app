import { describe, it, expect, beforeEach, vi } from "vitest";
import { DatabaseService } from "../../services/database";
import { MongoClient } from "mongodb";

// Mock MongoDB
vi.mock("mongodb");

describe("DatabaseService", () => {
  let dbService: DatabaseService;
  let mockCollection: any;
  let mockDb: any;
  let mockClient: any;

  beforeEach(() => {
    mockCollection = {
      insertOne: vi.fn(),
      aggregate: vi.fn().mockReturnValue({
        toArray: vi.fn(),
      }),
      find: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          toArray: vi.fn(),
        }),
      }),
    };

    mockDb = {
      collection: vi.fn().mockReturnValue(mockCollection),
    };

    mockClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
      db: vi.fn().mockReturnValue(mockDb),
    };

    vi.mocked(MongoClient).mockImplementation(() => mockClient as any);

    dbService = new DatabaseService(
      "mongodb://test",
      "test_db",
      "test_collection"
    );
  });

  describe("connect", () => {
    it("should connect to MongoDB successfully", async () => {
      await dbService.connect();

      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockClient.db).toHaveBeenCalledWith("test_db");
      expect(mockDb.collection).toHaveBeenCalledWith("test_collection");
    });

    it("should throw error on connection failure", async () => {
      mockClient.connect.mockRejectedValue(new Error("Connection failed"));

      await expect(dbService.connect()).rejects.toThrow("Connection failed");
    });
  });

  describe("saveTranscription", () => {
    beforeEach(async () => {
      await dbService.connect();
    });

    it("should save transcription successfully", async () => {
      const mockInsertResult = {
        insertedId: { toString: () => "test-id" },
      };
      mockCollection.insertOne.mockResolvedValue(mockInsertResult);

      const data = {
        text: "Test transcription",
        duration: 2.5,
        cost: 0.0001,
        timestamp: new Date("2024-01-01"),
      };

      const result = await dbService.saveTranscription(data);

      expect(result.insertedId).toBe("test-id");
      expect(mockCollection.insertOne).toHaveBeenCalled();
    });

    it("should calculate date from timestamp if not provided", async () => {
      const mockInsertResult = {
        insertedId: { toString: () => "test-id" },
      };
      mockCollection.insertOne.mockResolvedValue(mockInsertResult);

      const data = {
        text: "Test",
        duration: 1.0,
        cost: 0.0001,
        timestamp: new Date("2024-01-15T10:30:00Z"),
      };

      await dbService.saveTranscription(data);

      const callArgs = mockCollection.insertOne.mock.calls[0][0];
      expect(callArgs.date).toBe("2024-01-15");
    });

    it("should throw error if not connected", async () => {
      const disconnectedService = new DatabaseService(
        "mongodb://test",
        "test_db"
      );

      await expect(
        disconnectedService.saveTranscription({
          text: "Test",
          duration: 1.0,
          cost: 0.0001,
          timestamp: new Date(),
        })
      ).rejects.toThrow("Database not connected");
    });
  });

  describe("getHistoryDays", () => {
    beforeEach(async () => {
      await dbService.connect();
    });

    it("should return days with counts", async () => {
      const mockAggregateResult = [
        { _id: "2024-01-01", count: 5 },
        { _id: "2024-01-02", count: 3 },
      ];

      mockCollection.aggregate().toArray.mockResolvedValue(
        mockAggregateResult
      );

      const result = await dbService.getHistoryDays();

      expect(result).toEqual([
        { date: "2024-01-01", count: 5 },
        { date: "2024-01-02", count: 3 },
      ]);
    });
  });

  describe("getTranscriptionsByDay", () => {
    beforeEach(async () => {
      await dbService.connect();
    });

    it("should return transcriptions for a date", async () => {
      const mockTranscriptions = [
        {
          _id: { toString: () => "id1" },
          text: "Test 1",
          duration: 1.5,
          cost: 0.0001,
          timestamp: new Date("2024-01-01"),
          date: "2024-01-01",
        },
      ];

      mockCollection.find().sort().toArray.mockResolvedValue(
        mockTranscriptions
      );

      const result = await dbService.getTranscriptionsByDay("2024-01-01");

      expect(result).toEqual(mockTranscriptions);
      expect(mockCollection.find).toHaveBeenCalledWith({ date: "2024-01-01" });
    });
  });

  describe("disconnect", () => {
    it("should close connection", async () => {
      await dbService.connect();
      await dbService.disconnect();

      expect(mockClient.close).toHaveBeenCalled();
    });
  });
});


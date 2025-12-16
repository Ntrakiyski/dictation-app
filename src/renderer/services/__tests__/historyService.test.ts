import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  saveTranscription,
  getHistoryDays,
  getTranscriptionsByDay,
} from "../historyService";

// Mock electron API
const mockInvoke = vi.fn();

// Mock global electron object
(global as any).window = {
  electron: {
    database: {
      saveTranscription: mockInvoke,
      getHistoryDays: mockInvoke,
      getTranscriptionsByDay: mockInvoke,
    },
  },
};

describe("historyService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("saveTranscription", () => {
    it("should save transcription successfully", async () => {
      const transcriptionData = {
        text: "Hello world",
        duration: 5.5,
        cost: 0.000061,
        timestamp: new Date("2025-12-16T10:00:00Z"),
      };

      mockInvoke.mockResolvedValueOnce({
        success: true,
        data: { insertedId: "507f1f77bcf86cd799439011" },
      });

      const result = await saveTranscription(transcriptionData);

      expect(mockInvoke).toHaveBeenCalledWith(
        expect.objectContaining({
          text: transcriptionData.text,
          duration: transcriptionData.duration,
          cost: transcriptionData.cost,
          timestamp: transcriptionData.timestamp,
        })
      );
      expect(result).toEqual({ insertedId: "507f1f77bcf86cd799439011" });
    });

    it("should calculate cost from duration", async () => {
      const transcriptionData = {
        text: "Test",
        duration: 3600, // 1 hour
        timestamp: new Date(),
      };

      mockInvoke.mockResolvedValueOnce({
        success: true,
        data: { insertedId: "507f1f77bcf86cd799439012" },
      });

      await saveTranscription(transcriptionData);

      expect(mockInvoke).toHaveBeenCalledWith(
        expect.objectContaining({
          cost: expect.closeTo(0.04, 6),
        })
      );
    });

    it("should throw error if save fails", async () => {
      const transcriptionData = {
        text: "Test",
        duration: 1.0,
        timestamp: new Date(),
      };

      mockInvoke.mockResolvedValueOnce({
        success: false,
        error: "Database error",
      });

      await expect(saveTranscription(transcriptionData)).rejects.toThrow(
        "Database error"
      );
    });

    it("should include date in save request", async () => {
      const transcriptionData = {
        text: "Test",
        duration: 1.0,
        timestamp: new Date("2025-12-16T10:00:00Z"),
      };

      mockInvoke.mockResolvedValueOnce({
        success: true,
        data: { insertedId: "507f1f77bcf86cd799439013" },
      });

      await saveTranscription(transcriptionData);

      expect(mockInvoke).toHaveBeenCalledWith(
        expect.objectContaining({
          date: "2025-12-16",
        })
      );
    });
  });

  describe("getHistoryDays", () => {
    it("should return list of history days", async () => {
      const mockDays = [
        { date: "2025-12-16", count: 3 },
        { date: "2025-12-15", count: 5 },
        { date: "2025-12-14", count: 2 },
      ];

      mockInvoke.mockResolvedValueOnce({
        success: true,
        data: mockDays,
      });

      const result = await getHistoryDays();

      expect(mockInvoke).toHaveBeenCalled();
      expect(result).toEqual(mockDays);
    });

    it("should return empty array if no history", async () => {
      mockInvoke.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      const result = await getHistoryDays();

      expect(result).toEqual([]);
    });

    it("should throw error if request fails", async () => {
      mockInvoke.mockResolvedValueOnce({
        success: false,
        error: "Failed to fetch",
      });

      await expect(getHistoryDays()).rejects.toThrow("Failed to fetch");
    });
  });

  describe("getTranscriptionsByDay", () => {
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

      mockInvoke.mockResolvedValueOnce({
        success: true,
        data: mockTranscriptions,
      });

      const result = await getTranscriptionsByDay(date);

      expect(mockInvoke).toHaveBeenCalledWith(date);
      expect(result).toEqual(mockTranscriptions);
    });

    it("should return empty array if no transcriptions for date", async () => {
      const date = "2025-12-20";

      mockInvoke.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      const result = await getTranscriptionsByDay(date);

      expect(result).toEqual([]);
    });

    it("should throw error if request fails", async () => {
      const date = "2025-12-16";

      mockInvoke.mockResolvedValueOnce({
        success: false,
        error: "Failed to fetch",
      });

      await expect(getTranscriptionsByDay(date)).rejects.toThrow(
        "Failed to fetch"
      );
    });
  });
});


import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import express from "express";
import transcribeRouter from "../routes/transcribe";
import historyRouter from "../routes/history";
import { DatabaseService } from "../services/database";
import * as groqService from "../services/groq";
import { apiKeyAuth } from "../middleware/auth";

// Mock dependencies
vi.mock("../services/groq");
vi.mock("../services/database");

describe("API Integration Tests", () => {
  let app: express.Application;
  let mockDbService: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    mockDbService = {
      saveTranscription: vi.fn().mockResolvedValue({ insertedId: "test-id" }),
      getHistoryDays: vi.fn().mockResolvedValue([
        { date: "2024-01-01", count: 1 },
      ]),
      getTranscriptionsByDay: vi.fn().mockResolvedValue([
        {
          _id: { toString: () => "id1" },
          text: "Test",
          duration: 1.0,
          cost: 0.0001,
          timestamp: new Date("2024-01-01"),
          date: "2024-01-01",
        },
      ]),
    };
    
    app.set("dbService", mockDbService);
    app.use("/api/transcribe", apiKeyAuth, transcribeRouter);
    app.use("/api/history", apiKeyAuth, historyRouter);
  });

  it("should complete full transcription workflow", async () => {
    const mockTranscription = {
      text: "Hello world",
      duration: 2.5,
    };

    vi.mocked(groqService.transcribeAudio).mockResolvedValue(mockTranscription);

    // Transcribe audio
    const audioBuffer = Buffer.from("fake audio data");
    const transcribeResponse = await request(app)
      .post("/api/transcribe")
      .attach("audio", audioBuffer, "audio.m4a")
      .set("x-api-key", "test-key");

    expect(transcribeResponse.status).toBe(200);
    expect(transcribeResponse.body.data).toEqual(mockTranscription);
    expect(mockDbService.saveTranscription).toHaveBeenCalled();

    // Get history days
    const daysResponse = await request(app)
      .get("/api/history/days")
      .set("x-api-key", "test-key");

    expect(daysResponse.status).toBe(200);
    expect(daysResponse.body.data).toHaveLength(1);

    // Get transcriptions for day
    const transcriptionsResponse = await request(app)
      .get("/api/history/2024-01-01")
      .set("x-api-key", "test-key");

    expect(transcriptionsResponse.status).toBe(200);
    expect(transcriptionsResponse.body.data).toHaveLength(1);
  });

  it("should require API key authentication", async () => {
    const audioBuffer = Buffer.from("fake audio data");
    
    const response = await request(app)
      .post("/api/transcribe")
      .attach("audio", audioBuffer, "audio.m4a");

    expect(response.status).toBe(401);
    expect(response.body.error).toContain("API key");
  });
});


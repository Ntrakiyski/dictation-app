import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import express from "express";
import transcribeRouter from "../../routes/transcribe";
import { DatabaseService } from "../../services/database";
import * as groqService from "../../services/groq";

// Mock dependencies
vi.mock("../../services/groq");
vi.mock("../../services/database");

describe("POST /api/transcribe", () => {
  let app: express.Application;
  let mockDbService: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    mockDbService = {
      saveTranscription: vi.fn().mockResolvedValue({ insertedId: "test-id" }),
    };
    app.set("dbService", mockDbService);
    app.use("/", transcribeRouter);
  });

  it("should transcribe audio and save to database by default", async () => {
    const mockTranscription = {
      text: "Hello world",
      duration: 2.5,
    };

    vi.mocked(groqService.transcribeAudio).mockResolvedValue(mockTranscription);

    const audioBuffer = Buffer.from("fake audio data");
    const response = await request(app)
      .post("/")
      .attach("audio", audioBuffer, "audio.m4a")
      .set("x-api-key", "test-key");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(mockTranscription);
    expect(mockDbService.saveTranscription).toHaveBeenCalled();
  });

  it("should transcribe audio without saving when save=false", async () => {
    const mockTranscription = {
      text: "Hello world",
      duration: 2.5,
    };

    vi.mocked(groqService.transcribeAudio).mockResolvedValue(mockTranscription);

    const audioBuffer = Buffer.from("fake audio data");
    const response = await request(app)
      .post("/?save=false")
      .attach("audio", audioBuffer, "audio.m4a")
      .set("x-api-key", "test-key");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(mockDbService.saveTranscription).not.toHaveBeenCalled();
  });

  it("should return 400 if no audio file provided", async () => {
    const response = await request(app)
      .post("/")
      .set("x-api-key", "test-key");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("No audio file provided");
  });

  it("should handle transcription errors", async () => {
    vi.mocked(groqService.transcribeAudio).mockRejectedValue(
      new Error("Transcription failed")
    );

    const audioBuffer = Buffer.from("fake audio data");
    const response = await request(app)
      .post("/")
      .attach("audio", audioBuffer, "audio.m4a")
      .set("x-api-key", "test-key");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Transcription failed");
  });
});


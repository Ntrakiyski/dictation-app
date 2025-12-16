import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import express from "express";
import historyRouter from "../../routes/history";
import { DatabaseService } from "../../services/database";

describe("GET /api/history/days", () => {
  let app: express.Application;
  let mockDbService: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    mockDbService = {
      getHistoryDays: vi.fn().mockResolvedValue([
        { date: "2024-01-01", count: 5 },
        { date: "2024-01-02", count: 3 },
      ]),
    };
    app.set("dbService", mockDbService);
    app.use("/", historyRouter);
  });

  it("should return list of days with counts", async () => {
    const response = await request(app)
      .get("/days")
      .set("x-api-key", "test-key");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual([
      { date: "2024-01-01", count: 5 },
      { date: "2024-01-02", count: 3 },
    ]);
  });

  it("should handle database errors", async () => {
    mockDbService.getHistoryDays.mockRejectedValue(
      new Error("Database error")
    );

    const response = await request(app)
      .get("/days")
      .set("x-api-key", "test-key");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Database error");
  });
});

describe("GET /api/history/:date", () => {
  let app: express.Application;
  let mockDbService: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    mockDbService = {
      getTranscriptionsByDay: vi.fn().mockResolvedValue([
        {
          _id: { toString: () => "id1" },
          text: "Test 1",
          duration: 1.5,
          cost: 0.0001,
          timestamp: new Date("2024-01-01"),
          date: "2024-01-01",
        },
      ]),
    };
    app.set("dbService", mockDbService);
    app.use("/", historyRouter);
  });

  it("should return transcriptions for valid date", async () => {
    const response = await request(app)
      .get("/2024-01-01")
      .set("x-api-key", "test-key");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]._id).toBe("id1");
    expect(response.body.data[0].text).toBe("Test 1");
  });

  it("should return 400 for invalid date format", async () => {
    const response = await request(app)
      .get("/invalid-date")
      .set("x-api-key", "test-key");

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Invalid date format");
  });
});

describe("POST /api/transcriptions", () => {
  let app: express.Application;
  let mockDbService: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    mockDbService = {
      saveTranscription: vi.fn().mockResolvedValue({ insertedId: "new-id" }),
    };
    app.set("dbService", mockDbService);
    app.use("/", historyRouter);
  });

  it("should save transcription with all fields", async () => {
    const transcription = {
      text: "Test transcription",
      duration: 2.5,
      timestamp: "2024-01-01T00:00:00Z",
      date: "2024-01-01",
    };

    const response = await request(app)
      .post("/")
      .send(transcription)
      .set("x-api-key", "test-key");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(mockDbService.saveTranscription).toHaveBeenCalled();
  });

  it("should return 400 if required fields missing", async () => {
    const response = await request(app)
      .post("/")
      .send({ text: "Test" })
      .set("x-api-key", "test-key");

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Missing required fields");
  });
});


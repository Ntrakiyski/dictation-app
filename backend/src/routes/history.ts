import { Router, Request, Response } from "express";
import { DatabaseService } from "../services/database.js";

const router = Router();

/**
 * GET /api/history/days
 * Get list of days with transcription counts
 */
router.get("/days", async (req: Request, res: Response, next) => {
  try {
    const dbService = req.app.get("dbService") as DatabaseService;
    const days = await dbService.getHistoryDays();

    res.json({
      success: true,
      data: days,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/history/:date
 * Get all transcriptions for a specific day (YYYY-MM-DD format)
 */
router.get("/:date", async (req: Request, res: Response, next) => {
  try {
    const { date } = req.params;

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
      return;
    }

    const dbService = req.app.get("dbService") as DatabaseService;
    const transcriptions = await dbService.getTranscriptionsByDay(date);

    // Convert ObjectId to string for JSON serialization
    const formatted = transcriptions.map((t) => ({
      _id: t._id.toString(),
      text: t.text,
      duration: t.duration,
      cost: t.cost,
      timestamp: t.timestamp,
      date: t.date,
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/transcriptions
 * Save a transcription record manually
 */
router.post("/", async (req: Request, res: Response, next) => {
  try {
    const { text, duration, timestamp, date } = req.body;

    if (!text || duration === undefined) {
      res.status(400).json({
        error: "Missing required fields: text, duration",
      });
      return;
    }

    const dbService = req.app.get("dbService") as DatabaseService;
    const recordTimestamp = timestamp ? new Date(timestamp) : new Date();
    const recordDate = date || recordTimestamp.toISOString().split("T")[0];
    const cost = (duration / 3600) * 0.04;

    const result = await dbService.saveTranscription({
      text,
      duration,
      cost,
      timestamp: recordTimestamp,
      date: recordDate,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

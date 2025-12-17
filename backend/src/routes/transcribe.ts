import { Router, Request, Response } from "express";
import multer from "multer";
import { z } from "zod";
import { transcribeAudio } from "../services/groq.js";
import { DatabaseService } from "../services/database.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
});

const transcribeSchema = z.object({
  save: z.boolean().optional().default(true),
});

/**
 * POST /api/transcribe
 * Upload audio file and get transcription
 * Body: multipart/form-data with 'audio' field
 * Query: ?save=true (optional, defaults to true)
 */
router.post(
  "/",
  upload.single("audio"),
  async (req: Request, res: Response, next) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No audio file provided" });
        return;
      }

      // Validate query params
      const query = transcribeSchema.parse({
        save: req.query.save === "true" || req.query.save === undefined,
      });

      // Transcribe audio
      const result = await transcribeAudio(req.file);

      // Save to database if requested
      if (query.save) {
        const dbService = req.app.get("dbService") as DatabaseService;
        const timestamp = new Date();
        const date = timestamp.toISOString().split("T")[0];
        const cost = (result.duration / 3600) * 0.04;

        await dbService.saveTranscription({
          text: result.text,
          duration: result.duration,
          cost,
          timestamp,
          date,
        });
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

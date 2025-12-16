import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { DatabaseService } from "./services/database";
import { apiKeyAuth } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import transcribeRouter from "./routes/transcribe";
import historyRouter from "./routes/history";
import healthRouter from "./routes/health";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check (no auth required)
app.use("/api/health", healthRouter);

// Protected routes (require API key)
app.use("/api/transcribe", apiKeyAuth, transcribeRouter);
app.use("/api/history", apiKeyAuth, historyRouter);

// Error handler (must be last)
app.use(errorHandler);

// Initialize database service
const mongoUri =
  process.env.MONGODB_URI ||
  "mongodb://root:vzIg4RDiKVsmvnBg2L1uHLnx0Mu8CKpWuH5bzJJKqOXVTmVJYb4ayARnmyL5ezee@159.69.35.245:7777/?directConnection=true";
const dbName = process.env.DB_NAME || "voice_clipboard";

const dbService = new DatabaseService(mongoUri, dbName);

// Store dbService in app for route access
app.set("dbService", dbService);

// Start server
async function startServer() {
  try {
    await dbService.connect();
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await dbService.disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await dbService.disconnect();
  process.exit(0);
});

startServer();


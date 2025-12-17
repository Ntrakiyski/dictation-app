import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { DatabaseService } from "./services/database.js";
import { apiKeyAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import transcribeRouter from "./routes/transcribe.js";
import historyRouter from "./routes/history.js";
import healthRouter from "./routes/health.js";

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
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "voice_clipboard";

if (!mongoUri) {
  console.error("MONGODB_URI environment variable is required");
  process.exit(1);
}

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

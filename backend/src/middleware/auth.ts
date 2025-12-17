import { Request, Response, NextFunction } from "express";

/**
 * Simple API key authentication middleware
 * Checks for X-API-Key header matching API_KEY env var
 */
export function apiKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const apiKey = process.env.API_KEY;
  const providedKey = req.headers["x-api-key"];

  if (!apiKey) {
    res.status(500).json({ error: "API key not configured" });
    return;
  }

  if (!providedKey || providedKey !== apiKey) {
    res.status(401).json({ error: "Invalid or missing API key" });
    return;
  }

  next();
}


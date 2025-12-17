import type {
  TranscriptionResult,
  TranscriptionRecord,
  HistoryDay,
} from "@voice-clipboard/shared/types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_API_KEY || "";

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (API_KEY) {
    headers.set("X-API-Key", API_KEY);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.error || "API request failed");
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Transcribes audio using the API
 */
export async function transcribeAudio(
  audioBlob: Blob
): Promise<TranscriptionResult> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "audio.m4a");

  const url = `${API_BASE}/api/transcribe`;
  const headers = new Headers();
  if (API_KEY) {
    headers.set("X-API-Key", API_KEY);
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.error || "Transcription failed");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Saves a transcription to the database
 */
export async function saveTranscription(
  result: TranscriptionResult & { timestamp?: Date }
): Promise<{ insertedId: string }> {
  const timestamp = result.timestamp || new Date();
  const date = timestamp.toISOString().split("T")[0];

  return apiRequest<{ insertedId: string }>("/api/history", {
    method: "POST",
    body: JSON.stringify({
      text: result.text,
      duration: result.duration,
      timestamp: timestamp.toISOString(),
      date,
    }),
  });
}

/**
 * Gets list of days with transcription counts
 */
export async function getHistoryDays(): Promise<HistoryDay[]> {
  return apiRequest<HistoryDay[]>("/api/history/days");
}

/**
 * Gets all transcriptions for a specific day
 */
export async function getTranscriptionsByDay(
  date: string
): Promise<TranscriptionRecord[]> {
  const result = await apiRequest<TranscriptionRecord[]>(
    `/api/history/${date}`
  );
  // Convert timestamp strings to Date objects
  return result.map((t) => ({
    ...t,
    timestamp:
      typeof t.timestamp === "string" ? new Date(t.timestamp) : t.timestamp,
  }));
}


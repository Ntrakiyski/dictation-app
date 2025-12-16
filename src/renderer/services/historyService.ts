import type {
  TranscriptionResult,
  TranscriptionRecord,
  HistoryDay,
} from "../types";

interface DatabaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Saves a transcription to the database
 */
export async function saveTranscription(
  result: TranscriptionResult & { timestamp?: Date }
): Promise<{ insertedId: string }> {
  const timestamp = result.timestamp || new Date();
  const date = timestamp.toISOString().split("T")[0];
  const cost = (result.duration / 3600) * 0.04;

  const response = (await (window as any).electron.database.saveTranscription({
    text: result.text,
    duration: result.duration,
    cost,
    timestamp,
    date,
  })) as DatabaseResponse<{ insertedId: string }>;

  if (!response.success) {
    throw new Error(response.error || "Failed to save transcription");
  }

  return response.data!;
}

/**
 * Gets list of days with transcription counts
 */
export async function getHistoryDays(): Promise<HistoryDay[]> {
  const response = (await (window as any).electron.database.getHistoryDays()) as DatabaseResponse<HistoryDay[]>;

  if (!response.success) {
    throw new Error(response.error || "Failed to get history days");
  }

  return response.data || [];
}

/**
 * Gets all transcriptions for a specific day
 */
export async function getTranscriptionsByDay(
  date: string
): Promise<TranscriptionRecord[]> {
  const response = (await (window as any).electron.database.getTranscriptionsByDay(
    date
  )) as DatabaseResponse<TranscriptionRecord[]>;

  if (!response.success) {
    throw new Error(response.error || "Failed to get transcriptions");
  }

  return response.data || [];
}


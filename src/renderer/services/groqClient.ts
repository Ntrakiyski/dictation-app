import { Groq } from "groq-sdk";
import type { TranscriptionResult } from "../types";

/**
 * Transcribes audio using Groq Whisper API
 * @param audioBlob - The audio blob to transcribe
 * @returns Promise that resolves to the transcription result with text and duration
 * @throws Error if API key is missing or API call fails
 */
export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set. Please add VITE_GROQ_API_KEY to your .env file");
  }

  try {
    const groq = new Groq({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    // Convert Blob to File for Groq API
    const audioFile = new File([audioBlob], "audio.m4a", {
      type: "audio/mp4",
    });

    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3-turbo",
      temperature: 0,
      response_format: "verbose_json",
    });

    return {
      text: transcription.text || "",
      duration: transcription.duration || 0,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to transcribe audio");
  }
}


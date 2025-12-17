import { Groq } from "groq-sdk";
import type { TranscriptionResult } from "@voice-clipboard/shared/types";

/**
 * Transcribes audio using Groq Whisper API
 * @param audioFile - The audio file to transcribe
 * @returns Promise that resolves to the transcription result with text and duration
 * @throws Error if API key is missing or API call fails
 */
export async function transcribeAudio(
  audioFile: File | Express.Multer.File
): Promise<TranscriptionResult> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not set. Please add GROQ_API_KEY to your .env file"
    );
  }

  try {
    const groq = new Groq({
      apiKey,
    });

    const transcription = await groq.audio.transcriptions.create({
      file: audioFile as any,
      model: "whisper-large-v3-turbo",
      temperature: 0,
      response_format: "verbose_json",
    });

    // verbose_json returns duration but it's not in the TS types
    const result = transcription as any;
    
    return {
      text: result.text || "",
      duration: result.duration || 0,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to transcribe audio");
  }
}


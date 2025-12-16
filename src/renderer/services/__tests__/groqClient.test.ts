import { describe, it, expect, vi, beforeEach } from "vitest";
import { transcribeAudio } from "../groqClient";
import { Groq } from "groq-sdk";

// Mock Groq SDK
const mockCreate = vi.fn();
const mockGroqInstance = {
  audio: {
    transcriptions: {
      create: mockCreate,
    },
  },
};

vi.mock("groq-sdk", () => {
  const MockGroq = vi.fn().mockImplementation(() => mockGroqInstance);
  return {
    Groq: MockGroq,
  };
});

describe("groqClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default API key in env
    import.meta.env.VITE_GROQ_API_KEY = "test-api-key";
  });

  describe("transcribeAudio", () => {
    it("should transcribe audio successfully", async () => {
      const mockAudioBlob = new Blob(["audio data"], { type: "audio/mp4" });
      const expectedText = "This is the transcribed text";
      const expectedDuration = 1.26;

      mockCreate.mockResolvedValueOnce({
        text: expectedText,
        duration: expectedDuration,
      });

      const result = await transcribeAudio(mockAudioBlob);

      expect(Groq).toHaveBeenCalledWith({
        apiKey: "test-api-key",
        dangerouslyAllowBrowser: true,
      });
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "whisper-large-v3-turbo",
          temperature: 0,
          response_format: "verbose_json",
        })
      );
      expect(result).toEqual({
        text: expectedText,
        duration: expectedDuration,
      });
    });

    it("should handle API errors", async () => {
      const mockAudioBlob = new Blob(["audio data"], { type: "audio/mp4" });
      const error = new Error("API request failed");

      mockCreate.mockRejectedValueOnce(error);

      await expect(transcribeAudio(mockAudioBlob)).rejects.toThrow(
        "API request failed"
      );
    });

    it("should handle missing API key", async () => {
      import.meta.env.VITE_GROQ_API_KEY = "";
      const mockAudioBlob = new Blob(["audio data"], { type: "audio/mp4" });

      await expect(transcribeAudio(mockAudioBlob)).rejects.toThrow(
        "GROQ_API_KEY is not set"
      );
    });

    it("should handle empty transcription response", async () => {
      const mockAudioBlob = new Blob(["audio data"], { type: "audio/mp4" });

      mockCreate.mockResolvedValueOnce({
        text: "",
        duration: 0,
      });

      const result = await transcribeAudio(mockAudioBlob);

      expect(result).toEqual({
        text: "",
        duration: 0,
      });
    });

    it("should handle network timeout", async () => {
      const mockAudioBlob = new Blob(["audio data"], { type: "audio/mp4" });
      const error = new Error("Network timeout");

      mockCreate.mockRejectedValueOnce(error);

      await expect(transcribeAudio(mockAudioBlob)).rejects.toThrow(
        "Network timeout"
      );
    });

    it("should pass correct file format to API", async () => {
      const mockAudioBlob = new Blob(["audio data"], { type: "audio/mp4" });

      mockCreate.mockResolvedValueOnce({
        text: "test",
        duration: 1.0,
      });

      await transcribeAudio(mockAudioBlob);

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.file).toBeInstanceOf(File);
    });

    it("should handle missing duration in response", async () => {
      const mockAudioBlob = new Blob(["audio data"], { type: "audio/mp4" });
      const expectedText = "This is the transcribed text";

      mockCreate.mockResolvedValueOnce({
        text: expectedText,
        // duration is missing
      });

      const result = await transcribeAudio(mockAudioBlob);

      expect(result).toEqual({
        text: expectedText,
        duration: 0,
      });
    });
  });
});


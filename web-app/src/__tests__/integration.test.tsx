import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import * as apiClient from "../services/apiClient";
import * as clipboard from "../utils/clipboard";

// Mock API client
vi.mock("../services/apiClient");
vi.mock("../utils/clipboard");
vi.mock("../utils/soundNotification", () => ({
  playSuccessSound: vi.fn(),
}));

describe("PWA Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock MediaRecorder
    global.MediaRecorder = vi.fn().mockImplementation(() => ({
      start: vi.fn(),
      stop: vi.fn(),
      ondataavailable: null,
      onstop: null,
      state: "inactive",
    })) as any;

    // Mock getUserMedia
    global.navigator.mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
    } as any;
  });

  it("should complete full recording workflow", async () => {
    const user = userEvent.setup();
    
    // Mock transcription response
    const mockTranscription = {
      text: "Hello world",
      duration: 2.5,
    };
    
    vi.mocked(apiClient.transcribeAudio).mockResolvedValue(mockTranscription);
    vi.mocked(apiClient.saveTranscription).mockResolvedValue({
      insertedId: "test-id",
    });
    vi.mocked(clipboard.copyToClipboard).mockResolvedValue();

    render(<App />);

    // Find and click record button
    const recordButton = screen.getByLabelText(/start recording/i);
    await user.click(recordButton);

    // Should show recording status
    await waitFor(() => {
      expect(screen.getByText(/listening/i)).toBeInTheDocument();
    });

    // Stop recording
    const stopButton = screen.getByLabelText(/stop recording/i);
    await user.click(stopButton);

    // Should transcribe and show result
    await waitFor(() => {
      expect(apiClient.transcribeAudio).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText("Hello world")).toBeInTheDocument();
    });

    // Should save to database
    expect(apiClient.saveTranscription).toHaveBeenCalled();

    // Should copy to clipboard
    expect(clipboard.copyToClipboard).toHaveBeenCalledWith("Hello world");
  });

  it("should handle transcription errors gracefully", async () => {
    const user = userEvent.setup();
    
    vi.mocked(apiClient.transcribeAudio).mockRejectedValue(
      new Error("Transcription failed")
    );

    render(<App />);

    const recordButton = screen.getByLabelText(/start recording/i);
    await user.click(recordButton);

    const stopButton = screen.getByLabelText(/stop recording/i);
    await user.click(stopButton);

    // Should show error state
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});


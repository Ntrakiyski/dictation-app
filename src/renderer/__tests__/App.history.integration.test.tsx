import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { AudioRecorder } from "../utils/audioRecorder";
import { transcribeAudio } from "../services/groqClient";
import { copyToClipboard } from "../utils/clipboard";
import { HotkeyManager } from "../utils/hotkeyManager";
import * as historyService from "../services/historyService";

// Mock all dependencies
vi.mock("../utils/audioRecorder");
vi.mock("../services/groqClient");
vi.mock("../utils/clipboard");
vi.mock("../utils/hotkeyManager");
vi.mock("../services/historyService");

// Mock window
global.window = global.window || ({} as any);
if (typeof HTMLElement === "undefined") {
  (global as any).HTMLElement = class HTMLElement {};
}

const mockStartRecording = vi.fn();
const mockStopRecording = vi.fn().mockResolvedValue(
  new Blob(["audio"], { type: "audio/mp4" })
);
const mockIsRecording = vi.fn().mockReturnValue(false);

const MockAudioRecorder = vi.fn().mockImplementation(() => ({
  startRecording: mockStartRecording,
  stopRecording: mockStopRecording,
  isRecording: mockIsRecording,
}));

vi.mocked(AudioRecorder).mockImplementation(
  () => new MockAudioRecorder() as any
);

vi.mocked(transcribeAudio).mockResolvedValue({
  text: "transcribed text",
  duration: 1.26,
});
vi.mocked(copyToClipboard).mockResolvedValue(undefined);

const mockRegister = vi.fn();
const mockUnregister = vi.fn();
const mockIsRegistered = vi.fn().mockReturnValue(false);

vi.mocked(HotkeyManager).mockImplementation(
  () =>
    ({
      register: mockRegister,
      unregister: mockUnregister,
      isRegistered: mockIsRegistered,
    }) as any
);

// Mock Electron IPC
const mockInvoke = vi.fn();
const mockOn = vi.fn();
global.window = {
  electron: {
    ipcRenderer: {
      invoke: mockInvoke,
      on: mockOn,
      removeAllListeners: vi.fn(),
    },
    clipboard: {
      writeText: mockInvoke,
    },
    database: {
      saveTranscription: mockInvoke,
      getHistoryDays: mockInvoke,
      getTranscriptionsByDay: mockInvoke,
    },
  },
} as any;

describe("App History Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsRecording.mockReturnValue(false);
    mockInvoke.mockImplementation((channel: string) => {
      if (channel === "clipboard:writeText") {
        return Promise.resolve({ success: true });
      }
      if (channel === "db:saveTranscription") {
        return Promise.resolve({
          success: true,
          data: { insertedId: "507f1f77bcf86cd799439011" },
        });
      }
      if (channel === "db:getHistoryDays") {
        return Promise.resolve({
          success: true,
          data: [{ date: "2025-12-16", count: 1 }],
        });
      }
      if (channel === "db:getTranscriptionsByDay") {
        return Promise.resolve({
          success: true,
          data: [
            {
              _id: "507f1f77bcf86cd799439011",
              text: "transcribed text",
              duration: 1.26,
              cost: 0.000014,
              timestamp: new Date("2025-12-16T10:00:00Z"),
              date: "2025-12-16",
            },
          ],
        });
      }
      return Promise.resolve({ success: true });
    });
  });

  it("should save transcription to database after successful transcription", async () => {
    mockIsRecording.mockReturnValueOnce(true).mockReturnValueOnce(false);
    mockStopRecording.mockResolvedValueOnce(
      new Blob(["audio"], { type: "audio/mp4" })
    );

    render(<App />);

    const hotkeyCallback = mockRegister.mock.calls[0][0];
    hotkeyCallback(); // Start recording
    hotkeyCallback(); // Stop recording and transcribe

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith(
        "db:saveTranscription",
        expect.objectContaining({
          text: "transcribed text",
          duration: 1.26,
        })
      );
    });
  });

  it("should display history sidebar with days", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/history/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("db:getHistoryDays");
    });
  });

  it("should load transcriptions when date is selected", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/today|yesterday|dec/i)).toBeInTheDocument();
    });

    const dateButton = screen.getByText(/today|yesterday|dec/i);
    await userEvent.click(dateButton);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith(
        "db:getTranscriptionsByDay",
        "2025-12-16"
      );
    });
  });

  it("should display transcription cards when viewing history", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/today|yesterday|dec/i)).toBeInTheDocument();
    });

    const dateButton = screen.getByText(/today|yesterday|dec/i);
    await userEvent.click(dateButton);

    await waitFor(() => {
      expect(screen.getByText("transcribed text")).toBeInTheDocument();
    });
  });

  it("should handle database save failure gracefully", async () => {
    mockIsRecording.mockReturnValueOnce(true).mockReturnValueOnce(false);
    mockStopRecording.mockResolvedValueOnce(
      new Blob(["audio"], { type: "audio/mp4" })
    );

    mockInvoke.mockImplementation((channel: string) => {
      if (channel === "db:saveTranscription") {
        return Promise.resolve({
          success: false,
          error: "Database error",
        });
      }
      if (channel === "clipboard:writeText") {
        return Promise.resolve({ success: true });
      }
      return Promise.resolve({ success: true });
    });

    render(<App />);

    const hotkeyCallback = mockRegister.mock.calls[0][0];
    hotkeyCallback(); // Start
    hotkeyCallback(); // Stop

    // Should still show transcription result even if save fails
    await waitFor(() => {
      expect(screen.getByText("transcribed text")).toBeInTheDocument();
    });
  });

  it("should show empty state when no history exists", async () => {
    mockInvoke.mockImplementation((channel: string) => {
      if (channel === "db:getHistoryDays") {
        return Promise.resolve({
          success: true,
          data: [],
        });
      }
      return Promise.resolve({ success: true });
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/no history/i)).toBeInTheDocument();
    });
  });
});


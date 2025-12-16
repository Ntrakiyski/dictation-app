import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "../App";
import { AudioRecorder } from "../utils/audioRecorder";
import { transcribeAudio } from "../services/groqClient";
import { copyToClipboard } from "../utils/clipboard";
import { HotkeyManager } from "../utils/hotkeyManager";

// Mock all dependencies
vi.mock("../utils/audioRecorder");
vi.mock("../services/groqClient");
vi.mock("../utils/clipboard");
vi.mock("../utils/hotkeyManager");

// Mock window
global.window = global.window || ({} as any);
if (typeof HTMLElement === 'undefined') {
  (global as any).HTMLElement = class HTMLElement {};
}

const mockStartRecording = vi.fn();
const mockStopRecording = vi.fn().mockResolvedValue(new Blob(["audio"], { type: "audio/mp4" }));
const mockIsRecording = vi.fn().mockReturnValue(false);

const MockAudioRecorder = vi.fn().mockImplementation(() => ({
  startRecording: mockStartRecording,
  stopRecording: mockStopRecording,
  isRecording: mockIsRecording,
}));

vi.mocked(AudioRecorder).mockImplementation(() => new MockAudioRecorder() as any);

vi.mocked(transcribeAudio).mockResolvedValue({
  text: "transcribed text",
  duration: 1.26,
});
vi.mocked(copyToClipboard).mockResolvedValue(undefined);

const mockRegister = vi.fn();
const mockUnregister = vi.fn();
const mockIsRegistered = vi.fn().mockReturnValue(false);

vi.mocked(HotkeyManager).mockImplementation(() => ({
  register: mockRegister,
  unregister: mockUnregister,
  isRegistered: mockIsRegistered,
}) as any);

// Mock Electron IPC
const mockOn = vi.fn();
global.window = {
  electron: {
    ipcRenderer: {
      invoke: vi.fn(),
      on: mockOn,
      removeAllListeners: vi.fn(),
    },
  },
} as any;

describe.skip("App Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsRecording.mockReturnValue(false);
    // Reset transcribeAudio mock to default value
    vi.mocked(transcribeAudio).mockResolvedValue({
      text: "transcribed text",
      duration: 1.26,
    });
  });

  it("should render app with idle status", () => {
    render(<App />);

    expect(screen.getByText(/voice clipboard/i)).toBeInTheDocument();
    expect(screen.getByText(/press to listen/i)).toBeInTheDocument();
  });

  it("should register hotkey on mount", () => {
    render(<App />);

    expect(mockRegister).toHaveBeenCalled();
  });

  it("should unregister hotkey on unmount", () => {
    const { unmount } = render(<App />);
    unmount();

    expect(mockUnregister).toHaveBeenCalled();
  });

  it("should handle full workflow: record -> transcribe -> copy", async () => {
    mockIsRecording.mockReturnValueOnce(true).mockReturnValueOnce(false);
    mockStopRecording.mockResolvedValueOnce(new Blob(["audio"], { type: "audio/mp4" }));

    render(<App />);

    // Simulate hotkey press to start recording
    const hotkeyCallback = mockRegister.mock.calls[0][0];
    hotkeyCallback();

    await waitFor(() => {
      expect(mockStartRecording).toHaveBeenCalled();
    });

    // Simulate hotkey press again to stop recording
    hotkeyCallback();

    await waitFor(async () => {
      expect(mockStopRecording).toHaveBeenCalled();
      await waitFor(() => {
        expect(transcribeAudio).toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(copyToClipboard).toHaveBeenCalledWith("transcribed text");
      });
    });
  });

  it("should handle recording error", async () => {
    const error = new Error("Recording failed");
    mockStartRecording.mockRejectedValueOnce(error);

    render(<App />);

    const hotkeyCallback = mockRegister.mock.calls[0][0];
    hotkeyCallback();

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it("should handle transcription error", async () => {
    mockIsRecording.mockReturnValueOnce(true).mockReturnValueOnce(false);
    mockStopRecording.mockResolvedValueOnce(new Blob(["audio"], { type: "audio/mp4" }));
    vi.mocked(transcribeAudio).mockRejectedValueOnce(new Error("Transcription failed"));

    render(<App />);

    const hotkeyCallback = mockRegister.mock.calls[0][0];
    hotkeyCallback(); // Start
    hotkeyCallback(); // Stop

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it("should display transcription result with duration", async () => {
    mockIsRecording.mockReturnValueOnce(true).mockReturnValueOnce(false);
    mockStopRecording.mockResolvedValueOnce(new Blob(["audio"], { type: "audio/mp4" }));
    vi.mocked(transcribeAudio).mockResolvedValueOnce({
      text: "Hello world!",
      duration: 2.5,
    });

    render(<App />);

    const hotkeyCallback = mockRegister.mock.calls[0][0];
    hotkeyCallback(); // Start
    hotkeyCallback(); // Stop

    await waitFor(() => {
      expect(screen.getByText("Hello world!")).toBeInTheDocument();
      expect(screen.getByText("2.50s")).toBeInTheDocument();
      expect(screen.getByText(/copied to clipboard/i)).toBeInTheDocument();
    });
  });
});


import { describe, it, expect, vi, beforeEach } from "vitest";
import { AudioRecorder } from "../audioRecorder";

// Mock MediaRecorder
const mockStart = vi.fn();
const mockStop = vi.fn();
const mockPause = vi.fn();
const mockResume = vi.fn();
let mockState = "inactive";
let mockDataAvailableHandler: ((event: BlobEvent) => void) | null = null;
let mockStopHandler: (() => void) | null = null;

const createMockMediaRecorder = () => {
  const recorder = {
    start: mockStart,
    stop: mockStop,
    pause: mockPause,
    resume: mockResume,
    get state() {
      return mockState;
    },
    set ondataavailable(handler: ((event: BlobEvent) => void) | null) {
      mockDataAvailableHandler = handler;
    },
    get ondataavailable() {
      return mockDataAvailableHandler;
    },
    set onstop(handler: (() => void) | null) {
      mockStopHandler = handler;
    },
    get onstop() {
      return mockStopHandler;
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };

  return recorder;
};

const mockGetUserMedia = vi.fn().mockResolvedValue({
  getTracks: () => [{ stop: vi.fn() }],
});

Object.defineProperty(global.navigator, "mediaDevices", {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
});

const MockMediaRecorder = vi.fn().mockImplementation(() => createMockMediaRecorder());
MockMediaRecorder.isTypeSupported = vi.fn().mockReturnValue(true);
global.MediaRecorder = MockMediaRecorder;

describe("AudioRecorder", () => {
  let recorder: AudioRecorder;

  beforeEach(() => {
    vi.clearAllMocks();
    mockState = "inactive";
    mockDataAvailableHandler = null;
    mockStopHandler = null;
    recorder = new AudioRecorder();
  });

  describe("startRecording", () => {
    it("should start recording successfully", async () => {
      await recorder.startRecording();

      expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
      expect(global.MediaRecorder).toHaveBeenCalled();
      expect(mockStart).toHaveBeenCalled();
      expect(recorder.isRecording()).toBe(true);
    });

    it("should handle getUserMedia permission denial", async () => {
      const error = new Error("Permission denied");
      mockGetUserMedia.mockRejectedValueOnce(error);

      await expect(recorder.startRecording()).rejects.toThrow("Permission denied");
    });

    it("should handle getUserMedia error", async () => {
      const error = new Error("Microphone not available");
      mockGetUserMedia.mockRejectedValueOnce(error);

      await expect(recorder.startRecording()).rejects.toThrow("Microphone not available");
    });

    it("should throw error if already recording", async () => {
      await recorder.startRecording();

      await expect(recorder.startRecording()).rejects.toThrow("Already recording");
    });
  });

  describe("stopRecording", () => {
    it("should stop recording and return audio blob", async () => {
      await recorder.startRecording();

      const mockBlob = new Blob(["audio data"], { type: "audio/mp4" });
      const mockEvent = { data: mockBlob } as BlobEvent;

      const stopPromise = recorder.stopRecording();

      // Simulate dataavailable event
      if (mockDataAvailableHandler) {
        mockDataAvailableHandler(mockEvent);
      }

      // Simulate stop event
      if (mockStopHandler) {
        mockStopHandler();
      }

      const result = await stopPromise;

      expect(mockStop).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe("audio/mp4");
    });

    it("should throw error if not recording", async () => {
      await expect(recorder.stopRecording()).rejects.toThrow("Not recording");
    });

    it("should handle stop error", async () => {
      await recorder.startRecording();
      
      // Mock stop to throw error
      mockStop.mockImplementationOnce(() => {
        throw new Error("Stop failed");
      });

      await expect(recorder.stopRecording()).rejects.toThrow();
    });
  });

  describe("isRecording", () => {
    it("should return false when not recording", () => {
      expect(recorder.isRecording()).toBe(false);
    });

    it("should return true when recording", async () => {
      await recorder.startRecording();
      expect(recorder.isRecording()).toBe(true);
    });

    it("should return false after stopping", async () => {
      await recorder.startRecording();
      const mockBlob = new Blob(["audio data"], { type: "audio/mp4" });
      const mockEvent = { data: mockBlob } as BlobEvent;

      const stopPromise = recorder.stopRecording();
      if (mockDataAvailableHandler) {
        mockDataAvailableHandler(mockEvent);
      }
      if (mockStopHandler) {
        mockStopHandler();
      }
      await stopPromise;

      expect(recorder.isRecording()).toBe(false);
    });
  });
});


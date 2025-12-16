import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Electron APIs
global.electron = {
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeAllListeners: vi.fn(),
  },
  clipboard: {
    writeText: vi.fn().mockResolvedValue({ success: true }),
  },
} as any;

// Setup environment variables for tests
import.meta.env.VITE_GROQ_API_KEY = "test-api-key";

// Mock MediaRecorder
global.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  state: "inactive",
  ondataavailable: null,
  onerror: null,
  onstart: null,
  onstop: null,
  onpause: null,
  onresume: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})) as any;

// Mock MediaRecorder static methods
(global.MediaRecorder as any).isTypeSupported = vi.fn().mockReturnValue(true);

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, "mediaDevices", {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    }),
  },
  writable: true,
});

// Mock window.HTMLElement for React testing
if (typeof window !== "undefined") {
  (global as any).HTMLElement = window.HTMLElement;
}


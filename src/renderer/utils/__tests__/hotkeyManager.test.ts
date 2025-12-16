import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HotkeyManager } from "../hotkeyManager";

// Mock Electron IPC
const mockOn = vi.fn();
const mockRemoveAllListeners = vi.fn();

const mockElectron = {
  ipcRenderer: {
    invoke: vi.fn(),
    on: mockOn,
    removeAllListeners: mockRemoveAllListeners,
  },
};

global.window = {
  electron: mockElectron,
} as any;

describe("HotkeyManager", () => {
  let hotkeyManager: HotkeyManager;
  let mockCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCallback = vi.fn();
    hotkeyManager = new HotkeyManager();
  });

  afterEach(() => {
    hotkeyManager.unregister();
  });

  describe("register", () => {
    it("should register hotkey listener", () => {
      hotkeyManager.register(mockCallback);

      expect(mockOn).toHaveBeenCalledWith("hotkey-pressed", expect.any(Function));
    });

    it("should call callback when hotkey is pressed", () => {
      hotkeyManager.register(mockCallback);

      // Simulate hotkey press
      const handler = mockOn.mock.calls[0][1];
      handler();

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple hotkey presses", () => {
      hotkeyManager.register(mockCallback);

      const handler = mockOn.mock.calls[0][1];
      handler();
      handler();
      handler();

      expect(mockCallback).toHaveBeenCalledTimes(3);
    });

    it("should throw error if already registered", () => {
      hotkeyManager.register(mockCallback);

      expect(() => hotkeyManager.register(mockCallback)).toThrow(
        "Hotkey already registered"
      );
    });
  });

  describe("unregister", () => {
    it("should remove hotkey listener", () => {
      hotkeyManager.register(mockCallback);
      hotkeyManager.unregister();

      expect(mockRemoveAllListeners).toHaveBeenCalledWith("hotkey-pressed");
    });

    it("should allow re-registration after unregister", () => {
      hotkeyManager.register(mockCallback);
      hotkeyManager.unregister();
      hotkeyManager.register(mockCallback);

      expect(mockOn).toHaveBeenCalledTimes(2);
    });

    it("should not throw if not registered", () => {
      expect(() => hotkeyManager.unregister()).not.toThrow();
    });
  });

  describe("isRegistered", () => {
    it("should return false when not registered", () => {
      expect(hotkeyManager.isRegistered()).toBe(false);
    });

    it("should return true when registered", () => {
      hotkeyManager.register(mockCallback);
      expect(hotkeyManager.isRegistered()).toBe(true);
    });

    it("should return false after unregister", () => {
      hotkeyManager.register(mockCallback);
      hotkeyManager.unregister();
      expect(hotkeyManager.isRegistered()).toBe(false);
    });
  });
});


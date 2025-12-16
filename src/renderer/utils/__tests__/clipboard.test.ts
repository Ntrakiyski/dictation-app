import { describe, it, expect, vi, beforeEach } from "vitest";
import { copyToClipboard } from "../clipboard";

// Mock Electron clipboard API
const mockWriteText = vi.fn().mockResolvedValue({ success: true });

(global as any).window = {
  electron: {
    clipboard: {
      writeText: mockWriteText,
    },
  },
};

describe("clipboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteText.mockResolvedValue({ success: true });
  });

  describe("copyToClipboard", () => {
    it("should copy text to clipboard successfully", async () => {
      const text = "test text";
      
      await copyToClipboard(text);

      expect(mockWriteText).toHaveBeenCalledWith(text);
      expect(mockWriteText).toHaveBeenCalledTimes(1);
    });

    it("should handle empty string", async () => {
      const text = "";

      await copyToClipboard(text);

      expect(mockWriteText).toHaveBeenCalledWith("");
    });

    it("should handle long text", async () => {
      const text = "a".repeat(10000);

      await copyToClipboard(text);

      expect(mockWriteText).toHaveBeenCalledWith(text);
    });

    it("should throw error when clipboard write fails", async () => {
      mockWriteText.mockResolvedValueOnce({ success: false, error: "Write failed" });
      const text = "test text";

      await expect(copyToClipboard(text)).rejects.toThrow("Write failed");
    });

    it("should throw error when clipboard API is not available", async () => {
      const originalElectron = (global as any).window.electron;
      (global as any).window.electron = undefined;
      const text = "test text";

      await expect(copyToClipboard(text)).rejects.toThrow("Electron clipboard API not available");
      
      (global as any).window.electron = originalElectron;
    });

    it("should handle special characters", async () => {
      const text = "Hello\nWorld\tTest";

      await copyToClipboard(text);

      expect(mockWriteText).toHaveBeenCalledWith(text);
    });
  });
});


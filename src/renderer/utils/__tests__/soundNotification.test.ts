import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { playSuccessSound } from "../soundNotification";

describe("soundNotification", () => {
  let mockAudioContext: any;
  let mockOscillator: any;
  let mockGainNode: any;

  beforeEach(() => {
    // Mock oscillator
    mockOscillator = {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 0 },
      type: "",
      onended: null,
    };

    // Mock gain node
    mockGainNode = {
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    };

    // Mock AudioContext
    mockAudioContext = {
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      createGain: vi.fn().mockReturnValue(mockGainNode),
      close: vi.fn().mockResolvedValue(undefined),
      currentTime: 0,
      destination: {},
    };

    // Set up window.AudioContext
    (window as any).AudioContext = vi.fn().mockImplementation(() => mockAudioContext);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("playSuccessSound", () => {
    it("should create audio context and play beep", () => {
      playSuccessSound();

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode);
      expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);
    });

    it("should configure oscillator with correct frequency", () => {
      playSuccessSound();

      expect(mockOscillator.frequency.value).toBe(800);
      expect(mockOscillator.type).toBe("sine");
    });

    it("should start and stop oscillator", () => {
      playSuccessSound();

      expect(mockOscillator.start).toHaveBeenCalledWith(0);
      expect(mockOscillator.stop).toHaveBeenCalledWith(0.15);
    });

    it("should set up gain envelope", () => {
      playSuccessSound();

      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.3, 0.01);
      expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.01, 0.15);
    });

    it("should close audio context when oscillator ends", () => {
      playSuccessSound();

      expect(mockOscillator.onended).toBeDefined();
      
      // Simulate oscillator ending
      if (mockOscillator.onended) {
        mockOscillator.onended();
      }

      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it("should not throw error if AudioContext fails", () => {
      (window as any).AudioContext = undefined;

      expect(() => playSuccessSound()).not.toThrow();
    });

    it("should handle webkit prefix for Safari", () => {
      delete (window as any).AudioContext;
      (window as any).webkitAudioContext = vi.fn().mockImplementation(() => mockAudioContext);

      playSuccessSound();

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });
  });
});


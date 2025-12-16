import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TranscriptionCard } from "../TranscriptionCard";
import type { TranscriptionRecord } from "@/types";

describe("TranscriptionCard", () => {
  const mockTranscription: TranscriptionRecord = {
    _id: "507f1f77bcf86cd799439011",
    text: "This is a test transcription",
    duration: 5.5,
    cost: 0.000061,
    timestamp: new Date("2025-12-16T10:30:00Z"),
    date: "2025-12-16",
  };

  it("should render transcription text", () => {
    render(<TranscriptionCard transcription={mockTranscription} />);
    expect(screen.getByText("This is a test transcription")).toBeInTheDocument();
  });

  it("should display duration", () => {
    render(<TranscriptionCard transcription={mockTranscription} />);
    expect(screen.getByText(/5\.50s/)).toBeInTheDocument();
  });

  it("should display cost", () => {
    render(<TranscriptionCard transcription={mockTranscription} />);
    expect(screen.getByText(/\$0\.000061/)).toBeInTheDocument();
  });

  it("should format timestamp correctly", () => {
    render(<TranscriptionCard transcription={mockTranscription} />);
    // Should show time in format like "10:30 AM" or "10:30"
    const timeElement = screen.getByText(/10:30/);
    expect(timeElement).toBeInTheDocument();
  });

  it("should handle string timestamp", () => {
    const transcriptionWithStringDate: TranscriptionRecord = {
      ...mockTranscription,
      timestamp: "2025-12-16T10:30:00Z" as any,
    };
    render(<TranscriptionCard transcription={transcriptionWithStringDate} />);
    expect(screen.getByText("This is a test transcription")).toBeInTheDocument();
  });
});


import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { HistoryView } from "../HistoryView";
import * as historyService from "@/services/historyService";

vi.mock("@/services/historyService");

describe("HistoryView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display message when no date is selected", () => {
    render(<HistoryView date={null} />);
    expect(
      screen.getByText(/select a date to view transcriptions/i)
    ).toBeInTheDocument();
  });

  it("should display loading state", async () => {
    vi.spyOn(historyService, "getTranscriptionsByDay").mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<HistoryView date="2025-12-16" />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should display transcriptions for selected date", async () => {
    const mockTranscriptions = [
      {
        _id: "1",
        text: "First transcription",
        duration: 5.5,
        cost: 0.000061,
        timestamp: new Date("2025-12-16T10:00:00Z"),
        date: "2025-12-16",
      },
      {
        _id: "2",
        text: "Second transcription",
        duration: 3.2,
        cost: 0.000036,
        timestamp: new Date("2025-12-16T11:00:00Z"),
        date: "2025-12-16",
      },
    ];

    vi.spyOn(historyService, "getTranscriptionsByDay").mockResolvedValue(
      mockTranscriptions as any
    );

    render(<HistoryView date="2025-12-16" />);

    await waitFor(() => {
      expect(screen.getByText("First transcription")).toBeInTheDocument();
      expect(screen.getByText("Second transcription")).toBeInTheDocument();
    });
  });

  it("should display empty state when no transcriptions", async () => {
    vi.spyOn(historyService, "getTranscriptionsByDay").mockResolvedValue([]);

    render(<HistoryView date="2025-12-16" />);

    await waitFor(() => {
      expect(
        screen.getByText(/no transcriptions found/i)
      ).toBeInTheDocument();
    });
  });

  it("should display error message on failure", async () => {
    vi.spyOn(historyService, "getTranscriptionsByDay").mockRejectedValue(
      new Error("Failed to load")
    );

    render(<HistoryView date="2025-12-16" />);

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });

  it("should reload when date changes", async () => {
    const getTranscriptionsByDaySpy = vi
      .spyOn(historyService, "getTranscriptionsByDay")
      .mockResolvedValue([]);

    const { rerender } = render(<HistoryView date="2025-12-16" />);

    await waitFor(() => {
      expect(getTranscriptionsByDaySpy).toHaveBeenCalledWith("2025-12-16");
    });

    rerender(<HistoryView date="2025-12-15" />);

    await waitFor(() => {
      expect(getTranscriptionsByDaySpy).toHaveBeenCalledWith("2025-12-15");
    });
  });
});


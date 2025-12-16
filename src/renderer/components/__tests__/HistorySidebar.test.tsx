import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HistorySidebar } from "../HistorySidebar";
import * as historyService from "@/services/historyService";

vi.mock("@/services/historyService");

describe("HistorySidebar", () => {
  const mockOnDateSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display loading state initially", async () => {
    vi.spyOn(historyService, "getHistoryDays").mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <HistorySidebar selectedDate={null} onDateSelect={mockOnDateSelect} />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should display history days", async () => {
    const mockDays = [
      { date: "2025-12-16", count: 3 },
      { date: "2025-12-15", count: 5 },
    ];

    vi.spyOn(historyService, "getHistoryDays").mockResolvedValue(mockDays);

    render(
      <HistorySidebar selectedDate={null} onDateSelect={mockOnDateSelect} />
    );

    await waitFor(() => {
      expect(screen.getByText(/today|yesterday|dec/i)).toBeInTheDocument();
    });
  });

  it("should call onDateSelect when date is clicked", async () => {
    const mockDays = [{ date: "2025-12-16", count: 3 }];

    vi.spyOn(historyService, "getHistoryDays").mockResolvedValue(mockDays);

    render(
      <HistorySidebar selectedDate={null} onDateSelect={mockOnDateSelect} />
    );

    await waitFor(() => {
      const button = screen.getByText(/today|yesterday|dec/i);
      userEvent.click(button);
    });

    await waitFor(() => {
      expect(mockOnDateSelect).toHaveBeenCalledWith("2025-12-16");
    });
  });

  it("should highlight selected date", async () => {
    const mockDays = [
      { date: "2025-12-16", count: 3 },
      { date: "2025-12-15", count: 5 },
    ];

    vi.spyOn(historyService, "getHistoryDays").mockResolvedValue(mockDays);

    render(
      <HistorySidebar
        selectedDate="2025-12-16"
        onDateSelect={mockOnDateSelect}
      />
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      expect(buttons[0]).toHaveClass("bg-sidebar-active");
    });
  });

  it("should display error message on failure", async () => {
    vi.spyOn(historyService, "getHistoryDays").mockRejectedValue(
      new Error("Failed to load")
    );

    render(
      <HistorySidebar selectedDate={null} onDateSelect={mockOnDateSelect} />
    );

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });

  it("should display empty state when no history", async () => {
    vi.spyOn(historyService, "getHistoryDays").mockResolvedValue([]);

    render(
      <HistorySidebar selectedDate={null} onDateSelect={mockOnDateSelect} />
    );

    await waitFor(() => {
      expect(screen.getByText(/no history/i)).toBeInTheDocument();
    });
  });
});


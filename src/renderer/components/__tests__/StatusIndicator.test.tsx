import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusIndicator } from "../StatusIndicator";
import type { RecordingState } from "@/types";

describe("StatusIndicator", () => {
  const states: RecordingState[] = [
    "idle",
    "recording",
    "transcribing",
    "success",
    "error",
  ];

  states.forEach((state) => {
    it(`should render ${state} state`, () => {
      render(<StatusIndicator status={state} />);
      const element = screen.getByRole("status", { hidden: true });
      expect(element).toBeInTheDocument();
    });
  });

  it("should display 'Press to listen' when idle", () => {
    render(<StatusIndicator status="idle" />);
    expect(screen.getByText(/press to listen/i)).toBeInTheDocument();
  });

  it("should display 'Listening...' when recording", () => {
    render(<StatusIndicator status="recording" />);
    expect(screen.getByText(/listening/i)).toBeInTheDocument();
  });

  it("should display transcribing message when transcribing", () => {
    render(<StatusIndicator status="transcribing" />);
    expect(screen.getByText(/transcribing/i)).toBeInTheDocument();
  });

  it("should display success message when successful", () => {
    render(<StatusIndicator status="success" />);
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });

  it("should display error message when error", () => {
    render(<StatusIndicator status="error" />);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it("should have correct variant for each state", () => {
    const { rerender } = render(<StatusIndicator status="idle" />);
    let badge = screen.getByText(/press to listen/i);
    expect(badge).toHaveClass("bg-secondary");

    rerender(<StatusIndicator status="recording" />);
    badge = screen.getByText(/listening/i);
    expect(badge).toHaveClass("bg-destructive");

    rerender(<StatusIndicator status="transcribing" />);
    badge = screen.getByText(/transcribing/i);
    expect(badge).toHaveClass("bg-primary");

    rerender(<StatusIndicator status="success" />);
    badge = screen.getByText(/success/i);
    expect(badge).toHaveClass("bg-success");

    rerender(<StatusIndicator status="error" />);
    badge = screen.getByText(/error/i);
    expect(badge).toHaveClass("bg-destructive");
  });
});


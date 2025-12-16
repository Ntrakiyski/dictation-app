import { Button } from "./ui/button";
import { Mic, Square } from "lucide-react";
import type { RecordingState } from "@voice-clipboard/shared/types";

interface RecordButtonProps {
  status: RecordingState;
  onToggle: () => void;
  disabled?: boolean;
}

export function RecordButton({
  status,
  onToggle,
  disabled = false,
}: RecordButtonProps) {
  const isRecording = status === "recording";
  const isProcessing = status === "transcribing";

  return (
    <Button
      onClick={onToggle}
      disabled={disabled || isProcessing}
      size="lg"
      variant={isRecording ? "destructive" : "default"}
      className={`
        h-20 w-20 rounded-full p-0
        ${isRecording ? "animate-pulse" : ""}
        ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
        touch-manipulation
        max-md:h-24 max-md:w-24
        shadow-lg hover:shadow-xl
        transition-all duration-200
      `}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
    >
      {isRecording ? (
        <Square className="h-8 w-8 max-md:h-10 max-md:w-10" />
      ) : (
        <Mic className="h-8 w-8 max-md:h-10 max-md:w-10" />
      )}
    </Button>
  );
}


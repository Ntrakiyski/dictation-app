import { Badge } from "./ui/badge";
import type { RecordingState } from "@/types";

interface StatusIndicatorProps {
  status: RecordingState;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "idle":
        return {
          label: "Press to listen",
          variant: "secondary" as const,
          className: "text-small",
        };
      case "recording":
        return {
          label: "Listening...",
          variant: "destructive" as const,
          className: "text-small",
        };
      case "transcribing":
        return {
          label: "Transcribing...",
          variant: "default" as const,
          className: "text-small text-white",
        };
      case "success":
        return {
          label: "Success",
          className: "bg-success text-white border-success text-small",
        };
      case "error":
        return {
          label: "Error",
          variant: "destructive" as const,
          className: "text-small",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant={"variant" in config ? config.variant : undefined} 
      role="status" 
      className={config.className}
    >
      {config.label}
    </Badge>
  );
}


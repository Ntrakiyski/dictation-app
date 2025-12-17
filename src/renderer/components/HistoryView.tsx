import { useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { TranscriptionCard } from "./TranscriptionCard";
import { getTranscriptionsByDay } from "@/services/historyService";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";
import type { TranscriptionRecord } from "@/types";

interface HistoryViewProps {
  date: string | null;
  refreshTrigger?: number;
}

export function HistoryView({ date, refreshTrigger }: HistoryViewProps) {
  const [transcriptions, setTranscriptions] = useState<TranscriptionRecord[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState<number>(0);

  const loadTranscriptions = async () => {
    if (!date) {
      setTranscriptions([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getTranscriptionsByDay(date);
      // Convert timestamp strings to Date objects
      const processed = data.map((t) => ({
        ...t,
        timestamp:
          typeof t.timestamp === "string"
            ? new Date(t.timestamp)
            : t.timestamp,
      }));
      setTranscriptions(processed);
      setLastCheckedAt(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load transcriptions"
      );
      setLastCheckedAt(new Date());
    } finally {
      setLoading(false);
    }
  };

  // Load transcriptions when date or refreshTrigger changes
  useEffect(() => {
    loadTranscriptions();
  }, [date, refreshTrigger]);

  // Auto-polling every 3 seconds when viewing history
  useEffect(() => {
    if (!date) return;

    const intervalId = setInterval(() => {
      loadTranscriptions();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [date]);

  // Update "seconds ago" display every second
  useEffect(() => {
    if (!lastCheckedAt) return;

    const updateSecondsAgo = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - lastCheckedAt.getTime()) / 1000);
      setSecondsAgo(diff);
    };

    // Update immediately
    updateSecondsAgo();

    // Then update every second
    const intervalId = setInterval(updateSecondsAgo, 1000);

    return () => clearInterval(intervalId);
  }, [lastCheckedAt]);

  if (!date) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-body">Select a date to view transcriptions</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-body text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-body text-destructive">{error}</p>
      </div>
    );
  }

  if (transcriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-body">No transcriptions found for this date</p>
      </div>
    );
  }

  // Check if viewing "Today"
  const today = new Date().toISOString().split("T")[0];
  const isToday = date === today;

  // For today, separate the last (most recent) transcription
  const lastTranscription = isToday && transcriptions.length > 0 
    ? transcriptions[0] 
    : null;
  const otherTranscriptions = isToday && transcriptions.length > 0
    ? transcriptions.slice(1)
    : transcriptions;

  // Format the "last checked" text
  const getLastCheckedText = () => {
    if (!lastCheckedAt) return null;
    if (secondsAgo === 0) return "just now";
    if (secondsAgo === 1) return "1 second ago";
    return `${secondsAgo} seconds ago`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-heading-md font-semibold text-foreground">
          {isToday ? "Today" : date}
        </h2>
        <div className="flex flex-col items-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={loadTranscriptions}
            className="h-8 w-8"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          {lastCheckedAt && (
            <span className="text-xs text-muted-foreground">
              Last checked {getLastCheckedText()}
            </span>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {/* Show last transcription with special styling for Today */}
          {isToday && lastTranscription && (
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-small font-semibold text-muted-foreground uppercase tracking-wide">
                  Latest
                </span>
                <div className="h-px flex-1 bg-border"></div>
              </div>
              <div className="border-2 border-success/30 rounded-xl p-1 bg-success/5">
                <TranscriptionCard transcription={lastTranscription} />
              </div>
            </div>
          )}

          {/* Show separator if there are more transcriptions */}
          {isToday && lastTranscription && otherTranscriptions.length > 0 && (
            <div className="mb-4 mt-6">
              <div className="mb-3">
                <span className="text-small font-semibold text-muted-foreground uppercase tracking-wide">
                  Earlier today
                </span>
              </div>
            </div>
          )}

          {/* Show other transcriptions */}
          {otherTranscriptions.map((transcription) => (
            <TranscriptionCard
              key={transcription._id}
              transcription={transcription}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

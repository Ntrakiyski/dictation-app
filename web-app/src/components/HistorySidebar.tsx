import { useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { getHistoryDays } from "@/services/apiClient";
import type { HistoryDay } from "@voice-clipboard/shared/types";
import { Calendar, Home } from "lucide-react";

interface HistorySidebarProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  onHomeClick: () => void;
  refreshTrigger?: number;
}

export function HistorySidebar({
  selectedDate,
  onDateSelect,
  onHomeClick,
  refreshTrigger,
}: HistorySidebarProps) {
  const [days, setDays] = useState<HistoryDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDays = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getHistoryDays();
        setDays(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load history"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDays();
  }, [refreshTrigger]);

  const formatDateLabel = (dateString: string): string => {
    const date = new Date(dateString + "T00:00:00");
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time for comparison
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return "Today";
    } else if (date.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  return (
    <div className="w-[280px] h-full bg-sidebar-bg border-r border-border flex flex-col max-md:w-full max-md:h-auto max-md:border-r-0 max-md:border-b">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-foreground" />
          <h2 className="text-heading-md font-semibold text-foreground">
            History
          </h2>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {loading && (
            <p className="text-small text-muted-foreground">Loading...</p>
          )}

          {error && (
            <p className="text-small text-destructive">{error}</p>
          )}

          {!loading && !error && days.length === 0 && (
            <p className="text-small text-muted-foreground">
              No history yet
            </p>
          )}

          {/* Home button */}
          <button
            onClick={onHomeClick}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-2 group mb-2 ${
              selectedDate === null
                ? "bg-sidebar-active text-foreground"
                : "hover:bg-sidebar-item-hover text-foreground"
            }`}
          >
            <Home className="h-4 w-4" />
            <span className="text-body font-medium">Home</span>
          </button>

          {!loading && !error && days.length > 0 && (
            <>
              <Separator className="my-2" />
              <div className="space-y-1">
                {days.map((day, index) => (
                  <div key={day.date}>
                    <button
                      onClick={() => onDateSelect(day.date)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between group ${
                        selectedDate === day.date
                          ? "bg-sidebar-active text-foreground"
                          : "hover:bg-sidebar-item-hover text-foreground"
                      }`}
                    >
                      <span className="text-body font-medium">
                        {formatDateLabel(day.date)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {day.count}
                      </Badge>
                    </button>
                    {index < days.length - 1 && (
                      <Separator className="my-1" />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}


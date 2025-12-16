import { useState, useEffect } from "react";
import { StatusIndicator } from "./components/StatusIndicator";
import { HistorySidebar } from "./components/HistorySidebar";
import { HistoryView } from "./components/HistoryView";
import { AudioRecorder } from "./utils/audioRecorder";
import { transcribeAudio } from "./services/groqClient";
import { copyToClipboard } from "./utils/clipboard";
import { HotkeyManager } from "./utils/hotkeyManager";
import { playSuccessSound } from "./utils/soundNotification";
import { saveTranscription } from "./services/historyService";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Clock, DollarSign, CheckCircle2 } from "lucide-react";
import type { RecordingState, TranscriptionResult, ViewMode } from "./types";

function App() {
  const [status, setStatus] = useState<RecordingState>("idle");
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [hotkeyManager] = useState(() => new HotkeyManager());
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("recording");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Register hotkey on mount
    hotkeyManager.register(handleHotkeyPress);

    // Cleanup on unmount
    return () => {
      hotkeyManager.unregister();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotkeyManager]);

  const handleHotkeyPress = async () => {
    try {
      if (audioRecorder.isRecording()) {
        // Stop recording
        setStatus("transcribing");
        const audioBlob = await audioRecorder.stopRecording();

        // Transcribe
        const result = await transcribeAudio(audioBlob);
        setTranscriptionResult(result);

        // Save to database
        try {
          await saveTranscription({
            ...result,
            timestamp: new Date(),
          });
          // Trigger refresh of sidebar and history view
          setRefreshKey((prev) => prev + 1);
        } catch (error) {
          console.error("Failed to save transcription:", error);
          // Continue even if save fails
        }

        // Copy to clipboard
        await copyToClipboard(result.text);

        // Play success sound
        playSuccessSound();

        // Show success message briefly
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);

        // Return to idle immediately
        setStatus("idle");
      } else {
        // Start recording (keep previous transcription result)
        setShowSuccessMessage(false);
        setStatus("recording");
        await audioRecorder.startRecording();
      }
    } catch (error) {
      console.error("Error in recording workflow:", error);
      setStatus("error");

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setViewMode("history");
  };

  const handleHomeClick = () => {
    setSelectedDate(null);
    setViewMode("recording");
  };

  return (
    <div className="flex h-screen bg-secondary-bg">
      <HistorySidebar
        key={refreshKey}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onHomeClick={handleHomeClick}
        refreshTrigger={refreshKey}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {viewMode === "recording" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="flex flex-col items-center gap-6 w-full max-w-3xl">
              <div className="text-center space-y-3">
                <h1 className="text-heading-lg font-semibold text-foreground">
                  Voice Clipboard
                </h1>
                <p className="text-body text-muted-foreground">
                  Press{" "}
                  <kbd className="px-2 py-1 bg-background rounded-md border border-border text-small font-mono">
                    Alt+1
                  </kbd>{" "}
                  to start/stop recording
                </p>
              </div>

              <StatusIndicator status={status} />

              {transcriptionResult && (
                <Card className="w-full shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-heading-md text-foreground">
                      Transcribed Text
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-body text-foreground leading-relaxed p-4 bg-secondary-bg rounded-lg border border-border">
                      {transcriptionResult.text}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span className="text-small font-medium">Duration</span>
                        </div>
                        <p className="text-body font-bold text-foreground">
                          {transcriptionResult.duration.toFixed(2)}s
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-small font-medium">Cost</span>
                        </div>
                        <p className="text-body font-bold text-success">
                          ${((transcriptionResult.duration / 3600) * 0.04).toFixed(6)}
                        </p>
                      </div>
                    </div>

                    {showSuccessMessage && (
                      <div className="flex items-center justify-center gap-2 text-white bg-success rounded-lg p-4 border border-success">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-body font-medium">
                          Copied to Clipboard!
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <HistoryView key={refreshKey} date={selectedDate} refreshTrigger={refreshKey} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

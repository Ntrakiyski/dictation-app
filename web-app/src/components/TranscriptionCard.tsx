import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Clock, DollarSign, Copy, Check } from "lucide-react";
import { copyToClipboard } from "../utils/clipboard";
import type { TranscriptionRecord } from "@voice-clipboard/shared/types";

interface TranscriptionCardProps {
  transcription: TranscriptionRecord;
}

export function TranscriptionCard({ transcription }: TranscriptionCardProps) {
  const [copied, setCopied] = useState(false);

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(transcription.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-heading-sm text-foreground">
            {formatDate(transcription.timestamp)}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-8 w-8"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-body text-foreground leading-relaxed">
          {transcription.text}
        </p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-small font-medium">
              {transcription.duration.toFixed(2)}s
            </span>
          </div>
          <div className="flex items-center gap-2 text-success">
            <DollarSign className="h-4 w-4" />
            <span className="text-small font-bold">
              ${transcription.cost.toFixed(6)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


export type RecordingState = "idle" | "recording" | "transcribing" | "success" | "error";
export type ViewMode = "recording" | "history";
export interface RecordingError {
    message: string;
    code?: string;
}
export interface TranscriptionResult {
    text: string;
    duration: number;
}
export interface TranscriptionRecord {
    _id: string;
    text: string;
    duration: number;
    cost: number;
    timestamp: Date;
    date: string;
}
export interface HistoryDay {
    date: string;
    count: number;
}
export interface TranscriptionData {
    text: string;
    duration: number;
    cost: number;
    timestamp: Date;
    date?: string;
}
//# sourceMappingURL=index.d.ts.map
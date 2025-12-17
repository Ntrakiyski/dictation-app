/**
 * AudioRecorder handles audio recording using MediaRecorder API
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private isRecordingFlag = false;

  /**
   * Starts recording audio from the user's microphone
   * @throws Error if permission is denied or microphone is unavailable
   * @throws Error if already recording
   */
  async startRecording(): Promise<void> {
    if (this.isRecordingFlag) {
      throw new Error("Already recording");
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // Use m4a codec if available, fallback to default
      const options: MediaRecorderOptions = {
        mimeType: "audio/mp4",
      };

      // Check if m4a is supported, fallback to default
      if (!MediaRecorder.isTypeSupported("audio/mp4")) {
        delete options.mimeType;
      }

      this.mediaRecorder = new MediaRecorder(this.mediaStream, options);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.isRecordingFlag = false;
        if (this.mediaStream) {
          this.mediaStream.getTracks().forEach((track) => track.stop());
          this.mediaStream = null;
        }
      };

      this.mediaRecorder.start();
      this.isRecordingFlag = true;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to start recording");
    }
  }

  /**
   * Stops recording and returns the recorded audio as a Blob
   * @returns Promise that resolves to the audio Blob
   * @throws Error if not currently recording
   */
  async stopRecording(): Promise<Blob> {
    if (!this.isRecordingFlag || !this.mediaRecorder) {
      throw new Error("Not recording");
    }

    return new Promise((resolve, reject) => {
      try {
        this.mediaRecorder!.onstop = () => {
          this.isRecordingFlag = false;
          if (this.mediaStream) {
            this.mediaStream.getTracks().forEach((track) => track.stop());
            this.mediaStream = null;
          }

          const audioBlob = new Blob(this.audioChunks, { type: "audio/mp4" });
          this.audioChunks = [];
          this.mediaRecorder = null;
          resolve(audioBlob);
        };

        this.mediaRecorder!.stop();
      } catch (error) {
        if (error instanceof Error) {
          reject(error);
        } else {
          reject(new Error("Failed to stop recording"));
        }
      }
    });
  }

  /**
   * Checks if currently recording
   * @returns true if recording, false otherwise
   */
  isRecording(): boolean {
    return this.isRecordingFlag;
  }
}


/**
 * Plays a simple beep sound notification using Web Audio API
 * No dependencies or external files required
 */
export function playSuccessSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure the beep sound
    oscillator.frequency.value = 800; // Hz - pleasant tone
    oscillator.type = "sine"; // Smooth sine wave

    // Volume envelope (fade in/out for smoother sound)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    // Play the beep
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);

    // Cleanup
    oscillator.onended = () => {
      audioContext.close();
    };
  } catch (error) {
    console.error("Failed to play notification sound:", error);
    // Don't throw - sound is optional feedback
  }
}


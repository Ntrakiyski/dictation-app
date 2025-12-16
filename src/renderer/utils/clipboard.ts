/**
 * Copies text to the system clipboard using Electron's clipboard API
 * This works even when the app is minimized or in the background
 * @param text - The text to copy to clipboard
 * @throws Error if clipboard write fails
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (!window.electron?.clipboard) {
    throw new Error("Electron clipboard API not available");
  }

  const result = await window.electron.clipboard.writeText(text);
  
  if (!result.success) {
    throw new Error(result.error || "Clipboard write failed");
  }
}


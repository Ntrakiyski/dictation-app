/**
 * Copies text to the system clipboard using browser Clipboard API
 * @param text - The text to copy to clipboard
 * @throws Error if clipboard write fails
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    throw new Error(
      `Clipboard write failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}


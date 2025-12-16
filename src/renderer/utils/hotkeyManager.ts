/**
 * HotkeyManager handles registration and unregistration of hotkey listeners
 * Listens to IPC messages from Electron main process
 */
export class HotkeyManager {
  private callback: (() => void) | null = null;
  private isRegisteredFlag = false;

  /**
   * Registers a callback to be called when the hotkey is pressed
   * @param callback - Function to call when hotkey is pressed
   * @throws Error if already registered
   */
  register(callback: () => void): void {
    if (this.isRegisteredFlag) {
      throw new Error("Hotkey already registered");
    }

    if (!window.electron) {
      throw new Error("Electron API not available");
    }

    this.callback = callback;
    this.isRegisteredFlag = true;

    window.electron.ipcRenderer.on("hotkey-pressed", this.handleHotkeyPress);
  }

  /**
   * Unregisters the hotkey listener
   */
  unregister(): void {
    if (!this.isRegisteredFlag) {
      return;
    }

    if (window.electron) {
      window.electron.ipcRenderer.removeAllListeners("hotkey-pressed");
    }

    this.callback = null;
    this.isRegisteredFlag = false;
  }

  /**
   * Checks if hotkey is currently registered
   * @returns true if registered, false otherwise
   */
  isRegistered(): boolean {
    return this.isRegisteredFlag;
  }

  private handleHotkeyPress = (): void => {
    if (this.callback) {
      this.callback();
    }
  };
}


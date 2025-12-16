import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    invoke: (channel: string, ...args: unknown[]) =>
      ipcRenderer.invoke(channel, ...args),
    on: (channel: string, func: (...args: unknown[]) => void) => {
      const validChannels = ["hotkey-pressed"];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (_event, ...args) => func(...args));
      }
    },
    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel);
    },
  },
  clipboard: {
    writeText: (text: string) => ipcRenderer.invoke("clipboard:writeText", text),
  },
  database: {
    saveTranscription: (data: {
      text: string;
      duration: number;
      cost: number;
      timestamp: Date;
      date?: string;
    }) => ipcRenderer.invoke("db:saveTranscription", data),
    getHistoryDays: () => ipcRenderer.invoke("db:getHistoryDays"),
    getTranscriptionsByDay: (date: string) =>
      ipcRenderer.invoke("db:getTranscriptionsByDay", date),
  },
});


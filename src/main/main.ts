import { app, BrowserWindow, globalShortcut, ipcMain, clipboard } from "electron";
import path from "path";
import { DatabaseService } from "./services/database";

let mainWindow: BrowserWindow | null = null;
let dbService: DatabaseService | null = null;

const HOTKEY = "Alt+1";
const MONGODB_CONNECTION_STRING =
  "mongodb://root:vzIg4RDiKVsmvnBg2L1uHLnx0Mu8CKpWuH5bzJJKqOXVTmVJYb4ayARnmyL5ezee@159.69.35.245:7777/?directConnection=true";
const DB_NAME = "voice_clipboard";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Open DevTools in development for debugging
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  // In development, load from dev server; in production, load from built files
  if (!app.isPackaged) {
    // Development mode
    // electron-vite should inject VITE_DEV_SERVER_URL via define
    // Fallback to port 5173 which we set in electron.vite.config.ts
    const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    console.log('Loading dev server:', devServerUrl);
    console.log('app.isPackaged:', app.isPackaged);
    mainWindow.loadURL(devServerUrl);
  } else {
    // Production mode
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  // Log any load failures
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // Log when page finishes loading
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });
}

app.whenReady().then(async () => {
  createWindow();

  // Initialize database service
  try {
    dbService = new DatabaseService(MONGODB_CONNECTION_STRING, DB_NAME);
    await dbService.connect();
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }

  // Register IPC handler for clipboard
  ipcMain.handle("clipboard:writeText", (_event, text: string) => {
    try {
      clipboard.writeText(text);
      return { success: true };
    } catch (error) {
      console.error("Clipboard write failed:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  });

  // Register IPC handlers for database operations
  ipcMain.handle("db:saveTranscription", async (_event, data: {
    text: string;
    duration: number;
    cost: number;
    timestamp: Date;
    date?: string;
  }) => {
    try {
      if (!dbService) {
        throw new Error("Database service not initialized");
      }
      const result = await dbService.saveTranscription({
        ...data,
        timestamp: new Date(data.timestamp),
      });
      return { success: true, data: result };
    } catch (error) {
      console.error("Failed to save transcription:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  ipcMain.handle("db:getHistoryDays", async () => {
    try {
      if (!dbService) {
        throw new Error("Database service not initialized");
      }
      const days = await dbService.getHistoryDays();
      return { success: true, data: days };
    } catch (error) {
      console.error("Failed to get history days:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  ipcMain.handle("db:getTranscriptionsByDay", async (_event, date: string) => {
    try {
      if (!dbService) {
        throw new Error("Database service not initialized");
      }
      const transcriptions = await dbService.getTranscriptionsByDay(date);
      return { success: true, data: transcriptions };
    } catch (error) {
      console.error("Failed to get transcriptions:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // Register global hotkey
  const ret = globalShortcut.register(HOTKEY, () => {
    if (mainWindow) {
      mainWindow.webContents.send("hotkey-pressed");
    }
  });

  if (!ret) {
    console.error("Failed to register hotkey");
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("will-quit", async () => {
  globalShortcut.unregisterAll();
  if (dbService) {
    await dbService.disconnect();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});


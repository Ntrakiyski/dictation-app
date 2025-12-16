# Changelog

## [1.1.0] - Background Operation Support

### ✨ New Features
- **Background Clipboard Support**: Clipboard now works even when app is minimized or you're using other applications
- **Sound Notification**: Plays a pleasant beep sound when transcription is successfully copied to clipboard

### 🔧 Technical Changes

#### Main Process (`src/main/main.ts`)
- Added IPC handler `clipboard:writeText` that uses Electron's native clipboard module
- Clipboard operations now run in main process for reliable background access

#### Preload Script (`src/preload/preload.ts`)
- Exposed `electron.clipboard.writeText()` API to renderer via contextBridge
- Updated TypeScript definitions in `vite-env.d.ts`

#### Renderer Process
- **`clipboard.ts`**: Changed from browser `navigator.clipboard` to Electron IPC clipboard
- **`soundNotification.ts`**: New utility using Web Audio API to generate beep sound
  - No dependencies required
  - No external audio files needed
  - Simple sine wave oscillator (800Hz, 150ms duration)
- **`App.tsx`**: Added `playSuccessSound()` call after clipboard copy

#### Tests
- Updated `clipboard.test.ts` to mock new Electron clipboard API
- Added comprehensive tests for `soundNotification.ts` (7 test cases)
- All 54 tests pass ✅

### 📝 Documentation
- Updated `tech_context.md` with Electron APIs used
- Updated `README.md` with new features
- All changes follow TDD principles

### 🎯 Result
**The app now fully works in the background!**
- Press `Alt+1` from any application
- Voice gets recorded and transcribed
- Text is copied to clipboard (even when app is minimized)
- A beep sound confirms the copy was successful
- Paste anywhere with `Ctrl+V`

### 💡 Implementation Decisions
**Why these changes were the minimum required:**
1. Clipboard IPC was necessary because browser clipboard API requires focus
2. Web Audio API for sound needs no dependencies vs. external libraries
3. No UI changes needed - everything works transparently
4. Zero new npm packages installed

**Files Changed: 8**
- 3 core files (main.ts, preload.ts, clipboard.ts)
- 1 new utility (soundNotification.ts)
- 1 component update (App.tsx)
- 1 type definition (vite-env.d.ts)
- 2 test files (clipboard.test.ts, soundNotification.test.ts)
- 1 test setup (setup.ts)


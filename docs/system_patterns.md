# System Patterns

## Architecture Overview

### Electron Multi-Process Architecture
The application follows Electron's standard multi-process architecture with three distinct layers:

1. **Main Process** (`src/main/main.ts`)
   - Manages application lifecycle
   - Creates and controls BrowserWindow instances
   - Registers global system shortcuts
   - Handles OS-level integrations

2. **Preload Script** (`src/preload/preload.ts`)
   - Bridge between main and renderer processes
   - Exposes limited IPC communication via `contextBridge`
   - Enforces security by maintaining `contextIsolation: true`

3. **Renderer Process** (`src/renderer/`)
   - Runs the React application
   - Handles user interface and interactions
   - Manages audio recording, transcription, and clipboard operations

### Component Relationships

```
Main Process (Electron)
    ↓ (IPC: hotkey-pressed event)
Preload Script (Bridge)
    ↓ (Exposed API: window.electron)
Renderer Process (React)
    ├── App.tsx (Orchestrator)
    ├── Utils
    │   ├── AudioRecorder (Browser MediaRecorder API)
    │   ├── HotkeyManager (IPC listener)
    │   └── clipboard (Browser Clipboard API)
    └── Services
        └── groqClient (Groq Whisper API)
```

## Key Design Patterns

### 1. Class-Based Utility Modules
All browser API interactions are encapsulated in class-based modules:
- **AudioRecorder**: Manages MediaRecorder lifecycle with state tracking
- **HotkeyManager**: Handles IPC event registration/unregistration

**Why**: Provides clean lifecycle management and state encapsulation

### 2. Function-Based Service Modules
API integrations use simple async functions:
- **groqClient.transcribeAudio()**: Stateless transcription service
- **clipboard.copyToClipboard()**: Stateless clipboard operations

**Why**: These operations are naturally stateless and don't require instance management

### 3. React State Machine
The app uses a strict state machine for recording workflow:

```
idle → recording → transcribing → success → idle
         ↓                           ↓
       error ─────────────────────→ idle
```

**Implementation**: `RecordingState` type union ensures valid state transitions

### 4. Single Responsibility Utilities
Each utility module has one clearly defined purpose:
- Audio recording is separate from transcription
- Transcription is separate from clipboard operations
- Hotkey management only handles IPC communication

**Why**: Enables independent testing and clear separation of concerns

## Critical Implementation Paths

### Recording Workflow
1. User presses `Alt+1` (system-wide)
2. Main process receives shortcut → sends IPC event
3. HotkeyManager calls registered callback
4. App checks current state:
   - **If idle**: Start recording → update state to "recording"
   - **If recording**: Stop recording → transcribe → copy → show success

### Error Handling Strategy
- All async operations wrapped in try-catch
- Errors caught at the orchestration layer (App.tsx)
- User gets visual feedback via status state transition
- Automatic reset to idle after timeout (3s for errors, 5s for success)

### Security Considerations
- `contextIsolation: true` prevents renderer from accessing Node.js/Electron APIs directly
- `nodeIntegration: false` disables Node.js in renderer
- Preload script whitelists only necessary IPC channels (`hotkey-pressed`)
- Groq API key loaded from environment variables (not hardcoded)

## Data Flow

### Audio Recording Flow
```
User Voice → MediaRecorder → Blob[] → Blob → File → Groq API → TranscriptionResult
```

### State Management Flow
```
Component State (useState)
    ↓
StatusIndicator (visual feedback)
    ↓
User Interface (badges, animations)
```

**Why no global state**: 
- Single component manages workflow
- No shared state between components
- Props drilling is minimal

## Testing Architecture

### Test Organization
- **Unit tests**: `__tests__/` folders co-located with source files
- **Integration tests**: `App.integration.test.tsx` for full workflow
- **Test setup**: `src/test/setup.ts` provides global mocks

### Mocking Strategy
- Browser APIs mocked globally in setup.ts (MediaRecorder, Clipboard, MediaDevices)
- Electron APIs mocked via `global.electron` object
- External services (Groq) mocked at module level
- Each mock includes all required interface methods

### Test Coverage Goals
- All utilities have comprehensive unit tests
- Edge cases explicitly tested (errors, empty strings, long text)
- Integration tests verify full user workflows

## Build & Development Architecture

### Vite-Based Build System
- **electron-vite**: Handles multi-process bundling
- Separate configurations for main/preload/renderer
- Development: Hot module replacement for renderer
- Production: Optimized bundles with tree-shaking

### Module Resolution
- `@/` alias points to `src/renderer/` (configured in both Vite and tsconfig)
- Enables clean imports: `import { X } from "@/utils/X"`


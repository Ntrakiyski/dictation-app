# Technical Context

## Technology Stack

### Core Framework
- **Electron v28**: Desktop application framework
  - Provides native OS integrations (global shortcuts, window management)
  - Chromium-based for modern web APIs
  - Node.js integration for file system and API calls

### Frontend
- **React 18.2**: UI framework
  - Hooks-based architecture (no class components)
  - Functional components only
- **TypeScript 5.3**: Type safety and developer experience
- **Vite 5**: Fast development server and build tool
- **Tailwind CSS 3.4**: Utility-first styling

### UI Components
- **shadcn-ui**: Pre-built accessible components
  - Badge (status indicators)
  - Button, Dialog, Input, Alert (UI primitives)
- **lucide-react**: Icon library
- **class-variance-authority (CVA)**: Component variant management

### APIs & Services
- **Groq SDK v0.3**: Whisper API for audio transcription
  - Model: `whisper-large-v3-turbo`
  - Response format: `verbose_json` (includes duration metadata)
  - Cost: $0.04 per audio hour

### Browser APIs Used
- **MediaRecorder API**: Audio recording from microphone
  - Preferred format: `audio/mp4` (with fallback)
  - Handles blob collection and stream management
- **MediaDevices API**: Microphone access (`getUserMedia`)
- **Web Audio API**: Generate beep sound for success notification
  - No external files or dependencies required
  - Simple sine wave oscillator
- **IPC (Electron)**: Inter-process communication for hotkey events and clipboard

### Electron APIs Used
- **Clipboard Module (Main Process)**: Write text to system clipboard
  - Works even when app is minimized or in background
  - More reliable than browser clipboard API
- **Global Shortcuts**: System-wide hotkey registration
- **IPC Handlers**: Bridge between renderer and main process

## Development Setup

### Prerequisites
- Node.js 18+ (for Electron 28 compatibility)
- npm or yarn package manager
- Microphone access (system permissions)
- Groq API key (from https://console.groq.com)

### Environment Configuration
Create `.env` in project root:
```
VITE_GROQ_API_KEY=your_api_key_here
```

**Important**: Environment variables must be prefixed with `VITE_` to be available in renderer process

### Development Scripts
```bash
npm run dev          # Start Electron with hot reload
npm run build        # Build for production
npm run preview      # Preview production build
npm run test:unit    # Run all tests once
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run lint         # ESLint check
npm run format       # Prettier formatting
```

## Technical Constraints

### Security Constraints
- **Context Isolation**: Renderer cannot directly access Node.js/Electron
- **No Node Integration**: Renderer runs in sandboxed environment
- **Whitelisted IPC Channels**: Only `hotkey-pressed` allowed
- **API Key Protection**: Must be in environment variables (never in code)

### Browser API Limitations
- **MediaRecorder**:
  - Requires microphone permissions
  - Format support varies by platform (mp4 preferred, falls back to default)
  - Can only record while page is active
- **Web Audio API**:
  - Requires user gesture on first audio play (not an issue in Electron)
  - May not work in older browsers (Safari needs webkit prefix)

### Cross-Platform Considerations
- **Global Shortcuts**: `Alt+1` works on Windows/Linux, may need adjustment for macOS
- **Audio Formats**: MP4 support varies, fallback handling implemented
- **File Paths**: Using `path.join()` for cross-platform compatibility

## Dependencies

### Production Dependencies
```json
{
  "groq-sdk": "^0.3.0",           // AI transcription
  "react": "^18.2.0",             // UI framework
  "react-dom": "^18.2.0",         // React renderer
  "class-variance-authority": "^0.7.0",  // Component variants
  "clsx": "^2.0.0",               // Conditional classes
  "tailwind-merge": "^2.2.0",     // Tailwind class merging
  "lucide-react": "^0.303.0"      // Icons
}
```

### Development Dependencies
```json
{
  "electron": "^28.0.0",          // Desktop framework
  "electron-vite": "^2.0.0",      // Build tool
  "@vitejs/plugin-react": "^4.2.1",      // Vite React plugin
  "vitest": "^1.1.0",             // Test runner
  "@testing-library/react": "^14.1.2",   // React testing
  "@testing-library/jest-dom": "^6.1.5", // Jest matchers
  "typescript": "^5.3.3",         // TypeScript compiler
  "tailwindcss": "^3.4.0",        // CSS framework
  "eslint": "^8.56.0",            // Linting
  "prettier": "^3.1.1"            // Code formatting
}
```

## Tool Usage Patterns

### TypeScript Configuration
- Strict mode enabled
- Module resolution: ESNext
- Target: ES2020 (for modern JavaScript features)
- Path aliases: `@/*` → `src/renderer/*`

### Testing with Vitest
- **Environment**: jsdom (simulates browser)
- **Globals**: Enabled (describe, it, expect without imports)
- **Setup**: Global mocks in `src/test/setup.ts`
- **Coverage**: V8 provider with HTML reports

### Linting & Formatting
- **ESLint**: TypeScript + React rules
- **Prettier**: 2-space indentation, single quotes
- **Pre-commit hooks**: None configured (manual run)

## Performance Considerations

### Bundle Size
- Electron app includes full Chromium + Node.js (~150MB base)
- React renderer bundle optimized with Vite tree-shaking
- Code splitting not implemented (single-page app)

### Memory Usage
- MediaRecorder stores chunks in memory during recording
- Chunks cleared after transcription
- No audio playback = no additional buffers

### API Rate Limits
- Groq API: Check current limits at console.groq.com
- No client-side rate limiting implemented
- Failed requests throw errors to user

## Known Technical Debt

### Current Limitations
1. **Background Recording**: App window must be open (can be minimized)
2. **Single Recording**: Cannot queue multiple recordings
3. **No Audio Playback**: Cannot review before transcription
4. **No Persistent History**: Transcriptions lost on app restart

### Background Operation Support ✅
- **Clipboard**: Works in background via Electron main process IPC
- **Sound Notification**: Works via Web Audio API (no dependencies)
- **Hotkey**: Works system-wide even when app is minimized
- **Transcription**: Works as long as app window exists (can be minimized)

This means the app now works fully when minimized or while using other applications!


# Voice Clipboard

A desktop application that records audio on hotkey press, transcribes it using Groq Whisper API, and automatically copies the transcription to your clipboard.

## Features

- **Global Hotkey**: Press `Alt+1` to start/stop recording (works system-wide)
- **Audio Recording**: Records audio from your microphone
- **AI Transcription**: Uses Groq Whisper API for accurate transcription
- **Auto Copy**: Automatically copies transcribed text to clipboard (works in background)
- **Sound Notification**: Plays a beep when transcription is copied to clipboard
- **Background Operation**: Works even when app is minimized or you're using other apps
- **Status Indicator**: Visual feedback for recording, transcribing, and success states

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Groq API key

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root:
```
GROQ_API_KEY=your_groq_api_key_here
```

## Development

```bash
# Start development server
npm run dev

# Run tests
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build
```

## Usage

1. Start the application: `npm run dev`
2. Press `Alt+1` to start recording
3. Speak into your microphone
4. Press `Alt+1` again to stop recording
5. The transcription will be automatically copied to your clipboard
6. Paste anywhere to use the transcribed text

## Project Structure

```
voice-clipboard/
├── src/
│   ├── main/              # Electron main process
│   ├── preload/           # Electron preload scripts
│   └── renderer/          # React application
│       ├── components/     # React components
│       ├── utils/         # Utility functions
│       └── services/       # API services
├── docs/                  # Project documentation
└── tests/                 # Test files
```

## Technology Stack

- **Electron**: Desktop app framework
- **React**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Vitest**: Testing framework
- **shadcn-ui**: UI components
- **Groq SDK**: AI transcription API

## Testing

The project follows Test-Driven Development (TDD) principles:

- Unit tests for all utilities and services
- Component tests for UI components
- Integration tests for full workflows

Run tests with:
```bash
npm run test:unit
```

## License

MIT


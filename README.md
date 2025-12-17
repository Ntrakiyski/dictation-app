# Voice Clipboard - Dictation App

A desktop application for voice transcription with MongoDB storage.

## Setup

### Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set your MongoDB connection details:
   ```
   MONGODB_CONNECTION_STRING=mongodb://username:password@hostname:27017/?directConnection=true
   DB_NAME=voice_clipboard
   ```

### Installation

```bash
npm install
```

### Running

```bash
npm run dev
```

### Building

```bash
npm run build
```

## Features

- Voice recording and transcription
- Auto-polling every 3 seconds for real-time updates
- History view with date-based filtering
- MongoDB storage for transcriptions

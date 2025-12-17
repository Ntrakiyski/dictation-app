# Voice Clipboard

A cross-platform voice transcription application with desktop (Electron) and web/mobile (PWA) support. Record audio, transcribe using Groq Whisper API, and automatically copy to clipboard.

## Architecture

```
┌─────────────────┐
│  Electron App   │  (Desktop - Windows, macOS, Linux)
│  Global Hotkeys │
└────────┬────────┘
         │
         ├────────> Backend API (Docker) ────> MongoDB
         │              ↓
         │          Groq API
         │
┌────────┴────────┐
│   PWA Web App   │  (iOS, Android, Desktop browsers)
│  Touch Controls │
└─────────────────┘
```

## Features

- **Desktop App (Electron)**
  - Global hotkey (`Alt+1`) for recording
  - System clipboard integration
  - Works in background

- **PWA Web App**
  - Installable on mobile devices
  - Touch-friendly record button
  - Responsive design
  - Offline support (service worker)

- **Backend API**
  - RESTful API for transcription
  - MongoDB database integration
  - Groq Whisper API integration
  - Dockerized deployment

## Project Structure

```
voice-clipboard/
├── backend/          # Express API server
├── web-app/          # PWA React application
├── shared/           # Shared TypeScript types
├── src/              # Electron app (legacy structure)
└── docker-compose.yml
```

## Prerequisites

- Node.js 18+
- Docker and Docker Compose (for full stack)
- Groq API key
- MongoDB connection string

## Quick Start

### Using Docker (Recommended)

1. **Set environment variables:**
   ```bash
   export MONGODB_URI="your_mongodb_connection_string"
   export GROQ_API_KEY="your_groq_api_key"
   export API_KEY="your_api_key_for_auth"
   ```

2. **Start all services:**
   ```bash
   npm run docker:up
   ```

3. **Access applications:**
   - Backend API: http://localhost:3000
   - PWA Web App: http://localhost:8080
   - Electron App: `npm run dev:electron`

### Development Mode

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Web App:**
```bash
cd web-app
npm install
npm run dev
```

**Electron App:**
```bash
npm install
npm run dev:electron
```

## Environment Variables

### Backend
Create `backend/.env`:
```
MONGODB_URI=mongodb://...
GROQ_API_KEY=gsk_...
API_KEY=your-api-key
PORT=3000
DB_NAME=voice_clipboard
```

### Web App
Create `web-app/.env`:
```
VITE_API_URL=http://localhost:3000
VITE_API_KEY=your-api-key
```

### Electron
Create `.env`:
```
VITE_API_URL=http://localhost:3000
VITE_API_KEY=your-api-key
```

## API Endpoints

- `POST /api/transcribe` - Upload audio and get transcription
- `GET /api/history/days` - Get list of days with counts
- `GET /api/history/:date` - Get transcriptions for a date
- `POST /api/history` - Save transcription manually
- `GET /api/health` - Health check

All endpoints (except `/api/health`) require `X-API-Key` header.

## Testing

```bash
# Backend tests
npm run test:backend

# Web app tests
npm run test:web

# Integration tests
cd backend && npm test
cd web-app && npm test
```

## Building for Production

```bash
# Build backend
npm run build:backend

# Build web app
npm run build:web

# Build Electron app
npm run build:electron

# Build Docker images
npm run docker:build
```

## Deployment

### Docker Deployment

1. Set environment variables in `.env` or export them
2. Build and start:
   ```bash
   docker-compose up -d
   ```

### Standalone Deployment

- **Backend**: Deploy to any Node.js hosting (Railway, Heroku, DigitalOcean)
- **Web App**: Deploy to Vercel, Netlify, or any static hosting
- **Electron**: Build installers for target platforms

## Usage

### Desktop (Electron)
1. Start the app
2. Press `Alt+1` to start recording
3. Speak into microphone
4. Press `Alt+1` again to stop
5. Text is automatically copied to clipboard

### Mobile/Web (PWA)
1. Open the web app
2. Tap the record button to start
3. Speak into microphone
4. Tap again to stop
5. Text is automatically copied to clipboard
6. Install to home screen for app-like experience

## Technology Stack

- **Backend**: Express.js, TypeScript, MongoDB
- **Frontend**: React, TypeScript, Tailwind CSS
- **Desktop**: Electron
- **PWA**: Vite PWA Plugin, Service Workers
- **Testing**: Vitest, Testing Library
- **Deployment**: Docker, Docker Compose

## License

MIT

# Local Setup Guide - Dictation App

Complete guide to running the dictation app on your local PC.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** 18+ ([Download here](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([Download here](https://git-scm.com/))
- **Docker Desktop** (optional, for containerized setup) ([Download here](https://www.docker.com/products/docker-desktop/))

## Architecture Overview

```
┌─────────────────┐
│  Electron App   │  Desktop (Windows, macOS, Linux)
│  Global Hotkeys │
└────────┬────────┘
         │
         ├───────> Backend API ────> MongoDB (External)
         │              │
         │          Groq API
         │
┌────────┴────────┐
│   PWA Web App   │  Web/Mobile (iOS, Android, Desktop browsers)
│  Touch Controls │
└─────────────────┘
```

## Quick Start (3 Options)

### Option 1: Docker Compose (Recommended - Easiest)

This runs the backend API and web app in Docker containers.

**Step 1:** Clone the repository
```bash
git clone https://github.com/Ntrakiyski/dictation-app.git
cd dictation-app
```

**Step 2:** Create `.env` file in the project root
```bash
# Copy this to .env file and replace with your actual credentials
VITE_GROQ_API_KEY=your_groq_api_key_here
MONGODB_URI=your_mongodb_connection_string_here
API_KEY=your_api_key_here
VITE_API_KEY=your_api_key_here
VITE_API_URL=http://localhost:4767
GROQ_API_KEY=your_groq_api_key_here
```

> **Note:** Contact the repository owner for the actual credentials.

**Step 3:** Start Docker services
```bash
docker compose up
```

**Step 4:** Access the applications
- **Backend API:** http://localhost:4767
- **PWA Web App:** http://localhost:6747
- **Health Check:** http://localhost:4767/api/health

---

### Option 2: Local Development (No Docker)

Run everything locally without Docker.

#### A. Backend API Server

**Step 1:** Navigate to backend folder
```bash
cd backend
```

**Step 2:** Install dependencies
```bash
npm install
```

**Step 3:** Create `backend/.env` file
```bash
MONGODB_URI=your_mongodb_connection_string_here
GROQ_API_KEY=your_groq_api_key_here
API_KEY=your_api_key_here
PORT=3000
DB_NAME=voice_clipboard
```

**Step 4:** Run the backend server
```bash
# Development mode (with hot reload)
npm run dev

# OR Build and run production
npm run build
npm start
```

**Step 5:** Test the backend
```bash
# Health check (no auth required)
curl http://localhost:3000/api/health

# Test with API key
curl -H "x-api-key: 7YUZrXRVRQOw8FHMDjg6WGdyb3FYs9h3Xsh2EmEN1RFtA0AaIEj0" \
  http://localhost:3000/api/history/days
```

✅ **Expected output:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-17T..."
}
```

#### B. PWA Web App

**Step 1:** Open a new terminal and navigate to web-app
```bash
cd web-app
```

**Step 2:** Install dependencies
```bash
npm install
```

**Step 3:** Create `web-app/.env` file
```bash
VITE_API_URL=http://localhost:3000
VITE_API_KEY=your_api_key_here
VITE_GROQ_API_KEY=your_groq_api_key_here
```

**Step 4:** Run the web app
```bash
# Development mode
npm run dev

# OR Build and preview production
npm run build
npm run preview
```

**Step 5:** Open in browser
- Development: http://localhost:5173
- Production preview: http://localhost:4173

#### C. Electron Desktop App

**Step 1:** Go back to project root
```bash
cd ..
```

**Step 2:** Install root dependencies
```bash
npm install
```

**Step 3:** Create `.env` file in root
```bash
VITE_API_URL=http://localhost:3000
VITE_API_KEY=your_api_key_here
VITE_GROQ_API_KEY=your_groq_api_key_here
```

**Step 4:** Run Electron app
```bash
# Development mode
npm run dev

# OR Build for production
npm run build
npm start
```

**Step 5:** Use the app
- Press `Alt+1` to start/stop recording
- Transcription will be copied to clipboard automatically

---

### Option 3: Hybrid (Docker Backend + Local Frontend)

Run backend in Docker but develop frontend locally.

**Step 1:** Start only the backend API via Docker
```bash
docker compose up api
```

**Step 2:** Follow steps B and C from Option 2 above

---

## Testing Your Setup

### 1. Test Backend Health
```bash
curl http://localhost:3000/api/health
# Or with Docker: http://localhost:4767/api/health
```

Expected: `{"status":"ok","timestamp":"..."}`

### 2. Test Backend with Auth
```bash
curl -H "x-api-key: YOUR_API_KEY" \
  http://localhost:3000/api/history/days
```

Expected: `{"success":true,"data":[...]}`

### 3. Test Web App
- Open browser to http://localhost:5173 (or appropriate port)
- Click the record button
- Speak into microphone
- Click stop
- Check if text appears and is copied to clipboard

### 4. Test Electron App
- Launch the app
- Press `Alt+1`
- Speak into microphone
- Press `Alt+1` again
- Paste somewhere - transcription should appear

---

## Troubleshooting

### Backend won't start
**Error:** "MONGODB_URI environment variable is required"
- **Solution:** Make sure you created the `.env` file with `MONGODB_URI`

**Error:** "EADDRINUSE: address already in use"
- **Solution:** Port 3000 is already taken. Change `PORT=3001` in `.env`

### Web app can't connect to backend
**Error:** "Network error" in browser console
- **Solution:** Make sure backend is running on port 3000
- **Solution:** Check `VITE_API_URL` in `web-app/.env` matches backend port

### Docker issues
**Error:** "Cannot connect to Docker daemon"
- **Solution:** Make sure Docker Desktop is running

**Error:** "port is already allocated"
- **Solution:** Stop any services using ports 4767 or 6747
  ```bash
  docker compose down
  # Or kill specific processes
  lsof -ti:4767 | xargs kill -9
  ```

### Microphone permission denied
- **Browser:** Click the microphone icon in the address bar and allow access
- **Electron:** Check system settings → Privacy → Microphone permissions

---

## Running Tests

### Backend Tests
```bash
cd backend
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Web App Tests
```bash
cd web-app
npm test

# With coverage
npm run test:coverage
```

---

## Building for Production

### Backend
```bash
cd backend
npm run build
# Output: backend/dist/
```

### Web App
```bash
cd web-app
npm run build
# Output: web-app/dist/
```

### Electron App
```bash
npm run build
# Creates installer in out/ folder
```

### Docker Images
```bash
docker compose build
```

---

## Environment Variables Reference

### Backend (.env or backend/.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://user:pass@host:port/...` |
| `GROQ_API_KEY` | Groq API key for transcription | `gsk_...` |
| `API_KEY` | API key for authenticating requests | Any secure string |
| `PORT` | Port for backend server | `3000` |
| `DB_NAME` | MongoDB database name | `voice_clipboard` |

### Web App (.env or web-app/.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000` |
| `VITE_API_KEY` | API key (matches backend) | Same as backend `API_KEY` |
| `VITE_GROQ_API_KEY` | Groq API key | Same as backend `GROQ_API_KEY` |

### Electron (root .env)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000` |
| `VITE_API_KEY` | API key (matches backend) | Same as backend `API_KEY` |
| `VITE_GROQ_API_KEY` | Groq API key | Same as backend `GROQ_API_KEY` |

---

## API Endpoints

All endpoints except `/api/health` require `X-API-Key` header.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/health` | Health check | ❌ |
| `POST` | `/api/transcribe` | Upload audio and get transcription | ✅ |
| `GET` | `/api/history/days` | Get list of days with transcription counts | ✅ |
| `GET` | `/api/history/:date` | Get transcriptions for a specific date | ✅ |
| `POST` | `/api/history` | Save transcription manually | ✅ |

### Example API Usage

**Transcribe Audio:**
```bash
curl -X POST http://localhost:3000/api/transcribe \
  -H "x-api-key: YOUR_API_KEY" \
  -F "audio=@recording.m4a"
```

**Get History:**
```bash
curl http://localhost:3000/api/history/days \
  -H "x-api-key: YOUR_API_KEY"
```

---

## Technology Stack

- **Backend:** Node.js, Express, TypeScript, MongoDB
- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Desktop:** Electron
- **PWA:** Vite PWA Plugin, Service Workers
- **AI:** Groq Whisper API
- **Deployment:** Docker, Docker Compose

---

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Make sure all environment variables are set correctly
3. Verify that all services are running (backend, MongoDB, etc.)
4. Check the console/terminal for error messages

---

## Next Steps

Once everything is running:
1. Try recording audio in the web app or Electron app
2. Check the MongoDB database to see transcriptions being saved
3. View history in the UI
4. Install the PWA on your mobile device for on-the-go transcription

Happy transcribing! 🎙️✨

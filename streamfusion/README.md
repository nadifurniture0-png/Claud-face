# StreamFusion 🎥✨

> **Live streaming with real-time AI face filters** — built with Next.js 14, Firebase, and Agora.io

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        HOST BROWSER                             │
│                                                                 │
│  Webcam ──► <video> ──► applyFaceSwapEffect() ──► <canvas>     │
│                              │                        │         │
│                         AI Filter               captureStream() │
│                         Pipeline                      │         │
│                                                       ▼         │
│                                              Agora Custom Track │
│                                                       │         │
└───────────────────────────────────────────────────────┼─────────┘
                                                        │
                                              Agora RTC Channel
                                                        │
┌───────────────────────────────────────────────────────┼─────────┐
│                      VIEWER BROWSER                   │         │
│                                                       ▼         │
│  Agora SDK ──► IRemoteVideoTrack ──► <div> container           │
│                                                                 │
│  Firebase Firestore ◄──────────────────► Chat messages         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
streamfusion/
├── app/
│   ├── layout.tsx               # Root layout + AuthProvider
│   ├── globals.css              # Tailwind + safe-area utilities
│   ├── page.tsx                 # Home: login + room discovery
│   ├── host/
│   │   └── page.tsx             # Host Studio page
│   └── viewer/[roomId]/
│       └── page.tsx             # Viewer room page
│
├── components/
│   ├── auth/
│   │   └── AuthProvider.tsx     # Firebase Auth context
│   ├── host/
│   │   ├── FaceSwapCanvas.tsx   # Canvas pipeline (AI filter output)
│   │   ├── StreamControls.tsx   # Effect picker + Go Live button
│   │   └── HostStudio.tsx       # Full host experience orchestrator
│   ├── viewer/
│   │   ├── VideoPlayer.tsx      # Agora remote track renderer
│   │   └── ViewerRoom.tsx       # Full viewer experience
│   └── shared/
│       ├── Navbar.tsx           # Top navigation bar
│       ├── ChatBox.tsx          # Real-time Firestore chat
│       └── RoomCard.tsx         # Live stream discovery card
│
├── hooks/
│   ├── useAuth.ts               # Firebase anonymous auth
│   ├── useRooms.ts              # Firestore room CRUD + listeners
│   ├── useChat.ts               # Firestore chat messages
│   ├── useAgoraHost.ts          # Host broadcast lifecycle
│   └── useAgoraViewer.ts        # Viewer subscribe lifecycle
│
├── lib/
│   ├── firebase.ts              # Firebase app singleton
│   ├── agora.ts                 # Agora SDK abstraction layer
│   └── faceSwap.ts              # AI filter pipeline (plug-in point)
│
├── types/
│   └── index.ts                 # Shared TypeScript types
│
├── firestore.rules              # Firestore security rules
├── firestore.indexes.json       # Composite index definitions
└── .env.example                 # Environment variable template
```

---

## Quick Start

### 1. Install dependencies

```bash
npm install
# or
yarn install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in your credentials:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase Console → Project Settings → Your Apps |
| `NEXT_PUBLIC_AGORA_APP_ID` | [Agora Console](https://console.agora.io) → Project Management |

### 3. Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → **Anonymous** sign-in
3. Enable **Firestore Database** (start in production mode)
4. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

### 4. Agora Setup

1. Create a project at [console.agora.io](https://console.agora.io)
2. For **local development**: set Authentication Mode to **Testing** (no token required)
3. For **production**: implement a token server (see [Agora Token docs](https://docs.agora.io/en/video-calling/core-functionality/authentication))

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Integrating a Real AI Face Filter SDK

The `applyFaceSwapEffect()` function in `lib/faceSwap.ts` is the **only file you need to modify** to plug in a real AI SDK.

### Option A: DeepAR

```bash
npm install deepar
```

```typescript
// lib/faceSwap.ts
import DeepAR from 'deepar';

let deepAR: DeepAR | null = null;

export async function applyFaceSwapEffect(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  options: FaceSwapOptions = {}
) {
  if (!deepAR) {
    deepAR = await DeepAR.init({
      licenseKey: process.env.NEXT_PUBLIC_DEEPAR_LICENSE_KEY!,
      canvas,
    });
  }
  deepAR.setVideoElement(video, true);
  await deepAR.switchEffect('./effects/aviators'); // your .deepar effect file
}
```

### Option B: TensorFlow.js face-api

```bash
npm install @tensorflow/tfjs @vladmandic/face-api
```

```typescript
import * as faceapi from '@vladmandic/face-api';

export async function applyFaceSwapEffect(video, canvas, options) {
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  const ctx = canvas.getContext('2d')!;

  const loop = async () => {
    ctx.drawImage(video, 0, 0);
    const detections = await faceapi.detectAllFaces(video).withFaceLandmarks();
    faceapi.draw.drawFaceLandmarks(canvas, detections);
    requestAnimationFrame(loop);
  };
  loop();
}
```

---

## Production Checklist

- [ ] Replace Agora "Testing" mode with a token server
- [ ] Add Agora webhook → Cloud Function to sync viewer counts
- [ ] Enable Firebase App Check (anti-abuse)
- [ ] Set up CDN for DeepAR effect files
- [ ] Add stream recording via Agora Cloud Recording API
- [ ] Rate-limit chat messages via Cloud Functions
- [ ] Add content moderation (e.g., Google Cloud Video Intelligence)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Auth | Firebase Anonymous Auth |
| Database | Firebase Firestore |
| Video Transport | Agora RTC SDK NG |
| AI Filter Pipeline | Canvas API (swap for DeepAR / TF.js) |
| Icons | Lucide React |
| Font | DM Sans (Google Fonts) |

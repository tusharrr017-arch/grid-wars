# Grid Wars

A premium real-time multiplayer grid application. Claim tiles on a shared 25×25 grid and compete with other players live.

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4**
- **shadcn/ui** components
- **Framer Motion** animations
- **Magic UI** & **Aceternity UI** inspired components
- **Socket.IO** for real-time multiplayer
- **React Zoom Pan Pinch** for grid navigation

## Getting Started

```bash
# Install dependencies
npm install

# Start both the Socket.IO server and Vite dev server
npm run dev:all
```

Open [http://localhost:5173](http://localhost:5173) in multiple browser tabs to test multiplayer.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server only |
| `npm run server` | Start Socket.IO server (port 3001) |
| `npm run dev:all` | Start both server and client |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Features

- 25×25 interactive tile grid with zoom & pan
- Real-time tile claiming with Socket.IO
- Live leaderboard and capture feed
- Animated backgrounds (aurora, particles, meteors, spotlight)
- Glass morphism UI inspired by Linear & Vercel
- Dark/light theme toggle
- Smooth Framer Motion animations on every interaction

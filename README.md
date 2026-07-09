# Grid Wars

A real-time multiplayer territory map where multiple users compete to claim tiles on a shared **25×25** board. Every tile claim is synchronized instantly using **Socket.IO**, with live leaderboards, activity feeds, and persistent player identity across reconnects.

---

##  Live Demo

**Demo:** https://your-demo-url.com

---

##  Features

- Real-time multiplayer using Socket.IO
- Shared 25×25 interactive territory grid
- Instant tile claiming with conflict handling
- Persistent player identity across refreshes
- Live leaderboard
- Real-time activity feed
- Responsive UI for desktop and mobile
- Smooth animations and micro-interactions
- Modern dark interface with live visual feedback

---

## 🛠 Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion
- shadcn/ui

### Backend

- Node.js
- Express
- Socket.IO

---

##  Project Structure

```
server/
└── index.js

src/
├── components/
├── hooks/
├── lib/
├── assets/
├── types/
└── main.tsx
```

---

##  Architecture

The server acts as the **single source of truth** for tile ownership.

When a player claims a tile:

1. The client sends a claim request through Socket.IO.
2. The server validates ownership.
3. The shared game state is updated.
4. The updated tile is broadcast to every connected player.
5. All clients instantly update their UI.

```
 Browser A
      │
      │
 Socket.IO
      │
──────────────
 Node Server
──────────────
      │
 Broadcast Updates
      │
Browser B
Browser C
Browser D
```

---

##  How It Works

1. Join the shared territory map.
2. Choose a display name and color.
3. Click an unclaimed tile to capture it.
4. Every connected player immediately sees the update.
5. Compete to control the largest territory and climb the leaderboard.

---

##  Getting Started

Install dependencies:

```bash
npm install
```

Start both the frontend and backend:

```bash
npm run dev:all
```

Open:

```
http://localhost:5173
```

Open multiple browser tabs or devices to test the real-time multiplayer functionality.

---

##  Available Scripts

| Command | Description |
|----------|-------------|
| `npm run dev` | Start the frontend |
| `npm run server` | Start the Socket.IO server |
| `npm run dev:all` | Start frontend and backend |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

##  Design Decisions

- Socket.IO was chosen for low-latency real-time communication.
- The server is the source of truth to prevent conflicting tile ownership.
- Optimistic UI updates provide immediate feedback while keeping the server authoritative.
- Player identity is stored in `localStorage` so reconnecting users retain their name and color.
- Components are modular and organized for maintainability.

---

##  Trade-offs

To keep the assignment focused and lightweight:

- Game state is currently stored in memory.
- Restarting the server resets the board.
- No authentication is required.
- The application is designed for a single shared game room.

A production implementation would use:

- PostgreSQL or Redis for persistence
- Authentication
- Multiple game rooms
- Horizontal scaling with the Socket.IO Redis Adapter

---

##  Future Improvements

- Persistent PostgreSQL database
- Spectator mode
- Territory statistics
- Tile cooldown mechanics
- User authentication
- Multiple game rooms
- Redis adapter for horizontal scaling
- Replay and match history

---

## Screenshots
1 )Gameplay
<img width="838" height="839" alt="image" src="https://github.com/user-attachments/assets/31ec5fab-2b53-4adf-8bf7-e1f849107c09" />

2) Live Multiplayer
<img width="1492" height="903" alt="image" src="https://github.com/user-attachments/assets/ccd89968-6870-4569-809b-6fd11432c65f" />


---

##  Notes

This project was built as part of a real-time multiplayer engineering assignment, with a focus on backend synchronization, real-time communication, responsive UI, and clean architecture.

---

##  License

MIT

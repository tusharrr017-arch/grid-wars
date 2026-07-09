# Grid Wars

A real-time multiplayer territory map where multiple users compete to claim tiles on a shared 25×25 board. Every tile update is synchronized instantly using Socket.IO, with live leaderboards, activity feeds, and persistent player identity.

## Live Demo

**Demo:** https://your-demo-url.com

## Repository

https://github.com/tusharrr017-arch/grid-wars

---

## Features

- Real-time multiplayer using Socket.IO
- Shared 25×25 interactive grid
- Live tile claiming with conflict handling
- Persistent player identity across refreshes
- Live leaderboard
- Real-time activity feed
- Responsive UI
- Smooth micro-interactions
- Modern dark UI inspired by Linear & Vercel

---

## Tech Stack

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

## Project Structure

```
server/
  index.js

src/
  components/
  hooks/
  lib/
  types/
```

---

## Architecture

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
Broadcast updates
      │
Browser B
Browser C
Browser D
```

The server is the source of truth for tile ownership. When a player claims a tile, the server validates the request, updates ownership, and broadcasts the change to every connected client.

---

## Getting Started

```bash
npm install
npm run dev:all
```

Open multiple browser tabs at:

http://localhost:5173

to test multiplayer.

---

## Available Scripts

| Command | Description |
|----------|-------------|
| npm run dev | Frontend |
| npm run server | Backend |
| npm run dev:all | Both |
| npm run build | Production build |

---

## Design Decisions

- Used Socket.IO for low-latency realtime updates.
- Used optimistic UI updates for responsive interactions.
- Player identity is stored in localStorage so reconnecting users keep their name and color.
- The server remains the source of truth to prevent conflicting tile ownership.

---

## Trade-offs

- Game state is currently stored in memory.
- Restarting the server resets the board.
- This keeps the implementation simple for the assignment.
- A production version would persist state in PostgreSQL or Redis.

---

## Future Improvements

- Persistent database
- Spectator mode
- Tile cooldowns
- Territory statistics
- User authentication
- Room support
- Redis adapter for horizontal scaling

---

## Screenshots
1)Preview
<img width="838" height="839" alt="image" src="https://github.com/user-attachments/assets/31ec5fab-2b53-4adf-8bf7-e1f849107c09" />

2)Game
<img width="1492" height="903" alt="image" src="https://github.com/user-attachments/assets/ccd89968-6870-4569-809b-6fd11432c65f" />


---

## License

MIT

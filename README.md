# Nexus ⬡

**Real-time collaborative coding platform** — multiple developers, one shared room, instant sync.

> Nexus is a modernised rebuild concept, using the same MERN + Socket.IO stack with a fresh dark-red developer UI, VS Code editor theme, and JWT auth.

https://github.com/user-attachments/assets/5ac59330-d2b8-451a-b53b-8e9fae5748dc

---

## Features

| Feature | Details |
|---|---|
| 🔐 Auth | JWT register / login |
| 🏠 Rooms | Create, join, leave public/private rooms |
| ✏️ Editor | CodeMirror 6 + VS Code Dark theme, 6 languages |
| 🔄 Sync | Real-time code sync via Socket.IO |
| 💬 Chat | Per-room chat with typing indicators |
| 👥 Online users | Live user list with presence |
| 🌐 Responsive | Works on desktop and mobile |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, CodeMirror 6, React Router 6 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Real-time | Socket.IO 4 |
| Auth | JWT + bcrypt |
| Styles | Custom CSS (glassmorphism, dark red) |

---

## Folder Structure

```
nexus/
├── server/
│   ├── index.js              # Entry point
│   ├── models/
│   │   ├── User.js
│   │   └── Room.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── rooms.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   └── socket/
│       └── socketHandler.js
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── index.css
│       ├── context/
│       │   └── AuthContext.js
│       ├── utils/
│       │   ├── api.js
│       │   └── socket.js
│       ├── pages/
│       │   ├── LoginPage.js
│       │   ├── RegisterPage.js
│       │   ├── DashboardPage.js
│       │   ├── RoomPage.js
│       │   └── ProfilePage.js
│       └── components/
│           ├── Layout/Navbar.js
│           ├── Editor/CodeEditor.js
│           ├── Chat/ChatPanel.js
│           └── Room/UsersPanel.js
├── .env.example
├── package.json
└── README.md
```

---

## Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & install

```bash
git clone <your-repo>
cd nexus

# Install server deps
npm install

# Install client deps
cd client && npm install && cd ..
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/nexus
JWT_SECRET=change_me_to_something_long_and_random
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Run in development

```bash
# Terminal 1 — backend
npm run dev

# Terminal 2 — frontend
npm run client
```

Or both together:
```bash
npm run dev:full
```

Open: http://localhost:3000

---

## Socket Events

### Client → Server
| Event | Payload |
|---|---|
| `join_room` | `{ roomId, userId, username }` |
| `code_change` | `{ roomId, code }` |
| `language_change` | `{ roomId, language }` |
| `send_message` | `{ roomId, userId, username, content }` |
| `typing_start` | `{ roomId, username }` |
| `typing_stop` | `{ roomId, username }` |
| `leave_room` | `{ roomId, username }` |

### Server → Client
| Event | Payload |
|---|---|
| `room_joined` | `{ code, language, messages }` |
| `code_update` | `{ code }` |
| `language_update` | `{ language }` |
| `users_update` | `{ users }` |
| `new_message` | `{ username, content, timestamp }` |
| `user_joined` | `{ username }` |
| `user_left` | `{ username }` |
| `user_typing` | `{ username }` |
| `user_stopped_typing` | `{ username }` |

---

## API Routes

### Auth
```
POST /api/auth/register   { username, email, password }
POST /api/auth/login      { email, password }
GET  /api/auth/me         (Bearer token)
```

### Rooms
```
GET    /api/rooms          List public rooms
POST   /api/rooms          Create room
GET    /api/rooms/:roomId  Get room
DELETE /api/rooms/:roomId  Delete room (owner only)
```

### Users
```
GET /api/users/profile
PUT /api/users/profile   { bio, avatar }
```

---

## Deployment

### Backend (Railway / Render / Fly.io)
1. Set env vars: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL`
2. Build command: `npm install`
3. Start command: `node server/index.js`

### Frontend (Vercel / Netlify)
1. Build directory: `client`
2. Build command: `npm run build`
3. Set `REACT_APP_SERVER_URL` to your backend URL

### Full-stack (single process)
Set `NODE_ENV=production` — the Express server serves the React build from `client/build`.

```bash
cd client && npm run build && cd ..
NODE_ENV=production node server/index.js
```

---

## License
MIT

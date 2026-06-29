# FILE_TREE.md

> **Purpose:** The ground truth of what actually exists in the codebase right now. This is NOT the planned structure — it is the real structure. Update this file every time you add, delete, or rename a file or folder. Any AI tool must use this file to know where things live — never assume from the plan in ARCHITECTURE.md alone.
>
> **Rule:** If FILE_TREE.md and ARCHITECTURE.md disagree, FILE_TREE.md wins. It reflects reality.

---

## How To Update This File

Run this command from inside the `backend/` folder:

```bash
find src -not -path '*/node_modules/*' | sort | sed 's|[^/]*/|  |g'
```

Or if you have the `tree` command installed:

```bash
tree src/ -I node_modules
```

Copy the output and paste it into the "Current Tree" section below. Takes 30 seconds. Do it every time the structure changes.

---

## Last Updated

```
Day:  3
Date: [ fill in today's date ]
What changed: Day 1 + Day 2 complete.
              Day 1: index.js, .env, .env.example, .gitignore,
                     package.json, routes/test.js, __tests__/setup.js,
                     __tests__/health.test.js created.
              Day 2: config/db.js, models/User.js, models/Room.js,
                     models/Message.js, __tests__/db.test.js created.
              Connection uses direct shard addresses — NOT mongodb+srv.
              Reason: ISP blocks SRV DNS on this machine.
              See MONGODB_CONNECTION_GUIDE.md for full details.
```

---

## Current Tree — Backend

> Replace this block every time you run the tree command.

```
backend/
├── index.js                          [x]
├── .env                              [x]
├── .env.example                      [x]
├── .gitignore                        [x]
├── package.json                      [x]
└── src/
    ├── config/
    │   ├── db.js                     [x]
    │   └── cloudinary.js             [ ] Day 6
    ├── controllers/
    │   ├── authController.js         [ x ] Day 3
    │   ├── roomController.js         [ ] Day 4
    │   └── messageController.js      [ ] Day 4
    ├── middleware/
    │   ├── protect.js                [ x ] Day 3
    │   ├── errorHandler.js           [x  ] Day 3
    │   └── upload.js                 [ ] Day 6
    ├── models/
    │   ├── User.js                   [x]
    │   ├── Room.js                   [x]
    │   └── Message.js                [x]
    ├── routes/
    │   ├── test.js                   [x]
    │   ├── auth.js                   [ x ] Day 3
    │   ├── rooms.js                  [ ] Day 4
    │   ├── messages.js               [ ] Day 4
    │   └── upload.js                 [ ] Day 6
    ├── socket/
    │   ├── index.js                  [ ] Day 5
    │   └── handlers/
    │       ├── messageHandler.js     [ ] Day 5
    │       └── roomHandler.js        [ ] Day 5
    ├── utils/
    │   ├── AppError.js               [ x ] Day 3
    │   └── asyncHandler.js           [ x ] Day 3
    └── __tests__/
        ├── setup.js                  [x]
        ├── health.test.js            [x] ← added Day 1 (not in original plan)
        ├── db.test.js                [x]
        ├── auth.test.js              [ x ] Day 3
        ├── rooms.test.js             [ ] Day 4
        ├── messages.test.js          [ ] Day 4
        └── socket.test.js            [ ] Day 5
```

---

## Current Tree — Frontend

> Frontend is built on Day 7. Until then, this section stays empty.

```
frontend/                             [ ] starts Day 7
```

---

## File Status Key

```
[ ] → planned, not created yet
[x] → created and working
[~] → created but incomplete / in progress
[!] → created but has a known issue (see AI_MEMORY.md)
```

---

## What Each File Does (Quick Reference)

> This is the single-line purpose of every file. Update when you add new files.
> AI tools: use this table to know exactly which file to edit for any given task.

### Backend

| File | Single responsibility |
|------|-----------------------|
| `index.js` | Entry point — creates Express app, HTTP server, registers all middleware and routes |
| `src/config/db.js` | Connects Mongoose to MongoDB Atlas using direct shard addresses (not SRV) |
| `src/config/cloudinary.js` | Configures Cloudinary SDK with credentials |
| `src/controllers/authController.js` | Handles register, login, getMe logic |
| `src/controllers/roomController.js` | Handles createRoom, getRooms, getRoomById logic |
| `src/controllers/messageController.js` | Handles getMessages with pagination |
| `src/middleware/protect.js` | Verifies JWT token, attaches req.user |
| `src/middleware/errorHandler.js` | Global error handler — catches all errors, formats response |
| `src/middleware/upload.js` | Multer + Cloudinary storage config for avatar uploads |
| `src/models/User.js` | Mongoose User schema + pre-save password hash + matchPassword method |
| `src/models/Room.js` | Mongoose Room schema |
| `src/models/Message.js` | Mongoose Message schema |
| `src/routes/test.js` | GET /api/health — confirms server is running |
| `src/routes/auth.js` | Auth routes: /api/auth/* |
| `src/routes/rooms.js` | Room routes: /api/rooms/* |
| `src/routes/messages.js` | Message routes: /api/messages/* |
| `src/routes/upload.js` | Upload routes: /api/upload/* |
| `src/socket/index.js` | Initializes Socket.io, registers auth middleware, registers handlers |
| `src/socket/handlers/messageHandler.js` | send-message, typing, stop-typing socket events |
| `src/socket/handlers/roomHandler.js` | join-room, leave-room socket events |
| `src/utils/AppError.js` | Custom error class with statusCode and message |
| `src/utils/asyncHandler.js` | Wraps async controller functions, passes errors to next() |
| `src/__tests__/setup.js` | Global Jest timeout config (jest.setTimeout) |
| `src/__tests__/health.test.js` | Tests GET /api/health → 200, unknown routes → 404 |
| `src/__tests__/db.test.js` | Tests all 3 Mongoose models — CRUD, validation, populate, sort |
| `src/__tests__/auth.test.js` | Tests auth endpoints (register, login, protect middleware) |
| `src/__tests__/rooms.test.js` | Tests room CRUD endpoints |
| `src/__tests__/messages.test.js` | Tests message fetch and pagination |
| `src/__tests__/socket.test.js` | Tests Socket.io connection, events, real-time messaging |

### Frontend (added Day 7+)

| File | Single responsibility |
|------|-----------------------|
| `frontend/lib/axios.js` | Axios instance with baseURL + JWT interceptor |
| `frontend/lib/socket.js` | socket.io-client singleton — one connection shared across the app |
| `frontend/context/AuthContext.jsx` | Global auth state — current user, login(), logout() |
| `frontend/hooks/useSocket.js` | Manages socket connection lifecycle (connect on auth, disconnect on logout) |
| `frontend/hooks/useAuth.js` | Reads auth state from AuthContext |
| `frontend/hooks/useMessages.js` | Fetches paginated messages via REST, appends new ones from socket |
| `frontend/hooks/useRooms.js` | Fetches rooms list, handles room creation |
| `frontend/components/ui/Button/Button.jsx` | Base button component (Tailwind styled) |
| `frontend/components/ui/Input/Input.jsx` | Base input component |
| `frontend/components/ui/Avatar/Avatar.jsx` | User avatar with fallback initials |
| `frontend/components/ui/Modal/Modal.jsx` | Radix UI Dialog wrapper |
| `frontend/components/Navbar/Navbar.jsx` | Top navbar — assembles SearchBar + NavButton |
| `frontend/components/Navbar/SearchBar.jsx` | Search input logic only |
| `frontend/components/Navbar/NavButton.jsx` | Nav-specific button only |
| `frontend/components/Sidebar/Sidebar.jsx` | Left sidebar — assembles RoomListItem list |
| `frontend/components/Sidebar/RoomListItem.jsx` | Single room entry in the sidebar |
| `frontend/components/Sidebar/NewRoomButton.jsx` | Button that opens the create room modal |
| `frontend/components/Chat/ChatWindow.jsx` | Scrollable message area |
| `frontend/components/Chat/MessageBubble.jsx` | Single message display (sent vs received styling) |
| `frontend/components/Chat/MessageInput.jsx` | Text input + send button, emits send-message |
| `frontend/components/Chat/TypingIndicator.jsx` | Displays "X is typing..." |
| `frontend/components/Auth/LoginForm.jsx` | Login form — calls POST /api/auth/login |
| `frontend/components/Auth/RegisterForm.jsx` | Register form — calls POST /api/auth/register |

---

## Import Paths Reference

> Use these exact import paths. Never guess or invent paths.

```javascript
// From a controller
import User from '../models/User.js';
import Room from '../models/Room.js';
import Message from '../models/Message.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

// From a route file
import protect from '../middleware/protect.js';
import { register, login, getMe } from '../controllers/authController.js';

// From index.js
import connectDB from './src/config/db.js';
import authRouter from './src/routes/auth.js';
import roomsRouter from './src/routes/rooms.js';
import messagesRouter from './src/routes/messages.js';
import errorHandler from './src/middleware/errorHandler.js';

// From a test file
import request from 'supertest';
import app from '../../index.js';   // ← note: two levels up from __tests__/
```

---

## Naming Conventions

| Thing | Convention | Example |
|-------|------------|---------|
| Files | camelCase | `authController.js` |
| Folders | camelCase | `controllers/` |
| React components | PascalCase file + folder | `MessageBubble/MessageBubble.jsx` |
| Variables | camelCase | `const roomId` |
| Constants | SCREAMING_SNAKE | `const JWT_SECRET` |
| Mongoose models | PascalCase | `User`, `Room`, `Message` |
| Route paths | lowercase-hyphen | `/api/chat-rooms` |
| Socket events | kebab-case | `send-message`, `join-room` |
| Env variables | SCREAMING_SNAKE | `MONGO_URI`, `JWT_SECRET` |

---

## Test Results Log

| Day | Test file | Tests | Status |
|-----|-----------|-------|--------|
| 1 | health.test.js | 2/2 | ✓ passing |
| 2 | db.test.js | 13/13 | ✓ passing |
| 3 | auth.test.js | — | not built yet |
| 4 | rooms.test.js | — | not built yet |
| 4 | messages.test.js | — | not built yet |
| 5 | socket.test.js | — | not built yet |

**Total passing: 15/15**

---

*Last updated: Day 3. Run the tree command and paste the output every time you add or move a file. This is the most important file for AI accuracy mid-project.*
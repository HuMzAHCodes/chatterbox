# ARCHITECTURE.md

> **Purpose:** Describes the complete folder structure, how a request travels through the backend, how Socket.io events flow, and how the frontend is organized. Any AI tool reading this should be able to place a new file in exactly the right location without asking.

---

## 1. Complete Folder Structure

```
chatterbox/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                  ← MongoDB connection (Mongoose)
│   │   │   └── cloudinary.js          ← Cloudinary SDK config
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js      ← register, login, getMe
│   │   │   ├── roomController.js      ← createRoom, getRooms, getRoomById
│   │   │   └── messageController.js   ← getMessages (paginated)
│   │   │
│   │   ├── middleware/
│   │   │   ├── protect.js             ← JWT verification, attaches req.user
│   │   │   ├── errorHandler.js        ← global error catcher (4 param middleware)
│   │   │   └── upload.js              ← Multer + Cloudinary upload middleware
│   │   │
│   │   ├── models/
│   │   │   ├── User.js                ← User schema
│   │   │   ├── Room.js                ← Room schema
│   │   │   └── Message.js             ← Message schema
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.js                ← /api/auth/*
│   │   │   ├── rooms.js               ← /api/rooms/*
│   │   │   └── messages.js            ← /api/messages/*
│   │   │
│   │   ├── socket/
│   │   │   ├── index.js               ← initializes Socket.io, registers handlers
│   │   │   └── handlers/
│   │   │       ├── messageHandler.js  ← send-message, typing events
│   │   │       └── roomHandler.js     ← join-room, leave-room events
│   │   │
│   │   ├── utils/
│   │   │   ├── AppError.js            ← custom error class
│   │   │   └── asyncHandler.js        ← wraps async controllers, catches errors
│   │   │
│   │   └── __tests__/
│   │       ├── setup.js               ← test DB connect/disconnect
│   │       ├── auth.test.js
│   │       ├── rooms.test.js
│   │       └── messages.test.js
│   │
│   ├── .env                           ← secrets (never commit)
│   ├── .env.example                   ← template with key names (commit this)
│   ├── .gitignore
│   ├── package.json
│   └── index.js                       ← entry point: creates app + HTTP server
│
└── frontend/
    ├── app/                           ← Next.js App Router pages
    │   ├── layout.jsx                 ← root layout
    │   ├── page.jsx                   ← landing / redirect
    │   ├── (auth)/
    │   │   ├── login/page.jsx
    │   │   └── register/page.jsx
    │   └── (chat)/
    │       ├── layout.jsx             ← chat shell (sidebar + main area)
    │       └── rooms/
    │           ├── page.jsx           ← room list
    │           └── [roomId]/page.jsx  ← active chat room
    │
    ├── components/
    │   ├── ui/                        ← shared primitives (used everywhere)
    │   │   ├── Button/
    │   │   │   ├── Button.jsx
    │   │   │   └── index.js
    │   │   ├── Input/
    │   │   │   ├── Input.jsx
    │   │   │   └── index.js
    │   │   ├── Avatar/
    │   │   │   ├── Avatar.jsx
    │   │   │   └── index.js
    │   │   └── Modal/
    │   │       ├── Modal.jsx          ← Radix UI Dialog wrapper
    │   │       └── index.js
    │   │
    │   ├── Navbar/
    │   │   ├── Navbar.jsx
    │   │   ├── SearchBar.jsx
    │   │   ├── NavButton.jsx
    │   │   └── index.js
    │   │
    │   ├── Sidebar/
    │   │   ├── Sidebar.jsx
    │   │   ├── RoomListItem.jsx
    │   │   ├── NewRoomButton.jsx
    │   │   └── index.js
    │   │
    │   ├── Chat/
    │   │   ├── ChatWindow.jsx         ← scrollable message area
    │   │   ├── MessageBubble.jsx      ← single message display
    │   │   ├── MessageInput.jsx       ← text input + send button
    │   │   ├── TypingIndicator.jsx    ← "User is typing..."
    │   │   └── index.js
    │   │
    │   └── Auth/
    │       ├── LoginForm.jsx
    │       ├── RegisterForm.jsx
    │       └── index.js
    │
    ├── hooks/
    │   ├── useSocket.js               ← socket connection + event listeners
    │   ├── useAuth.js                 ← current user, login, logout
    │   ├── useMessages.js             ← fetch + paginate messages
    │   └── useRooms.js                ← fetch + create rooms
    │
    ├── lib/
    │   ├── axios.js                   ← axios instance with JWT interceptor
    │   └── socket.js                  ← socket.io-client singleton
    │
    ├── context/
    │   └── AuthContext.jsx            ← global auth state provider
    │
    ├── .env.local                     ← NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SOCKET_URL
    └── package.json
```

---

## 2. Backend Request Lifecycle

Every HTTP request follows this exact path through the backend:

```
Client (Browser / Postman)
        │
        │  HTTP Request
        ▼
index.js (Express app)
        │
        ├── Global middleware runs first (in this order):
        │     morgan()          → logs the request
        │     helmet()          → sets security headers
        │     cors()            → allows frontend origin
        │     express.json()    → parses req.body
        │     rateLimit()       → blocks if too many requests
        │
        ▼
Route file (e.g. routes/rooms.js)
        │
        ├── Route-level middleware (if protected):
        │     protect()         → verifies JWT, sets req.user
        │
        ▼
Controller function (e.g. roomController.js → createRoom)
        │
        ├── Wrapped in asyncHandler() → any thrown error auto-goes to errorHandler
        │
        ├── Reads req.body, req.params, req.query, req.user
        ├── Calls Mongoose model (User, Room, Message)
        ├── Sends response: res.status(200).json({ success: true, data: ... })
        │
        └── On error: throws new AppError('message', statusCode)
                │
                ▼
        errorHandler middleware (middleware/errorHandler.js)
                │
                └── Sends: res.status(err.statusCode).json({ success: false, message: err.message })
```

---

## 3. Socket.io Event Flow

Socket.io runs parallel to the REST API on the same HTTP server. Here is the full event lifecycle:

```
Client connects
        │
        ▼
socket/index.js → io.use() auth middleware
        │   Reads token from socket.handshake.auth.token
        │   Verifies JWT → attaches socket.user
        │   If invalid → disconnects with error
        │
        ▼
io.on('connection', (socket) => { ... })
        │
        ├── registers messageHandler(io, socket)
        └── registers roomHandler(io, socket)


── ROOM EVENTS ──────────────────────────────────────────

Client emits:   join-room   { roomId }
        │
        ▼
roomHandler.js
        │   socket.join(roomId)
        │   io.to(roomId).emit('user-joined', { userId, username })
        └── emits back: 'joined-room' { roomId }

Client emits:   leave-room  { roomId }
        │
        ▼
roomHandler.js
        │   socket.leave(roomId)
        └── io.to(roomId).emit('user-left', { userId, username })


── MESSAGE EVENTS ───────────────────────────────────────

Client emits:   send-message  { roomId, content }
        │
        ▼
messageHandler.js
        │   Creates Message document in MongoDB
        │   Populates sender (name, avatar)
        └── io.to(roomId).emit('new-message', { _id, sender, content, createdAt })

Client emits:   typing        { roomId }
        │
        ▼
messageHandler.js
        └── socket.to(roomId).emit('user-typing', { userId, username })
            (socket.to = everyone in room EXCEPT sender)

Client emits:   stop-typing   { roomId }
        │
        ▼
messageHandler.js
        └── socket.to(roomId).emit('user-stop-typing', { userId })


── DISCONNECT ───────────────────────────────────────────

Client disconnects (tab close, network drop)
        │
        ▼
io.on('disconnect')
        └── io.emit('user-offline', { userId })
```

---

## 4. Authentication Flow (REST + Socket)

```
── REST AUTH ────────────────────────────────────────────

POST /api/auth/register
  → hash password with bcrypt
  → save User to DB
  → sign JWT (accessToken, 7d expiry)
  → return { token, user }

POST /api/auth/login
  → find user by email
  → compare password with bcrypt
  → sign JWT
  → return { token, user }

Protected route request:
  → Client sends: Authorization: Bearer <token>
  → protect.js: jwt.verify(token, JWT_SECRET)
  → attaches decoded user to req.user
  → calls next() → controller runs


── SOCKET AUTH ──────────────────────────────────────────

Client connects:
  socket = io(URL, { auth: { token: localStorage.getItem('token') } })

Server middleware (socket/index.js):
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    const decoded = jwt.verify(token, JWT_SECRET)
    socket.user = decoded
    next()
  })
```

---

## 5. Environment Variables Reference

All variables live in `backend/.env`. See `ENV_AND_CONFIG.md` for the full list with descriptions.

```
PORT=5000
MONGO_URI=mongodb+srv://...
MONGO_URI_TEST=mongodb+srv://...   ← separate DB for tests
JWT_SECRET=...
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIENT_URL=http://localhost:3000
```

---

## 6. API Route Map (Summary)

Full request/response details are in `API_REFERENCE.md`. This is the quick map.

```
AUTH
  POST   /api/auth/register       public
  POST   /api/auth/login          public
  GET    /api/auth/me             protected

ROOMS
  POST   /api/rooms               protected
  GET    /api/rooms               protected
  GET    /api/rooms/:id           protected

MESSAGES
  GET    /api/messages/:roomId    protected   ?page=1&limit=20
  (messages are created via Socket.io, not REST)

UPLOADS
  POST   /api/upload/avatar       protected   multipart/form-data
```

---

*Last updated: Day 1. Update the folder tree in Section 1 whenever you add or rename a file. Use `tree src/` and paste the output into `FILE_TREE.md` after any structural change.*

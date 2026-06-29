# PHASES.md

> **Purpose:** The complete day-by-day execution plan for the project. Each phase lists exactly what to build, what files to create, automated test cases to write, and manual Postman test cases to run. Update the status checkboxes as you complete tasks — this is your progress tracker.
>
> **How to use:** At the start of each day, read the phase. At the end, check off completed tasks and copy the day's summary into `CURRENT_TASK.md`.

---

## Status Legend

```
[ ] → not started
[x] → done
[~] → in progress
[!] → blocked / has an issue (note it in AI_MEMORY.md)
```

---

## WEEK 1 — Backend

---

### Day 1 — Project setup + Express fundamentals

**Goal:** A running Express server with a clean folder structure, working routes, and environment config.

#### Tasks
- [x ] Run `npm init -y` inside `backend/`
- [ x] Install dependencies: `express dotenv morgan helmet cors express-rate-limit`
- [ x] Install dev dependencies: `nodemon jest supertest`
- [x ] Set `"type": "module"` in `package.json`
- [x ] Add scripts to `package.json`: `"start": "node index.js"`, `"dev": "nodemon index.js"`, `"test": "jest --runInBand --forceExit"`
- [x ] Create folder structure: `src/config`, `src/controllers`, `src/middleware`, `src/models`, `src/routes`, `src/socket`, `src/utils`, `src/__tests__`
- [x ] Create `index.js` — Express app + HTTP server on `PORT` from `.env`
- [ x] Add global middleware: `morgan`, `helmet`, `cors`, `express.json()`, `rateLimit`
- [ x] Create `.env` with `PORT=5000`, `NODE_ENV=development`
- [x ] Create `.env.example` with key names but no values
- [x ] Create `.gitignore` — add `node_modules`, `.env`
- [x ] Create `src/routes/test.js` — `GET /api/health` returns `{ success: true, message: "Server is running" }`
- [x ] Test the server starts with `npm run dev`

#### Automated tests (write in `src/__tests__/`)
- [x ] `src/__tests__/setup.js` — connect to `MONGO_URI_TEST`, disconnect after all tests
- [x ] Test: `GET /api/health` returns 200 with `{ success: true }`

#### Manual Postman tests
```
1. GET http://localhost:5000/api/health
   Expected: 200 { "success": true, "message": "Server is running" }

2. GET http://localhost:5000/api/nonexistent
   Expected: 404 (or whatever your default Express 404 returns)
```

#### Files created this day
```
backend/
├── index.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── src/
    ├── routes/test.js
    └── __tests__/setup.js
```

---

### Day 2 — MongoDB + Mongoose data modeling

**Goal:** MongoDB Atlas connected, all three models created, basic CRUD verified.

#### Tasks
- [ x] Create a free MongoDB Atlas account + M0 cluster
- [ x] Create two databases: `chatterbox_dev` and `chatterbox_test`
- [ ] Add `MONGO_URI` and `MONGO_URI_TEST` to `.env`
- [ x] Create `src/config/db.js` — Mongoose connect function
- [x ] Call `connectDB()` in `index.js` before starting the server
- [x ] Create `src/models/User.js` — full schema (see `DATABASE_SCHEMA.md`)
- [x ] Create `src/models/Room.js` — full schema
- [x ] Create `src/models/Message.js` — full schema
- [ x] Write a quick manual test script to verify: create a User, find it, delete it
- [x ] Confirm indexes are created in Atlas dashboard

#### Automated tests
- [x ] `src/__tests__/db.test.js`
  - [ x] Can connect to test DB
  - [ x] `User.create()` saves a document with hashed password
  - [ x] `User.findOne({ email })` retrieves the user
  - [ x] `user.matchPassword()` returns true for correct password, false for wrong
  - [ x] Duplicate email throws a validation error
  - [ x] `Room.create()` saves with correct fields
  - [ x] `Message.create()` saves with sender + room refs

#### Manual Postman tests
```
(No REST endpoints yet — use a temporary test script in index.js)

1. In index.js temporarily add:
   import User from './src/models/User.js'
   const u = await User.create({ name: 'Test', email: 'test@test.com', password: '123456' })
   console.log(u)
   → Verify password is hashed (not plain text) in the console output

2. Open MongoDB Atlas → Browse Collections
   → Verify the user document exists with a hashed password field
   → Delete it manually after confirming
```

#### Files created this day
```
src/
├── config/db.js
├── models/
│   ├── User.js
│   ├── Room.js
│   └── Message.js
└── __tests__/
    └── db.test.js
```

---

### Day 3 — Authentication (JWT + bcrypt)

**Goal:** Working register/login endpoints, JWT issued on success, `protect` middleware guards routes.

#### Tasks
- [ x ] Install: `jsonwebtoken bcryptjs express-validator`
- [ x ] Add to `.env`: `JWT_SECRET`, `JWT_EXPIRE=7d`
- [ x ] Create `src/utils/AppError.js` — custom error class extending Error
- [ x ] Create `src/utils/asyncHandler.js` — wraps async functions, passes errors to next()
- [ x ] Create `src/middleware/errorHandler.js` — global 4-param error middleware
- [ x ] Register `errorHandler` in `index.js` (must be LAST middleware)
- [x  ] Create `src/controllers/authController.js` — `register`, `login`, `getMe`
- [ x ] Create `src/routes/auth.js` — wire routes to controllers
- [ x ] Create `src/middleware/protect.js` — verify JWT, attach `req.user`
- [ x ] Add auth router to `index.js`: `app.use('/api/auth', authRouter)`
- [ x ] Helper function `generateToken(userId)` — signs and returns JWT

#### Automated tests (`src/__tests__/auth.test.js`)
- [x  ] `POST /api/auth/register` with valid data → 201, returns token + user (no password)
- [ x ] `POST /api/auth/register` with duplicate email → 400, error message
- [ x ] `POST /api/auth/register` with missing name → 400, validation error
- [ x ] `POST /api/auth/register` with short password → 400, validation error
- [ x ] `POST /api/auth/login` with correct credentials → 200, returns token
- [ x ] `POST /api/auth/login` with wrong password → 401, "Invalid credentials"
- [ x ] `POST /api/auth/login` with non-existent email → 401, "Invalid credentials"
- [ x ] `GET /api/auth/me` with valid token → 200, returns user (no password field)
- [ x ] `GET /api/auth/me` with no token → 401, "No token provided"
- [ x ] `GET /api/auth/me` with fake/invalid token → 401, "Token is invalid"

#### Manual Postman tests
```
1. POST http://localhost:5000/api/auth/register
   Body: { "name": "Ali", "email": "ali@test.com", "password": "secret123" }
   Expected: 201, token in response
   → Copy the token

2. POST http://localhost:5000/api/auth/register (same email again)
   Expected: 400, "Email already in use"

3. POST http://localhost:5000/api/auth/login
   Body: { "email": "ali@test.com", "password": "wrongpassword" }
   Expected: 401, "Invalid credentials"

4. POST http://localhost:5000/api/auth/login
   Body: { "email": "ali@test.com", "password": "secret123" }
   Expected: 200, token in response

5. GET http://localhost:5000/api/auth/me
   Header: Authorization: Bearer <token from step 4>
   Expected: 200, user object (confirm no password field in response)

6. GET http://localhost:5000/api/auth/me
   No Authorization header
   Expected: 401, "No token provided"
```

#### Files created this day
```
src/
├── controllers/authController.js
├── middleware/
│   ├── protect.js
│   └── errorHandler.js
├── routes/auth.js
├── utils/
│   ├── AppError.js
│   └── asyncHandler.js
└── __tests__/
    └── auth.test.js
```

---

### Day 4 — REST API (Rooms + Messages)

**Goal:** Full CRUD for rooms, paginated message history endpoint, input validation, all routes protected.

#### Tasks
- [ ] Install: `express-validator`
- [ ] Create `src/controllers/roomController.js` — `createRoom`, `getRooms`, `getRoomById`
- [ ] Create `src/routes/rooms.js` — all routes protected with `protect`
- [ ] Create `src/controllers/messageController.js` — `getMessages` (paginated)
- [ ] Create `src/routes/messages.js` — protected
- [ ] Add validation middleware inline in route files using `express-validator`
- [ ] Add room + message routers to `index.js`
- [ ] Ensure `createRoom` adds creator to `participants` automatically
- [ ] Ensure `getRoomById` returns 403 if user is not in `participants`
- [ ] Ensure `getMessages` returns 403 if user is not in room's `participants`

#### Automated tests (`src/__tests__/rooms.test.js`, `src/__tests__/messages.test.js`)
- [ ] `POST /api/rooms` authenticated → 201, room created, creator in participants
- [ ] `POST /api/rooms` no token → 401
- [ ] `POST /api/rooms` missing name → 400, validation error
- [ ] `GET /api/rooms` → only returns rooms user is participant of
- [ ] `GET /api/rooms/:id` user is participant → 200, full room object
- [ ] `GET /api/rooms/:id` user is NOT participant → 403
- [ ] `GET /api/rooms/:id` invalid ID → 404
- [ ] `GET /api/messages/:roomId` → 200, paginated array, sender populated
- [ ] `GET /api/messages/:roomId` with `?page=2&limit=5` → correct slice
- [ ] `GET /api/messages/:roomId` user not in room → 403

#### Manual Postman tests
```
1. POST http://localhost:5000/api/rooms
   Header: Authorization: Bearer <token>
   Body: { "name": "General", "description": "Main room", "isPrivate": false }
   Expected: 201, room object, participants array contains your user

2. POST http://localhost:5000/api/rooms
   No Authorization header
   Expected: 401

3. GET http://localhost:5000/api/rooms
   Header: Authorization: Bearer <token>
   Expected: 200, array of rooms (should contain the one you just created)

4. GET http://localhost:5000/api/rooms/:id  (use the _id from step 1)
   Header: Authorization: Bearer <token>
   Expected: 200, single room object

5. GET http://localhost:5000/api/messages/:roomId?page=1&limit=20
   Header: Authorization: Bearer <token>
   Expected: 200, empty data array (no messages yet), totalPages: 0
```

#### Files created this day
```
src/
├── controllers/
│   ├── roomController.js
│   └── messageController.js
├── routes/
│   ├── rooms.js
│   └── messages.js
└── __tests__/
    ├── rooms.test.js
    └── messages.test.js
```

---

### Day 5 — Socket.io real-time messaging

**Goal:** Socket.io running on the same server, authenticated connections, real-time messages flowing between clients, messages saved to MongoDB.

#### Tasks
- [ ] Install: `socket.io`
- [ ] In `index.js`: create `http.createServer(app)` and attach `socket.io` to it
- [ ] Create `src/socket/index.js` — initialize Socket.io, JWT auth middleware, register handlers
- [ ] Create `src/socket/handlers/roomHandler.js` — `join-room`, `leave-room`
- [ ] Create `src/socket/handlers/messageHandler.js` — `send-message`, `typing`, `stop-typing`
- [ ] In `messageHandler.js`: save Message to DB, update Room's `lastMessage`, populate sender, emit `new-message`
- [ ] In `socket/index.js`: emit `user-online` on connect, `user-offline` on disconnect
- [ ] Update `User.isOnline` on connect/disconnect
- [ ] Verify Socket.io auth middleware rejects connections with invalid tokens

#### Automated tests (`src/__tests__/socket.test.js`)
- [ ] Client can connect with valid JWT
- [ ] Client connection rejected with invalid JWT
- [ ] `join-room` → server emits `joined-room` back to sender
- [ ] `send-message` → message saved to DB
- [ ] `send-message` → `new-message` emitted to room with populated sender
- [ ] Two clients in same room: client A sends message → client B receives `new-message`
- [ ] `typing` → other clients in room receive `user-typing`

#### Manual tests (use two browser tabs or two Postman WebSocket connections)
```
1. Open two browser tabs at http://localhost:3000 (or use Postman WebSocket)
   → Log in as two different users (register two accounts first)

2. Both users join the same room
   → Tab 1: emit join-room { roomId }
   → Tab 2: emit join-room { roomId }
   → Both should receive user-joined event

3. Tab 1: emit send-message { roomId, content: "Hello!" }
   → Tab 1: receives new-message
   → Tab 2: receives new-message (this proves real-time works)
   → Check MongoDB Atlas → Messages collection → document should exist

4. Tab 1: emit typing { roomId }
   → Tab 2 should receive user-typing (NOT Tab 1 itself)

5. Close Tab 1
   → Tab 2 should receive user-offline event
   → Check MongoDB Atlas → Users collection → isOnline should be false
```

#### Files created this day
```
src/
├── socket/
│   ├── index.js
│   └── handlers/
│       ├── messageHandler.js
│       └── roomHandler.js
└── __tests__/
    └── socket.test.js
```

---

### Day 6 — Security, polish, file uploads

**Goal:** Production-grade middleware, avatar uploads via Cloudinary, clean error handling throughout, all routes audited.

#### Tasks
- [ ] Install: `multer`, `cloudinary`, `multer-storage-cloudinary`, `express-mongo-sanitize`, `xss-clean`
- [ ] Add Cloudinary credentials to `.env`
- [ ] Create `src/config/cloudinary.js` — configure Cloudinary SDK
- [ ] Create `src/middleware/upload.js` — Multer with Cloudinary storage, image-only filter, 2MB limit
- [ ] Create `src/routes/upload.js` — `POST /api/upload/avatar`, protected
- [ ] Update `authController.getMe` — return updated avatar URL
- [ ] Add `express-mongo-sanitize` and `xss-clean` to global middleware in `index.js`
- [ ] Audit every route — confirm all non-auth routes use `protect`
- [ ] Add a proper 404 handler in `index.js` for unknown routes
- [ ] Review all controllers — confirm all use `asyncHandler`, none use raw try/catch
- [ ] Run `npm test` — all tests must pass before moving to Day 7

#### Automated tests
- [ ] `POST /api/upload/avatar` with valid image → 200, returns Cloudinary URL
- [ ] `POST /api/upload/avatar` with non-image file → 400
- [ ] `POST /api/upload/avatar` no token → 401
- [ ] Re-run all previous tests — confirm nothing is broken

#### Manual Postman tests
```
1. POST http://localhost:5000/api/upload/avatar
   Header: Authorization: Bearer <token>
   Body: form-data, key: "avatar", value: any .jpg image file
   Expected: 200, { "data": { "avatar": "https://res.cloudinary.com/..." } }

2. GET http://localhost:5000/api/auth/me
   Expected: avatar field now contains the Cloudinary URL

3. POST http://localhost:5000/api/upload/avatar
   Body: form-data, key: "avatar", value: a .pdf file
   Expected: 400, "Please upload an image file"

4. Try sending a request with XSS payload in body:
   POST /api/auth/register
   Body: { "name": "<script>alert('xss')</script>", "email": "x@x.com", "password": "123456" }
   Expected: registers but name is sanitized (script tags stripped)
```

#### Files created this day
```
src/
├── config/cloudinary.js
├── middleware/upload.js
└── routes/upload.js
```

---

### Day 7 — Frontend connection + deployment

**Goal:** Minimal Next.js frontend connected to the backend, real-time chat working end-to-end, both services deployed.

#### Tasks

**Frontend:**
- [ ] Create Next.js app in `frontend/`: `npx create-next-app@latest`
- [ ] Install: `axios socket.io-client tailwindcss @radix-ui/react-dialog`
- [ ] Create `frontend/lib/axios.js` — axios instance with `baseURL` + JWT interceptor
- [ ] Create `frontend/lib/socket.js` — socket.io-client singleton
- [ ] Create `frontend/context/AuthContext.jsx` — login, logout, persist token in localStorage
- [ ] Create `frontend/hooks/useSocket.js` — connect on auth, disconnect on logout
- [ ] Build login page (`app/(auth)/login/page.jsx`) — calls `POST /api/auth/login`
- [ ] Build register page — calls `POST /api/auth/register`
- [ ] Build rooms list page — calls `GET /api/rooms`
- [ ] Build chat room page — loads messages via REST, new messages via Socket.io
- [ ] Build `MessageInput` component — emits `send-message` on submit
- [ ] Build `TypingIndicator` component — listens for `user-typing`

**Deployment:**
- [ ] Push backend to GitHub
- [ ] Deploy backend on Railway — add all `.env` variables in Railway dashboard
- [ ] Deploy frontend on Vercel — set `NEXT_PUBLIC_API_URL` to Railway URL
- [ ] Update `CLIENT_URL` in Railway env vars to Vercel URL (for CORS)
- [ ] Test full flow on production URLs

#### Final end-to-end manual test
```
1. Open deployed Vercel URL in two different browsers (or incognito)
2. Register two different users
3. User 1: create a room called "Test Room"
4. User 2: (for now, manually add to participants via Atlas or add a join endpoint)
5. Both users open "Test Room"
6. User 1 types a message → User 2 sees it appear in real time
7. User 2 starts typing → User 1 sees "User 2 is typing..."
8. Close User 1's browser → User 2 sees the offline indicator
→ If all 8 steps pass, the project is complete ✓
```

---

## WEEK 2 — Frontend (overview)

> Detailed day-by-day breakdown will be added at the start of Week 2.
> The backend API is fully built by this point — Week 2 is purely UI work.

**Planned focus areas:**
- Day 8: Component library setup (Tailwind + Radix UI primitives)
- Day 9: Auth pages + protected routing
- Day 10: Room sidebar + room creation flow
- Day 11: Chat window + message bubbles
- Day 12: Real-time features (typing indicator, online status)
- Day 13: Avatar upload + profile page
- Day 14: Polish, error states, loading skeletons, deploy final version

---

*Last updated: Day 1. Check off tasks as you complete them. If something is blocked, mark it [!] and log the issue in `AI_MEMORY.md`.*

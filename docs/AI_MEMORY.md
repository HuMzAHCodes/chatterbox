# AI_MEMORY.md

> **Purpose:** The long-term memory of this project. Every important decision, every gotcha discovered, every rule that must never be broken — lives here. Any AI tool reading this must treat every entry as a hard constraint. Never suggest something that contradicts an entry in this file.
>
> **Rule:** Add an entry here whenever you: make an architectural decision, hit a bug that took more than 30 minutes to fix, discover something that surprised you, or change an approach mid-project. Date every entry.

---

## How To Read This File

- **Decision** → a choice that was made and must not be reversed without a note
- **Gotcha** → something that behaved unexpectedly — don't repeat this mistake
- **Rule** → a hard coding standard for this project
- **Change** → something that replaced an earlier approach (always explains why)

---

## Decisions

---

### [Day 1] ES Modules over CommonJS

**Decision:** Using `import/export` (ES Modules) throughout the backend, not `require/module.exports`.

**How:** `"type": "module"` is set in `package.json`.

**Impact on AI:** Always generate `import x from 'y'` syntax. Never write `const x = require('y')`. Never write `module.exports = x`.

**Watch out for:** Some older npm packages and Stack Overflow answers use CommonJS. Translate them to ESM before using.

---

### [Day 1] async/await only — no .then() chains

**Decision:** All asynchronous code uses `async/await`. Promise chains (`.then().catch()`) are not used anywhere in this codebase.

**Impact on AI:** Never generate `.then()` or `.catch()`. Always use `await` inside `async` functions. Error handling goes through `asyncHandler` + `AppError`, not `.catch()` blocks.

---

### [Day 1] asyncHandler wraps every controller

**Decision:** Every async controller function is wrapped with `asyncHandler()` from `src/utils/asyncHandler.js`. No raw `try/catch` blocks in controllers.

```javascript
// CORRECT
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, data: user });
});

// WRONG — never do this
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
```

---

### [Day 1] Single response envelope shape

**Decision:** Every API response — success or error — uses the same envelope.

```javascript
// Success
res.status(200).json({ success: true, data: { ... } })

// Success with pagination
res.status(200).json({ success: true, count: N, page: N, totalPages: N, data: [...] })

// Error (sent by errorHandler middleware)
res.status(err.statusCode).json({ success: false, message: err.message })
```

**Impact on AI:** Never return a flat object. Never return `{ user: {...} }` or `{ token: '...' }` at the top level. Always wrap in `{ success: true, data: ... }`.

---

### [Day 2] Messages created via Socket.io, fetched via REST

**Decision:** Message creation happens exclusively through the `send-message` Socket.io event (not a POST REST endpoint). Message retrieval uses `GET /api/messages/:roomId`.

**Reason:** Creating via Socket allows instant broadcast to all room members without a second round-trip. Reading via REST allows easy pagination on initial load.

**Impact on AI:** Never generate a `POST /api/messages` REST endpoint. If asked to "add a message endpoint", clarify this is handled by Socket.io.

---

### [Day 2] Separate test database

**Decision:** Automated tests run against `MONGO_URI_TEST` (a completely separate Atlas database), never against `MONGO_URI` (the dev database).

**How:** `src/__tests__/setup.js` reads `process.env.MONGO_URI_TEST` to connect. Jest sets `NODE_ENV=test`.

**Impact on AI:** When writing test files, always use the test DB connection from `setup.js`. Never connect to the dev DB in tests.

---

### [Day 2] Never update passwords with findOneAndUpdate

**Decision:** The `pre('save')` hook in `User.js` only fires on `.save()`. Password changes must always use `.save()`, never `findOneAndUpdate()`.

```javascript
// CORRECT — hook fires, password gets hashed
user.password = newPassword;
await user.save();

// WRONG — hook does NOT fire, password saved as plain text
await User.findByIdAndUpdate(id, { password: newPassword });
```

---

### [Day 3] JWT stored in localStorage on frontend

**Decision:** JWT token is stored in `localStorage` on the frontend (for simplicity during learning).

**Known trade-off:** Not ideal for production (httpOnly cookies are more secure against XSS). This is acceptable for a learning project. Do not change to cookies unless explicitly decided.

**Impact on AI:** Frontend code reads token with `localStorage.getItem('token')`. Axios interceptor attaches it as `Authorization: Bearer <token>`.

---

### [Day 5] Socket.io auth via handshake, not middleware cookie

**Decision:** Socket.io connections are authenticated by passing the JWT in `socket.handshake.auth.token` on the client side.

```javascript
// Client
const socket = io(URL, { auth: { token: localStorage.getItem('token') } });

// Server (socket/index.js)
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // verify and attach socket.user
});
```

**Impact on AI:** Never suggest passing the token as a query param (`?token=...`) — that exposes it in server logs. Always use `handshake.auth`.

---

### [Day 6] Cloudinary for file storage, not local disk

**Decision:** All uploaded files (avatars) go to Cloudinary. Files are never stored on the local filesystem or Railway's disk.

**Reason:** Railway's filesystem is ephemeral — files are wiped on every deploy. Cloudinary persists forever.

**Impact on AI:** Never write `multer({ dest: 'uploads/' })`. Always use `multer-storage-cloudinary`. The Cloudinary config lives in `src/config/cloudinary.js`.

---

## Gotchas

---

### [Day 1] nodemon does not restart on .env changes

**Gotcha:** If you change a value in `.env`, nodemon will not restart the server. You must manually stop and restart with `npm run dev`.

---

### [Day 2] Mongoose does not throw on duplicate key by default in all cases

**Gotcha:** A duplicate `email` error from MongoDB comes back as error code `11000`, not a Mongoose ValidationError. Handle it specifically in `errorHandler.js`:

```javascript
if (err.code === 11000) {
  const field = Object.keys(err.keyValue)[0];
  return res.status(400).json({ success: false, message: `${field} already in use` });
}
```

---

### [Day 2] populate() returns null if referenced document is deleted

**Gotcha:** If a User who sent a message is deleted, `message.populate('sender')` returns `null` for that sender. Always check for null on the frontend before accessing `message.sender.name`.

---

### [Day 3] select: false on password requires explicit override

**Gotcha:** `password` has `select: false` in the User schema. To get it in a query (e.g. during login), you must explicitly add `.select('+password')` — the `+` is required.

```javascript
// CORRECT
const user = await User.findOne({ email }).select('+password');

// WRONG — password field will be undefined
const user = await User.findOne({ email });
```

---

### [Day 3] errorHandler must be registered LAST in index.js

**Gotcha:** Express error-handling middleware (4 parameters: `err, req, res, next`) must be registered after all routes. If registered before, it will never catch route errors.

```javascript
// CORRECT order in index.js
app.use('/api/auth', authRouter);
app.use('/api/rooms', roomsRouter);
// ... all other routes
app.use(errorHandler); // ← LAST
```

---

### [Day 5] socket.to() vs io.to() — know the difference

**Gotcha:** These look similar but behave differently:

```javascript
io.to(roomId).emit('event', data)
// → sends to EVERYONE in the room including the sender

socket.to(roomId).emit('event', data)
// → sends to everyone in the room EXCEPT the sender
```

Use `socket.to()` for typing indicators (you don't want to see your own "typing" indicator).
Use `io.to()` for new messages (sender should also receive confirmation).

---

### [Day 5] Socket.io rooms are in-memory only

**Gotcha:** Socket.io room memberships (`socket.join(roomId)`) are stored in memory, not in MongoDB. If the server restarts, all socket room memberships are lost. Clients must re-emit `join-room` on reconnect. The `participants` array in MongoDB `Room` model is separate — it's the persistent membership list.

---

### [Day 6] express-mongo-sanitize must come before routes

**Gotcha:** `express-mongo-sanitize` must be registered in global middleware before route handlers, otherwise it won't sanitize request bodies before they reach controllers.

---

## Rules

These are non-negotiable for this codebase. Any AI tool must follow them.

| # | Rule |
|---|------|
| 1 | ES Modules (`import/export`) only — never `require()` |
| 2 | `async/await` only — never `.then()` chains |
| 3 | Every async controller wrapped in `asyncHandler()` |
| 4 | Every response uses `{ success, data }` or `{ success, message }` envelope |
| 5 | No hardcoded values — ports, secrets, URLs all in `.env` |
| 6 | One file = one job — no file does two unrelated things |
| 7 | Never store files on local disk — always Cloudinary |
| 8 | Tests use `MONGO_URI_TEST`, never the dev database |
| 9 | Never update passwords with `findOneAndUpdate` — always `.save()` |
| 10 | Socket auth via `handshake.auth.token` — never query params |
| 11 | Frontend: one component = one folder, one file = one responsibility |
| 12 | Tailwind classes only — no inline styles, no separate CSS files |

---

## Changes (Approach Reversals)

> Log here whenever you abandon an approach and replace it with something else.
> Format: what you had → what you changed to → why.

*(none yet — add entries here as the project evolves)*

---

## Open Questions

> Things you're unsure about that need research or a decision.

- [ ] Should room creation require the creator to manually add participants, or should there be an invite system? (v1 decision: creator is added automatically, others join via room ID)
- [ ] How to handle token expiry on the frontend — silent refresh or redirect to login? (decision pending Day 7)

---

*Last updated: Day 1. Add entries immediately when you discover a gotcha or make a decision — memory fades fast. A note written now saves 2 hours of debugging later.*

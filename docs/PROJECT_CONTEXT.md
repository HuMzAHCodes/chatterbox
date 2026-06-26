# PROJECT_CONTEXT.md

> **Purpose:** The single source of truth for what this project is, why it exists, who it's for, and every stack/standards decision made. Any AI tool reading this file should understand the full project without needing to ask questions.

---

## 1. Project Identity

| Field        | Value                                      |
|--------------|--------------------------------------------|
| Project name | ChatterBox (working title)                 |
| Type         | Full-stack real-time chat application      |
| Status       | In development — Week 1 (Backend)          |
| Developer    | Solo project (learning-focused)            |
| Goal         | Learn backend development via building     |

---

## 2. What This App Does

ChatterBox is a real-time group and private chat application. Users can register, log in, create chat rooms, invite others, and exchange messages that appear instantly without page refresh.

**Core features:**
- User registration and login (JWT-based auth)
- Create and join chat rooms (public or private)
- Real-time messaging via WebSockets (Socket.io)
- Typing indicators ("User is typing...")
- Message history (paginated, loaded on scroll)
- User avatars (uploaded to Cloudinary)
- Online/offline presence indicators

**Out of scope (v1):**
- Video/audio calls
- Message reactions or threads
- Push notifications
- Mobile app

---

## 3. Tech Stack

### Backend
| Layer         | Technology          | Why                                             |
|---------------|---------------------|-------------------------------------------------|
| Runtime       | Node.js             | JavaScript everywhere, huge ecosystem           |
| Framework     | Express.js          | Minimal, flexible, industry standard            |
| Real-time     | Socket.io           | Abstracts WebSocket complexity, rooms built-in  |
| Database      | MongoDB (Atlas)     | Flexible schema, pairs well with Node           |
| ODM           | Mongoose            | Schema validation, refs, populate               |
| Auth          | JWT + bcryptjs      | Stateless auth, industry standard               |
| File uploads  | Cloudinary          | Free tier, persistent (unlike Railway disk)     |
| Validation    | express-validator   | Inline route validation                         |
| Security      | helmet, cors, express-rate-limit | Production hardening            |
| Logging       | morgan              | HTTP request logging                            |

### Frontend
| Layer         | Technology          | Why                                             |
|---------------|---------------------|-------------------------------------------------|
| Framework     | Next.js (React)     | SSR + file-based routing, Vercel-native         |
| Styling       | Tailwind CSS        | Utility-first, fast UI development              |
| UI Components | Radix UI            | Accessible, unstyled, composable primitives     |
| HTTP client   | Axios               | Interceptors for JWT injection                  |
| Real-time     | socket.io-client    | Matches backend Socket.io                       |
| State         | React Context + hooks | Simple enough for this scale                  |

### Deployment
| Service       | Platform      | Cost        |
|---------------|---------------|-------------|
| Backend API   | Railway       | Free (~$5/mo credit) |
| Frontend      | Vercel        | Free forever |
| Database      | MongoDB Atlas | Free (M0 tier, 512MB) |
| File storage  | Cloudinary    | Free (5GB)  |

---

## 4. Frontend Architecture — Component Strategy

> **Rule: One file = one job. No exceptions.**

Every UI element lives in its own folder with its own file. A component folder contains the component itself, any sub-components it owns, and a clean `index.js` export.

**Example — Navbar:**
```
components/
└── Navbar/
    ├── Navbar.jsx        ← assembles the navbar
    ├── SearchBar.jsx     ← only handles search input logic
    ├── NavButton.jsx     ← only a button used in navbar
    └── index.js          ← export { Navbar }
```

**Rules:**
- No component file exceeds ~100 lines. If it does, split it.
- No business logic inside UI components — logic goes in `hooks/` or `lib/`
- Shared/reusable components (buttons, inputs, modals) live in `components/ui/`
- Page-specific components live in `components/[PageName]/`
- Tailwind classes only — no inline styles, no separate CSS files
- Radix UI provides the base for any interactive primitive (dialog, dropdown, tooltip, etc.)

---

## 5. Backend Architecture — Key Patterns

**Controller pattern:** Routes are thin. All logic lives in controllers.
```
Route file     → defines the path and calls controller function
Controller     → handles req, calls service/model, sends res
Model          → Mongoose schema only, minimal methods
Middleware     → reusable logic that runs between route and controller
```

**Error handling:** Every async controller is wrapped in `asyncHandler`. 
A global error middleware in `middleware/errorHandler.js` catches everything.
Never use `try/catch` directly in controllers — use `asyncHandler` + `AppError`.

**Auth flow:**
1. Client sends `Authorization: Bearer <token>` header
2. `protect` middleware verifies JWT, attaches `req.user`
3. Controller accesses `req.user._id` for any user-specific operation

---

## 6. Testing Strategy

> **Philosophy: Test after every feature, with real data, not mocks. Never move to the next feature with a broken one.**

### Two-layer testing approach

**Layer 1 — Automated tests (Jest + Supertest)**
- Written after each feature is complete
- Uses a real test MongoDB database (separate from dev DB — set `MONGO_URI_TEST` in `.env`)
- No mock data — real documents are created, tested, and cleaned up
- Run with `npm test`

**Layer 2 — Manual tests (Postman / Thunder Client)**
- Done alongside automated tests for hands-on exposure
- Manual test cases are documented in each phase inside `PHASES.md`
- Helps build intuition for how the API actually behaves

### Testing setup
```
npm install --save-dev jest supertest
```
Add to `package.json`:
```json
"scripts": {
  "test": "jest --runInBand --forceExit"
},
"jest": {
  "testEnvironment": "node"
}
```

### Test file location
```
src/
└── __tests__/
    ├── auth.test.js        ← tests for register, login, protect middleware
    ├── rooms.test.js       ← tests for room CRUD
    ├── messages.test.js    ← tests for message fetch + pagination
    └── setup.js            ← connects/disconnects test DB, global beforeAll/afterAll
```

### Rules
- One test file per feature (mirrors the controller it tests)
- Every test creates its own data and cleans up after itself (`afterEach` or `afterAll`)
- Test the happy path first, then at least 2 failure cases (invalid input, unauthorized)
- Automated tests cover everything — manual cases are a subset for learning
- Never push code where `npm test` is failing

### What gets tested per feature

| Feature         | Automated                              | Manual (Postman)                        |
|-----------------|----------------------------------------|-----------------------------------------|
| Auth            | Register, login, bad password, dup email | Register new user, try wrong password  |
| Rooms           | Create, list, unauthorized create     | Create room, try without token          |
| Messages        | Send, fetch, pagination                | Send a message, check it's in DB        |
| Socket.io       | Connection, join room, message emit   | Open two browser tabs, chat live        |

---

## 7. Coding Standards

- ES Modules (`import/export`) throughout — set `"type": "module"` in package.json
- `async/await` always — no `.then()` chains
- Destructure from `req`: `const { name, email } = req.body`
- All route paths lowercase with hyphens: `/api/chat-rooms`
- All env variables in `.env`, accessed via `process.env.VARIABLE_NAME`
- Console.log is fine during development — remove before deploy
- No hardcoded values: ports, secrets, URLs all go in `.env`

---

## 8. Project Timeline

| Week | Focus              | Goal                                      |
|------|--------------------|-------------------------------------------|
| 1    | Backend            | Fully working API + Socket.io             |
| 2    | Frontend           | Connected UI, real-time working end-to-end|

See `PHASES.md` for the detailed day-by-day breakdown.

---

## 9. Key Decisions Log

| Decision                        | Reason                                                    |
|---------------------------------|-----------------------------------------------------------|
| MongoDB over PostgreSQL         | Easier to start, flexible schema for chat messages        |
| JWT over sessions               | Stateless, works well with Socket.io auth                 |
| Cloudinary over local storage   | Railway filesystem is ephemeral — files get wiped on deploy|
| Next.js over plain React        | Better DX, routing, and Vercel deployment is seamless     |
| Radix UI over shadcn/ui         | More control over styling, learning the primitives        |
| Jest + Supertest for testing        | Real DB tests, no mocks, pairs perfectly with Express     |
| Separate test DB (MONGO_URI_TEST)   | Keeps dev data clean, tests can freely create/delete docs |

---

*Last updated: Day 1 — update the Status field and Key Decisions Log whenever something changes.*

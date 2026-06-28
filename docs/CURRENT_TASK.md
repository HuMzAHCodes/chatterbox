# CURRENT_TASK.md

> **Purpose:** This is the FIRST file any AI tool should read before helping you. It tells the AI exactly where you are right now — what day, what you're building, what's already done today, and what's blocked. Update this file every morning before you start, and every time you finish a task or hit a problem.
>
> **Rule:** Never start a coding session without updating this file first. Never ask an AI for help without telling it to read this file first.

---

## Current Status

```
## Current Status

Day:        3
Phase:      Week 1 — Backend
Focus:      Authentication — JWT + bcrypt
Started:    [ 6/28/26]
---

## What I Am Building Right Now

> Replace this section every morning with 1–3 sentences describing today's goal in plain English.



#### Tasks
- [ ] Install: `jsonwebtoken bcryptjs express-validator`
- [ ] Add to `.env`: `JWT_SECRET`, `JWT_EXPIRE=7d`
- [ ] Create `src/utils/AppError.js` — custom error class extending Error
- [ ] Create `src/utils/asyncHandler.js` — wraps async functions, passes errors to next()
- [ ] Create `src/middleware/errorHandler.js` — global 4-param error middleware
- [ ] Register `errorHandler` in `index.js` (must be LAST middleware)
- [ ] Create `src/controllers/authController.js` — `register`, `login`, `getMe`
- [ ] Create `src/routes/auth.js` — wire routes to controllers
- [ ] Create `src/middleware/protect.js` — verify JWT, attach `req.user`
- [ ] Add auth router to `index.js`: `app.use('/api/auth', authRouter)`
- [ ] Helper function `generateToken(userId)` — signs and returns JWT

#### Automated tests (`src/__tests__/auth.test.js`)
- [ ] `POST /api/auth/register` with valid data → 201, returns token + user (no password)
- [ ] `POST /api/auth/register` with duplicate email → 400, error message
- [ ] `POST /api/auth/register` with missing name → 400, validation error
- [ ] `POST /api/auth/register` with short password → 400, validation error
- [ ] `POST /api/auth/login` with correct credentials → 200, returns token
- [ ] `POST /api/auth/login` with wrong password → 401, "Invalid credentials"
- [ ] `POST /api/auth/login` with non-existent email → 401, "Invalid credentials"
- [ ] `GET /api/auth/me` with valid token → 200, returns user (no password field)
- [ ] `GET /api/auth/me` with no token → 401, "No token provided"
- [ ] `GET /api/auth/me` with fake/invalid token → 401, "Token is invalid"
---

## Completed Today

> Move tasks here once done. Keep a note of anything surprising you learned.

*(nothing yet — update as you go)*

---

## Blocked / Issues

> If something is not working, describe it here before asking an AI for help.
> Format: what you tried, what happened, what you expected.

*(none)*

---

## Context For AI Tools

> This section is written FOR the AI. Paste this block at the start of any AI prompt session.

```
I am building a real-time chat app (ChatterBox) using Express, MongoDB, Socket.io, and Next.js.

Current state:
- Day: 1
- Phase: Project setup
- What I just finished: [ fill in ]
- What I need help with: [ fill in ]

Please read these docs before writing any code:
1. PROJECT_CONTEXT.md    — stack, standards, decisions
2. ARCHITECTURE.md       — folder structure, request flow
3. DATABASE_SCHEMA.md    — all models and relationships
4. API_REFERENCE.md      — all endpoints and socket events
5. FILE_TREE.md          — my ACTUAL current folder structure
6. ENV_AND_CONFIG.md     — my actual env variable names

Do not invent file names, variable names, or field names.
Use only what is defined in these docs.
```

---

## Yesterday's Summary

Day 2 — Connected MongoDB Atlas using direct shard addresses (ISP blocks
SRV DNS so mongodb+srv:// doesn't work on this machine). Created all 3
Mongoose models: User, Room, Message. Wrote 14 passing model tests.
Hit 8 different issues during DB connection — all documented in
MONGODB_CONNECTION_GUIDE.md. npm test: 15/15 passing.

## Carry-Overs From Yesterday

> Tasks from yesterday that weren't finished. Move them to Today's Task List.

*(none — Day 1)*

---

## How To Update This File Daily

### Morning routine (5 minutes)
1. Change the `Day` and `Focus` fields at the top
2. Copy today's tasks from `PHASES.md` into "Today's Task List"
3. Clear "Completed Today" (yesterday's done tasks are already in PHASES.md)
4. Move any unfinished tasks from yesterday into "Carry-Overs"
5. Update the "Context For AI Tools" block with today's day number

### During the day
- Check off tasks as you finish them
- Move checked tasks to "Completed Today"
- If something breaks, describe it immediately in "Blocked / Issues"
- If you make a structural change (new file, renamed folder), update `FILE_TREE.md` now

### End of day (5 minutes)
- Write "Yesterday's Summary"
- Run `npm test` — note if tests pass or fail
- Update task status in `PHASES.md` (copy your checkboxes over)
- If you learned something important (a gotcha, a decision), add it to `AI_MEMORY.md`

---

## Template For New Day

> Copy this block every morning and replace the current content above.

```markdown
## Current Status

Day:        [X]
Phase:      Week [1/2] — [Backend/Frontend]
Focus:      [Today's focus from PHASES.md]
Started:    [Today's date]

## What I Am Building Right Now
[1–3 sentences]

## Today's Task List
[ ] task 1
[ ] task 2
...

## Completed Today
*(nothing yet)*

## Blocked / Issues
*(none)*

## Yesterday's Summary
[Written at end of previous day]

## Carry-Overs From Yesterday
*(none / list tasks)*
```

---

*This file is updated daily. If the date in "Current Status" is more than 1 day old, it means this file has not been updated — ask the developer to update it before proceeding.*

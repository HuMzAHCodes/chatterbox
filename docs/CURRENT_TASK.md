# CURRENT_TASK.md

> **Purpose:** This is the FIRST file any AI tool should read before helping you. It tells the AI exactly where you are right now — what day, what you're building, what's already done today, and what's blocked. Update this file every morning before you start, and every time you finish a task or hit a problem.
>
> **Rule:** Never start a coding session without updating this file first. Never ask an AI for help without telling it to read this file first.

---

## Current Status

```
Day:        4
Phase:      Week 1 — Backend
Focus:      REST API — rooms & messages
Started:    [ fill in today's date ]
```

---

## What I Am Building Right Now

Building the rooms and messages REST API. Creating controllers, routes, and input validation for creating rooms, listing rooms, getting a single room, and fetching paginated message history.

---

## Today's Task List

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

---

## Completed Today

*(nothing yet — update as you go)*

---

## Blocked / Issues

*(none)*

---

## Context For AI Tools

> This section is written FOR the AI. Paste this block at the start of any AI prompt session.

```
I am building a real-time chat app (ChatterBox) using Express, MongoDB, Socket.io, and Next.js.

Current state:
- Day: 4
- Phase: Week 1 — Backend
- What I just finished: Day 3 complete — JWT auth, protect middleware,
  errorHandler, asyncHandler, AppError all working. 28/28 tests passing.
- What I need help with: [ fill in ]

Please read these docs before writing any code:
1. PROJECT_CONTEXT.md        — stack, standards, decisions
2. ARCHITECTURE.md           — folder structure, request flow
3. DATABASE_SCHEMA.md        — all models and relationships
4. API_REFERENCE.md          — all endpoints and socket events
5. FILE_TREE.md              — my ACTUAL current folder structure
6. ENV_AND_CONFIG.md         — my actual env variable names
7. AI_MEMORY.md              — decisions made, gotchas, hard rules
8. MONGODB_CONNECTION_GUIDE.md — ISP blocks SRV DNS, use direct shard URIs

Do not invent file names, variable names, or field names.
Use only what is defined in these docs.
Never use mongodb+srv:// — always use direct shard connection string.
```

---

## Yesterday's Summary

Day 3 — Built full JWT authentication. Created AppError, asyncHandler,
errorHandler, protect middleware, authController, and auth routes.
All 3 manual Postman tests passed (register, login, getMe).
Automated tests: 28/28 passing across health, db, and auth test suites.
No blockers. Clean day.

---

## Carry-Overs From Yesterday

*(none)*

---

## Completed Days Summary

| Day | Focus | Tests | Status |
|-----|-------|-------|--------|
| 1 | Express server setup | 2/2 | ✓ done |
| 2 | MongoDB + Mongoose models | 13/13 | ✓ done |
| 3 | JWT auth + protect middleware | 13/13 | ✓ done |
| 4 | REST API — rooms & messages | — | in progress |
| 5 | Socket.io real-time | — | not started |
| 6 | Security + file uploads | — | not started |
| 7 | Frontend + deployment | — | not started |

**Total tests passing: 28/28**

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
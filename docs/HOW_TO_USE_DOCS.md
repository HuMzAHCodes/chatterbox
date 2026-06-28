# HOW_TO_USE_DOCS.md

> **Purpose:** The meta-guide. Explains how to keep all 10 project docs accurate, how to use them when working with any AI tool mid-project, what to update and when, and how to structure AI prompts so you get precise, project-specific code every time — not generic answers.

---

## The Core Idea

These 10 docs are your project's brain. Your code changes daily — the docs must reflect that. An AI tool that reads stale docs will generate code that doesn't fit your codebase. An AI tool that reads accurate docs will generate code that drops straight in.

**The rule is simple: code changes → docs update. Same session, not later.**

---

## The 10 Docs — What Each One Is For

| # | File | Type | Update frequency |
|---|------|------|-----------------|
| 1 | `PROJECT_CONTEXT.md` | Static reference | Rarely — only when stack or standards change |
| 2 | `ARCHITECTURE.md` | Static reference | When folder structure or flows change |
| 3 | `DATABASE_SCHEMA.md` | Static reference | When a model field is added/changed/removed |
| 4 | `API_REFERENCE.md` | Static reference | When an endpoint or socket event changes |
| 5 | `PHASES.md` | Progress tracker | Daily — check off tasks as you complete them |
| 6 | `CURRENT_TASK.md` | Daily log | Every morning + whenever something blocks you |
| 7 | `AI_MEMORY.md` | Living memory | Whenever you make a decision or hit a gotcha |
| 8 | `FILE_TREE.md` | Live snapshot | Every time you add, delete, or rename a file |
| 9 | `ENV_AND_CONFIG.md` | Static reference | When a new env variable is introduced |
| 10 | `CONCEPTS_MAP.md` | Study guide | Never — it is static |
| 12 | `MONGODB_CONNECTION_GUIDE.md` | Reference | Never — static troubleshooting record |

---

## Daily Routine — 3 Moments That Keep Docs Accurate

### Morning (5 minutes)
1. Open `CURRENT_TASK.md`
2. Update `Day`, `Focus`, and `Started` date
3. Copy today's tasks from `PHASES.md` into "Today's Task List"
4. Clear "Completed Today" from yesterday
5. Move unfinished tasks into "Carry-Overs"
6. Update the day number in the "Context For AI Tools" block

### During the day (30 seconds each time)
- Finished a task → check it off in `CURRENT_TASK.md` and move it to "Completed Today"
- Added or renamed a file → run `tree src/` and paste into `FILE_TREE.md`
- Hit a weird bug or made a decision → add an entry to `AI_MEMORY.md` immediately
- Added a new env variable → add it to `ENV_AND_CONFIG.md` immediately

### End of day (5 minutes)
1. Sync task checkboxes from `CURRENT_TASK.md` back to `PHASES.md`
2. Write "Yesterday's Summary" in `CURRENT_TASK.md`
3. Run `npm test` — note pass/fail
4. If you changed a schema field, endpoint, or route → update `DATABASE_SCHEMA.md` or `API_REFERENCE.md`
5. Commit everything including the updated docs

---

## How To Use These Docs With an AI Tool

### The golden prompt structure

Every time you start a new AI session, open with this block. Fill in the blanks. Do not skip it.

```
I am building a real-time chat app (ChatterBox) using Express, MongoDB,
Socket.io, and Next.js.

Current state:
- Day: [X]
- Phase: [e.g. Week 1 - Backend]
- What I just finished: [e.g. "auth endpoints are done and tested"]
- What I need help with: [e.g. "building the createRoom controller"]

Read these docs before writing any code:
1. PROJECT_CONTEXT.md    → stack, standards, patterns
2. ARCHITECTURE.md       → folder structure, request flow
3. DATABASE_SCHEMA.md    → all models and relationships
4. API_REFERENCE.md      → all endpoints and socket events
5. FILE_TREE.md          → my ACTUAL current folder structure
6. ENV_AND_CONFIG.md     → my actual env variable names
7. AI_MEMORY.md          → decisions made, gotchas, hard rules

Rules you must follow:
- Use only the variable names, file names, and field names defined in these docs
- Never use require() — this project uses ES Modules (import/export)
- Never use .then() — always async/await
- Every async controller must be wrapped in asyncHandler()
- All responses use { success, data } or { success, message } envelope
- One file = one job

[paste any relevant existing code here]

Now help me: [your specific ask]
```

### Why this structure works

- The AI knows the full context before writing a single character
- "Read these docs" forces the AI to anchor to your actual codebase
- Pasting rules at the end means even if the AI skimmed the docs, the non-negotiables are right there
- Pasting existing code gives the AI ground truth — not just the plan

---

## Prompt Recipes For Common Situations

### "Write this controller for me"
```
[Open with golden prompt]
I need to write the [controllerName] controller in [file path].

Here is the relevant model:
[paste the model code from DATABASE_SCHEMA.md]

Here is the route it serves:
[paste the endpoint from API_REFERENCE.md]

Here is my asyncHandler utility:
[paste src/utils/asyncHandler.js]

Write the full controller function.
```

### "I have a bug — help me fix it"
```
[Open with golden prompt]
I have a bug. Here is what I expected: [describe]
Here is what actually happened: [describe — include error message exactly]
Here is the relevant code: [paste the file]
Here is the test that is failing: [paste the test]

Do not rewrite the whole file. Identify the bug and show me the fix.
```

### "Write a test for this feature"
```
[Open with golden prompt]
Write a Jest + Supertest test for [feature name].

Here is the controller: [paste controller code]
Here is the route: [paste route code]
Here is the model: [paste relevant model]
Here is my test setup file: [paste __tests__/setup.js]

The test database is MONGO_URI_TEST.
Test the happy path and at least 2 failure cases.
Follow the same pattern as my existing tests: [paste an existing test file]
```

### "Help me with Socket.io"
```
[Open with golden prompt]
I am working on the Socket.io layer.

Here is my current socket/index.js: [paste]
Here is the relevant handler: [paste]
Here is the Socket.io event reference from API_REFERENCE.md: [paste the events table]

Remember:
- socket.to(room) sends to everyone EXCEPT sender
- io.to(room) sends to EVERYONE including sender
- Socket auth reads from socket.handshake.auth.token

Help me: [specific ask]
```

### "Help me connect frontend to backend"
```
[Open with golden prompt — include frontend files too]
I am connecting the frontend to the backend.

Here is my axios instance: [paste frontend/lib/axios.js]
Here is my socket singleton: [paste frontend/lib/socket.js]
Here is the API endpoint I am consuming: [paste from API_REFERENCE.md]

Frontend rules:
- Tailwind CSS only, no inline styles
- One component file = one responsibility
- Hooks handle all data fetching — not components directly

Help me: [specific ask]
```

---

## What To Do When Things Go Off-Plan

Plans always drift. A package doesn't work, you rename a folder, you skip a feature. Here is how to handle it without losing doc accuracy.

### You renamed a file or moved a folder
1. Update `FILE_TREE.md` immediately — run `tree src/` and paste
2. Update `ARCHITECTURE.md` if the folder structure diagram changed
3. Add a "Change" entry to `AI_MEMORY.md`:
   ```
   ### [Day X] Renamed authMiddleware.js to protect.js
   Changed: src/middleware/authMiddleware.js → src/middleware/protect.js
   Reason: protect.js is more descriptive and matches the import name used everywhere
   ```

### You changed a model field name
1. Update the schema in `DATABASE_SCHEMA.md`
2. Update any endpoint in `API_REFERENCE.md` that returns that field
3. Add a note in `AI_MEMORY.md` so no AI generates the old field name
4. Find every file that references the old field name and update it

### You swapped a library
1. Update the tech stack table in `PROJECT_CONTEXT.md`
2. Add a "Change" entry in `AI_MEMORY.md` explaining what you had and why you switched
3. Update any code examples in `ENV_AND_CONFIG.md` if it involved config

### You skipped a planned feature
1. Mark it `[ ]` (not started) in `PHASES.md` and add a note: "skipped — not needed for v1"
2. Add an "Open Questions" entry in `AI_MEMORY.md` if it might come back later
3. Do NOT delete it from `PHASES.md` — keep the history

### A test is failing and you can't fix it
1. Mark the related task as `[!]` in `CURRENT_TASK.md` and `PHASES.md`
2. Add a detailed entry to `AI_MEMORY.md` under Gotchas
3. Use the bug-fix prompt recipe above to ask an AI for help
4. Never move to the next day's tasks with a `[!]` still open

---

## Doc Accuracy Checklist

Run this checklist at the end of each day. If any answer is "no", fix the doc before closing your editor.

```
[ ] FILE_TREE.md reflects the actual folder structure right now
[ ] CURRENT_TASK.md has today's date and correct day number
[ ] PHASES.md checkboxes match what I actually built today
[ ] AI_MEMORY.md has an entry for every decision I made today
[ ] ENV_AND_CONFIG.md lists every env variable in my .env file
[ ] API_REFERENCE.md matches every endpoint that exists in my code
[ ] DATABASE_SCHEMA.md matches every model field that exists in my code
[ ] npm test passes (or failing tests are logged in AI_MEMORY.md)
```

---

## Red Flags — Signs Your Docs Are Stale

If any of these are true, your docs need updating before you use them with an AI:

- `CURRENT_TASK.md` shows a date more than 1 day old
- `FILE_TREE.md` shows files marked `[ ]` that you've already created
- `AI_MEMORY.md` has no entries (you made zero decisions and hit zero gotchas — unlikely)
- `API_REFERENCE.md` has endpoints that don't exist in your routes files
- `DATABASE_SCHEMA.md` has field names that don't match your actual model files
- You can't remember the last time you ran `npm test`

---

## How To Handle Multiple AI Tools

You might use Claude, ChatGPT, GitHub Copilot, or Cursor at different points. The docs work with all of them. The only difference is how you feed the docs to each tool.

| Tool | How to provide docs |
|------|---------------------|
| Claude (claude.ai) | Paste doc contents directly into the chat |
| ChatGPT | Paste doc contents, or upload as files |
| Cursor | Add docs to the project folder — Cursor reads them via `@` references |
| GitHub Copilot | Keep docs in the repo — Copilot reads open files for context |
| Any tool | The golden prompt structure works everywhere |

**One rule for all tools:** Always paste the relevant section of the doc, not just the filename. Saying "read API_REFERENCE.md" means nothing unless the AI can actually see the content.

---

## The 3 Biggest Mistakes To Avoid

### Mistake 1: Updating code but not the docs
This is the most common failure. You rename a field, forget to update `DATABASE_SCHEMA.md`, then ask an AI to write a query two days later — it uses the old field name. Takes 20 minutes to track down. Updating the doc takes 30 seconds.

### Mistake 2: Starting an AI session without context
Jumping straight to "write me a controller" without the golden prompt gets you generic Express code that doesn't match your patterns, your file structure, or your variable names. Always provide context first.

### Mistake 3: Letting AI_MEMORY.md stay empty
Every project has gotchas. If you don't write them down the moment you discover them, you — or an AI — will repeat the mistake. The `pre('save')` hook not firing on `findOneAndUpdate`, the `select: false` password gotcha, the Socket.io in-memory room issue — all of these are in `AI_MEMORY.md` because they will trip up an AI that doesn't know about them.

---

## Quick Reference — Which Doc To Open For What

| Situation | Open this doc |
|-----------|--------------|
| Starting a new AI session | `CURRENT_TASK.md` → copy the context block |
| AI asks "where should this file go?" | `FILE_TREE.md` + `ARCHITECTURE.md` |
| AI asks "what does this model look like?" | `DATABASE_SCHEMA.md` |
| AI asks "what should this endpoint return?" | `API_REFERENCE.md` |
| You hit a bug | `AI_MEMORY.md` — check if it's a known gotcha first |
| You can't remember what you were doing | `CURRENT_TASK.md` → "Completed Today" + "Blocked" |
| You need to know what env variable to use | `ENV_AND_CONFIG.md` |
| You want to know what to study tonight | `CONCEPTS_MAP.md` → tomorrow's section |
| You want to check your progress | `PHASES.md` → count checked boxes |
| Something isn't working and you changed a lot | `AI_MEMORY.md` → "Changes" section |
| MongoDB connection fails | `MONGODB_CONNECTION_GUIDE.md` — check the issue list first |

---

*This document does not need to be updated. It is a permanent guide. The only exception: if you add new doc files to the project, add them to the tables in this file.*

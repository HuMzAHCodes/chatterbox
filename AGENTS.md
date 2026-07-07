# AGENTS.md

## Project

ChatterBox — full-stack real-time chat app. Two independent npm projects: `backend/` (Node/Express/Socket.IO) and `frontend/` (Next.js 16/React 19). No monorepo tooling.

## Commands

```bash
# Backend
cd backend
npm run dev          # Start with nodemon (port 5000)
npm test             # Jest — requires MONGO_URI_TEST in .env
                     # Uses --experimental-vm-modules, --runInBand, --forceExit

# Frontend
cd frontend
npm run dev          # Next.js dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint (flat config, eslint-config-next)
```

No backend lint or formatter is configured. No CI pipelines exist.

## Backend Rules (non-negotiable)

- **ES Modules only** — `"type": "module"`. Never `require()` or `module.exports`.
- **async/await only** — never `.then()` chains.
- **Every async controller** wrapped in `asyncHandler()` from `src/utils/asyncHandler.js`. No raw try/catch in controllers.
- **Response envelope** — always `{ success: true, data: ... }` or `{ success: false, message: ... }`. Never flat objects.
- **No `mongodb+srv://`** — ISP blocks SRV DNS. Always use direct shard connection strings. See `docs/MONGODB_CONNECTION_GUIDE.md`.
- **Tests use `MONGO_URI_TEST`** — a separate Atlas database. Never the dev DB.
- **Cloudinary only** — never store files on local disk (Railway's FS is ephemeral).
- **Socket auth via `handshake.auth.token`** — never query params.
- **Password updates via `.save()`** — `findOneAndUpdate` skips the pre-save hash hook.
- **`select('+password')`** — password field has `select: false`; must explicitly request it.
- **dotenv first** — `dotenv.config()` must run before any other imports in `index.js` (ESM hoisting).
- **Error handler last** — `errorHandler` middleware must be registered after the 404 handler, as the final middleware.
- **No listen() during tests** — `index.js` exports `app`; `listen()` is guarded by `NODE_ENV !== 'test'`.

## Frontend Rules

- **Next.js 16 has breaking changes** — read guides in `node_modules/next/dist/docs/` before writing code.
- **Tailwind CSS v4** — no `tailwind.config.*` file. Config is in `globals.css` via `@theme inline`.
- **All pages are Client Components** (`'use client'`). No server components yet.
- **Mixed JSX/TS** — files are `.jsx` not `.tsx` despite TypeScript being configured.
- **Env vars required**: `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` (backend URL). Set in `frontend/.env.local`.
- **JWT in localStorage** — Axios interceptor attaches `Authorization: Bearer` header.
- **Socket.IO singleton** — one connection per app lifetime in `lib/socket.js`.

## Messages: Socket.IO, not REST

Messages are created via the `send-message` Socket event, not a POST endpoint. Retrieval uses `GET /api/messages/:roomId`. Never add a POST messages endpoint.

## Key Gotchas

- `socket.to(room)` excludes sender; `io.to(room)` includes sender.
- Socket rooms are in-memory only — lost on server restart. MongoDB `participants` array is separate.
- `populate()` returns null if the referenced document was deleted — null-check on frontend.
- Duplicate key errors come as Mongoose code `11000`, not `ValidationError`.
- `nodemon` does not restart on `.env` changes — manual restart required.

## Reference

`docs/AI_MEMORY.md` — full decision log, gotchas, and rules. Treat as authoritative.

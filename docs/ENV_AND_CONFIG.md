# ENV_AND_CONFIG.md

> **Purpose:** The single source of truth for every environment variable in the project. Exact key names, types, where each variable is used, and where to get the value. Any AI tool reading this must use these exact variable names — never invent or guess an env variable name.
>
> **Rule:** Never hardcode a value that belongs in `.env`. If a new variable is added during development, add it here immediately.

---

## Files Involved

| File | Location | Committed to git? |
|------|----------|-------------------|
| `.env` | `backend/.env` | ❌ Never — in `.gitignore` |
| `.env.example` | `backend/.env.example` | ✅ Yes — contains key names, no values |
| `.env.local` | `frontend/.env.local` | ❌ Never — in `.gitignore` |
| `.env.example` | `frontend/.env.example` | ✅ Yes — contains key names, no values |

---

## Backend Environment Variables

### `backend/.env` — complete file template

```env
# ── Server ─────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ── Database ───────────────────────────────────────────
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/chatterbox_dev?retryWrites=true&w=majority
MONGO_URI_TEST=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/chatterbox_test?retryWrites=true&w=majority

# ── Auth ───────────────────────────────────────────────
JWT_SECRET=replace_this_with_a_long_random_string_min_32_chars
JWT_EXPIRE=7d

# ── Cloudinary ─────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── CORS ───────────────────────────────────────────────
CLIENT_URL=http://localhost:3000
```

---

### Variable Reference — Backend

| Variable | Type | Required | Used In | Description |
|----------|------|----------|---------|-------------|
| `PORT` | Number | Yes | `index.js` | Port the Express server listens on. Default 5000. |
| `NODE_ENV` | String | Yes | `index.js`, `errorHandler.js` | `development`, `test`, or `production`. Controls error detail level. |
| `MONGO_URI` | String | Yes | `src/config/db.js` | MongoDB Atlas connection string for the dev database. |
| `MONGO_URI_TEST` | String | Yes | `src/__tests__/setup.js` | MongoDB Atlas connection string for the test database. Never the same as MONGO_URI. |
| `JWT_SECRET` | String | Yes | `src/middleware/protect.js`, `src/controllers/authController.js` | Secret key for signing and verifying JWTs. Min 32 random characters. |
| `JWT_EXPIRE` | String | Yes | `src/controllers/authController.js` | JWT expiry duration. Format: `7d`, `24h`, `60m`. Currently set to `7d`. |
| `CLOUDINARY_CLOUD_NAME` | String | Yes (Day 6+) | `src/config/cloudinary.js` | Your Cloudinary account cloud name. Found in Cloudinary dashboard. |
| `CLOUDINARY_API_KEY` | String | Yes (Day 6+) | `src/config/cloudinary.js` | Cloudinary API key. Found in Cloudinary dashboard. |
| `CLOUDINARY_API_SECRET` | String | Yes (Day 6+) | `src/config/cloudinary.js` | Cloudinary API secret. Never expose this to the frontend. |
| `CLIENT_URL` | String | Yes | `index.js` (CORS config) | The frontend URL allowed by CORS. Dev: `http://localhost:3000`. Prod: Vercel URL. |

---

### How Each Variable Is Used In Code

#### PORT
```javascript
// index.js
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

#### NODE_ENV
```javascript
// src/middleware/errorHandler.js
// In development: send full stack trace
// In production: send only the message
const message = process.env.NODE_ENV === 'development'
  ? err.stack
  : err.message;
```

#### MONGO_URI + MONGO_URI_TEST
```javascript
// src/config/db.js
const connectDB = async () => {
  const uri = process.env.NODE_ENV === 'test'
    ? process.env.MONGO_URI_TEST
    : process.env.MONGO_URI;
  await mongoose.connect(uri);
};
```

#### JWT_SECRET + JWT_EXPIRE
```javascript
// src/controllers/authController.js — signing
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRE,
});

// src/middleware/protect.js — verifying
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

#### CLOUDINARY_*
```javascript
// src/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export default cloudinary;
```

#### CLIENT_URL
```javascript
// index.js — CORS config
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
```

---

## Frontend Environment Variables

### `frontend/.env.local` — complete file template

```env
# ── API ────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

> **Important:** In Next.js, only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Variables without this prefix are server-side only. Both of our frontend variables need the prefix since they're used in client components.

---

### Variable Reference — Frontend

| Variable | Type | Required | Used In | Description |
|----------|------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | String | Yes | `frontend/lib/axios.js` | Base URL for all REST API calls. Dev: `http://localhost:5000`. Prod: Railway URL. |
| `NEXT_PUBLIC_SOCKET_URL` | String | Yes | `frontend/lib/socket.js` | URL for Socket.io connection. Usually same as API URL. |

---

### How Each Variable Is Used In Code

#### NEXT_PUBLIC_API_URL
```javascript
// frontend/lib/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// JWT interceptor — attaches token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

#### NEXT_PUBLIC_SOCKET_URL
```javascript
// frontend/lib/socket.js
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  autoConnect: false,   // connect manually after login
  auth: {
    token: localStorage.getItem('token'),
  },
});

export default socket;
```

---

## Production Environment Variables

When deploying, these values change. Set them in the platform dashboards — never in code.

### Railway (backend)

| Variable | Production Value |
|----------|-----------------|
| `PORT` | Railway sets this automatically — do not override |
| `NODE_ENV` | `production` |
| `MONGO_URI` | Same Atlas URI (prod can share dev DB for a learning project) |
| `MONGO_URI_TEST` | Not needed in production |
| `JWT_SECRET` | Same secret (or generate a new one) |
| `JWT_EXPIRE` | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Same as dev |
| `CLOUDINARY_API_KEY` | Same as dev |
| `CLOUDINARY_API_SECRET` | Same as dev |
| `CLIENT_URL` | Your Vercel URL e.g. `https://chatterbox.vercel.app` |

### Vercel (frontend)

| Variable | Production Value |
|----------|-----------------|
| `NEXT_PUBLIC_API_URL` | Your Railway URL e.g. `https://chatterbox-backend.railway.app` |
| `NEXT_PUBLIC_SOCKET_URL` | Same Railway URL |

---

## Security Rules

1. **Never commit `.env` or `.env.local`** — both are in `.gitignore`
2. **Never log env variables** — no `console.log(process.env.JWT_SECRET)`
3. **Never send backend env vars to the frontend** — `CLOUDINARY_API_SECRET`, `JWT_SECRET`, `MONGO_URI` are server-only
4. **JWT_SECRET must be at least 32 random characters** — generate with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
5. **MONGO_URI_TEST must point to a different database** — never the same as MONGO_URI

---

## `.env.example` Files

### `backend/.env.example` (commit this)
```env
PORT=
NODE_ENV=
MONGO_URI=
MONGO_URI_TEST=
JWT_SECRET=
JWT_EXPIRE=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_URL=
```

### `frontend/.env.example` (commit this)
```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SOCKET_URL=
```

---

*Last updated: Day 1. Add a new row to the variable table immediately whenever a new env variable is introduced. Update the production values table on Day 7 when deploying.*

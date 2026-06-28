# MONGODB_CONNECTION_GUIDE.md

> **Purpose:** A full record of every issue faced when connecting MongoDB Atlas to this Express backend, exactly how each was solved, and what to do immediately next time to avoid repeating the same 2-hour debugging session.
>
> **When to use:** Give this file to any AI tool at the start of Day 2 (MongoDB setup) before writing a single line of connection code.

---

## The Environment

- **OS:** Windows 11
- **Node.js:** v26.3.0 initially → downgraded to v20.20.2 via nvm-windows
- **Mongoose:** v7.3.1 initially → upgraded to v8.4.0 (then reverted, issue was elsewhere)
- **MongoDB Atlas:** Free M0 cluster, AWS / Mumbai (ap-south-1)
- **ISP:** Pakistani ISP — blocks SRV DNS lookups on port 53

---

## The Final Working Connection String Format

This is what works for this specific setup. Use this format from Day 1, do not use `mongodb+srv://`.

```env
MONGO_URI=mongodb://acoding84_db_user:YOUR_PASSWORD@ac-wmvhmmv-shard-00-00.lpcvjp7.mongodb.net:27017,ac-wmvhmmv-shard-00-01.lpcvjp7.mongodb.net:27017,ac-wmvhmmv-shard-00-02.lpcvjp7.mongodb.net:27017/chatterbox_dev?ssl=true&replicaSet=atlas-rtado6-shard-0&authSource=admin&retryWrites=true&w=majority

MONGO_URI_TEST=mongodb://acoding84_db_user:YOUR_PASSWORD@ac-wmvhmmv-shard-00-00.lpcvjp7.mongodb.net:27017,ac-wmvhmmv-shard-00-01.lpcvjp7.mongodb.net:27017,ac-wmvhmmv-shard-00-02.lpcvjp7.mongodb.net:27017/chatterbox_test?ssl=true&replicaSet=atlas-rtado6-shard-0&authSource=admin&retryWrites=true&w=majority
```

**Key parts explained:**
| Part | Value | Why |
|------|-------|-----|
| Protocol | `mongodb://` not `mongodb+srv://` | SRV DNS is blocked by ISP |
| Hosts | 3 shard addresses with port 27017 | Direct connection bypasses SRV |
| `ssl=true` | Required | Atlas always requires SSL |
| `replicaSet` | `atlas-rtado6-shard-0` | Exact name from DNS TXT record |
| `authSource=admin` | Required | Atlas auth lives in admin DB |

---

## How To Find Your Own Values (For Any New Atlas Cluster)

If you create a new Atlas cluster in the future, run these commands to get the correct values. Do NOT guess them.

**Step 1 — Get the 3 shard hostnames:**
```bash
nslookup -type=SRV _mongodb._tcp.YOUR_CLUSTER_HOST 8.8.8.8
```
Example:
```bash
nslookup -type=SRV _mongodb._tcp.cluster0.lpcvjp7.mongodb.net 8.8.8.8
```
This returns 3 hostnames like `ac-wmvhmmv-shard-00-00.lpcvjp7.mongodb.net`

**Step 2 — Get the exact replicaSet name:**
```bash
nslookup -type=TXT _mongodb._tcp.YOUR_CLUSTER_HOST 8.8.8.8
```
Example:
```bash
nslookup -type=TXT _mongodb._tcp.cluster0.lpcvjp7.mongodb.net 8.8.8.8
```
Returns something like: `authSource=admin&replicaSet=atlas-rtado6-shard-0`
Copy the `replicaSet` value exactly.

**Step 3 — Verify port 27017 is open:**
```bash
Test-NetConnection -ComputerName YOUR_SHARD_HOST -Port 27017
```
`TcpTestSucceeded: True` = you can connect on that port.

**Step 4 — Build the connection string** using the format above.

---

## All Issues Faced — In Order

---

### Issue 1 — `dotenv` not loading before DB connection

**Error:**
```
MongooseError: The `uri` parameter to `openUri()` must be a string, got "undefined"
```

**Cause:** In ES Modules, `import` statements are hoisted. `connectDB` was being imported and called before `dotenv.config()` ran, so `process.env.MONGO_URI` was still `undefined`.

**Fix:** Put `dotenv.config()` on the very first two lines of `index.js`, before any other import:

```javascript
import dotenv from 'dotenv';
dotenv.config();

// ALL other imports come after
import express from 'express';
import connectDB from './src/config/db.js';
```

**Prevention:** Always put dotenv first. Make it a rule — it's the first line of every Node.js project.

---

### Issue 2 — ISP blocking SRV DNS lookups

**Error:**
```
Error: querySrv ECONNREFUSED _mongodb._tcp.cluster0.lpcvjp7.mongodb.net
```

**Cause:** Pakistani ISPs block SRV DNS record lookups. The `mongodb+srv://` connection string format relies on SRV DNS to discover the cluster's shard addresses. When SRV is blocked, the lookup returns nothing and the connection fails immediately.

**Diagnosis commands:**
```bash
# This returned nothing — confirmed SRV blocked
nslookup _mongodb._tcp.cluster0.lpcvjp7.mongodb.net

# This returned the SRV records — confirmed DNS itself works via Google
nslookup -type=SRV _mongodb._tcp.cluster0.lpcvjp7.mongodb.net 8.8.8.8
```

**Fix:** Stop using `mongodb+srv://`. Build a direct connection string using the 3 shard addresses obtained via nslookup (see "How To Find Your Own Values" above).

**Things that did NOT fix this:**
- Switching to Google DNS (8.8.8.8) — the OS DNS was already using Google
- Changing Node.js version — not a Node issue
- Changing mongoose version — not a mongoose issue
- Using mobile hotspot — same ISP, same block

**Prevention:** On this machine, always use the direct shard connection string. Never use `mongodb+srv://`.

---

### Issue 3 — Wrong replicaSet name

**Error:**
```
MongooseServerSelectionError: Server selection timed out after 30000 ms
reason: ReplicaSetNoPrimary, servers: Map(0) {}
```

**Cause:** The direct connection string was built with a guessed replicaSet name (`atlas-lpcvjp7-shard-0`) instead of the real one (`atlas-rtado6-shard-0`). With the wrong replicaSet name, Mongoose connects to the shards but can't find the primary — `servers: Map(0) {}` means zero servers were accepted.

**Fix:** Run the TXT lookup to get the exact replicaSet name:
```bash
nslookup -type=TXT _mongodb._tcp.cluster0.lpcvjp7.mongodb.net 8.8.8.8
```
Output: `authSource=admin&replicaSet=atlas-rtado6-shard-0`

Use `atlas-rtado6-shard-0` — not the cluster subdomain, not a guess.

**Prevention:** Always run the TXT lookup. Never guess the replicaSet name from the cluster URL.

---

### Issue 4 — Authentication failed in tests

**Error:**
```
MongoServerError: bad auth: authentication failed
```

**Cause:** The password in `MONGO_URI_TEST` was outdated — the Atlas password had been changed during debugging but `MONGO_URI_TEST` was not updated at the same time as `MONGO_URI`.

**Fix:** Reset Atlas password to a simple one with no special characters, then update **both** `MONGO_URI` and `MONGO_URI_TEST` in `.env` at the same time.

**Prevention:**
- Always update both URIs together — they use the same credentials
- Use a password with no special characters (`@`, `#`, `$`, `!`) — these break URI parsing
- After changing Atlas password, immediately update `.env` and restart the server to verify before running tests

---

### Issue 5 — Node.js version conflict (suspected but not confirmed)

**Suspected cause:** Node.js v26.3.0 has known DNS resolution issues with SRV records.

**Action taken:** Downgraded to v20.20.2 using nvm-windows.

**Result:** Did not fix the SRV issue (which was an ISP block), but v20.20.2 is more stable for backend development and should be used regardless.

**How to switch Node versions on this machine:**
```bash
# Open PowerShell as Administrator
nvm use 20.20.2
node --version  # should show v20.20.2
```

Note: If `node --version` still shows the old version after `nvm use`, uninstall the old Node.js from Windows Control Panel → Programs, then open a fresh terminal.

---

### Issue 6 — Jest test timeout (DB not connecting before tests ran)

**Error:**
```
thrown: "Exceeded timeout of 5000 ms for a test"
MongooseError: Operation `users.insertOne()` buffering timed out after 10000ms
```

**Cause:** The test DB connection string was still using `mongodb+srv://` format while the dev DB had already been switched to the direct shard format. The `beforeAll` in `setup.js` was timing out silently trying to connect via SRV.

**Fix:**
1. Use the same direct shard format for `MONGO_URI_TEST` as `MONGO_URI`
2. Move `beforeAll`/`afterAll`/`afterEach` directly into `db.test.js` instead of relying on `setup.js` being auto-imported
3. Add `30000` ms timeout to every `it()`, `beforeEach()`, and `beforeAll()` block
4. Add `"testTimeout": 30000` to Jest config in `package.json`

**Prevention:** Whenever you change `MONGO_URI`, immediately change `MONGO_URI_TEST` to match the same format.

---

### Issue 7 — Jest picking up non-test files as test suites

**Error:**
```
FAIL src/routes/test.js
● Test suite must contain at least one test
```

**Cause:** Jest's default `testMatch` pattern picked up `src/routes/test.js` because the filename contains "test".

**Fix:** Add `testMatch` to Jest config in `package.json`:
```json
"jest": {
  "testMatch": ["**/__tests__/**/*.test.js"]
}
```

This restricts Jest to only files inside `__tests__/` folders that end in `.test.js`.

---

### Issue 8 — Server port conflict during tests

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Cause:** `index.js` called `server.listen()` unconditionally. When Jest imported `app` from `index.js`, it triggered the listen call — but port 5000 was already in use by `npm run dev` in another terminal.

**Fix:** Wrap `server.listen()` in an environment check:
```javascript
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
```

**Prevention:** Always export `app` separately from `server.listen()`. Tests import `app` — they should never trigger `listen()`.

---

## Quick Setup Checklist For Next Time

Run through this before writing any connection code:

```
[ ] Atlas cluster is created and status shows green dot
[ ] Network Access has 0.0.0.0/0 set to Active (not Pending)
[ ] Password has NO special characters (@, #, $, !, %)
[ ] Ran nslookup -type=SRV to get the 3 shard hostnames
[ ] Ran nslookup -type=TXT to get the exact replicaSet name
[ ] Verified port 27017 is open with Test-NetConnection
[ ] Built direct connection string (no +srv) for BOTH MONGO_URI and MONGO_URI_TEST
[ ] dotenv.config() is the FIRST line of index.js
[ ] server.listen() is wrapped in NODE_ENV !== 'test' check
[ ] Jest config has testMatch, testTimeout: 30000
[ ] npm run dev connects successfully before running npm test
```

---

## Final `.env` Template For This Machine

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

MONGO_URI=mongodb://acoding84_db_user:YOUR_PASSWORD@ac-wmvhmmv-shard-00-00.lpcvjp7.mongodb.net:27017,ac-wmvhmmv-shard-00-01.lpcvjp7.mongodb.net:27017,ac-wmvhmmv-shard-00-02.lpcvjp7.mongodb.net:27017/chatterbox_dev?ssl=true&replicaSet=atlas-rtado6-shard-0&authSource=admin&retryWrites=true&w=majority

MONGO_URI_TEST=mongodb://acoding84_db_user:YOUR_PASSWORD@ac-wmvhmmv-shard-00-00.lpcvjp7.mongodb.net:27017,ac-wmvhmmv-shard-00-01.lpcvjp7.mongodb.net:27017,ac-wmvhmmv-shard-00-02.lpcvjp7.mongodb.net:27017/chatterbox_test?ssl=true&replicaSet=atlas-rtado6-shard-0&authSource=admin&retryWrites=true&w=majority

JWT_SECRET=
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

*This file was generated after a 2-hour debugging session on Day 2 of the ChatterBox project. Every issue in this file was hit in real development — not theoretical. Do not skip the Quick Setup Checklist.*

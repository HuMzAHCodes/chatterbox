# CONCEPTS_MAP.md

> **Purpose:** A study guide, not a coding guide. Before starting each day, this file tells you exactly what concepts to understand first — what to search, what to read, and what questions you should be able to answer before writing a single line of code. You learn the concept from the internet, then come back and build.
>
> **How to use:** The night before each day, read that day's section. Google the concepts you don't know. By morning you should be able to answer the "check questions" — if you can, you're ready to build.

---

## Day 1 — Project Setup + Express Fundamentals

### Concepts to study

**1. What is Node.js?**
- Search: "how Node.js works event loop explained"
- Understand: Node.js runs JavaScript outside the browser. It's single-threaded but handles many requests via the event loop — not by creating a thread per request like Java/PHP.
- Key question: *Why is Node.js good for real-time apps like chat?*

**2. What is Express.js?**
- Search: "Express.js tutorial for beginners"
- Understand: Express is a minimal framework that wraps Node's built-in `http` module. It adds routing, middleware, and a cleaner API.
- Key question: *What problem does Express solve that raw Node.js doesn't?*

**3. What is middleware?**
- Search: "Express middleware explained with examples"
- Understand: Middleware is a function that runs between the request arriving and the response being sent. It has access to `req`, `res`, and `next`. Calling `next()` passes control to the next middleware.
- Key question: *What happens if you forget to call `next()` in a middleware?*

**4. What is a REST API?**
- Search: "REST API explained simply"
- Understand: REST is a convention for structuring HTTP endpoints. Uses HTTP methods (GET, POST, PUT, DELETE) to represent actions. Resources are nouns (users, rooms, messages).
- Key question: *What is the difference between GET and POST? When do you use each?*

**5. What is `.env` and why do we use it?**
- Search: "dotenv Node.js environment variables"
- Understand: Sensitive values (passwords, API keys) never go in code. They live in `.env` files that are never committed to git. `dotenv` loads them into `process.env`.
- Key question: *Why is it dangerous to hardcode a database password in your code?*

**6. What is nodemon?**
- Search: "nodemon Node.js"
- Understand: nodemon watches your files and restarts the server automatically when you save a change. Without it, you'd manually stop/start the server every time.

### ✅ Check questions — answer these before Day 1
- What is `req.body`? What is `req.params`? What is `req.query`? How are they different?
- What does `res.json()` do vs `res.send()`?
- What is the order that Express middleware runs?
- What does `app.use()` do vs `app.get()`?

---

## Day 2 — MongoDB + Mongoose

### Concepts to study

**1. What is MongoDB?**
- Search: "MongoDB explained for beginners"
- Understand: MongoDB is a NoSQL database. Data is stored as documents (like JSON objects) in collections (like tables). There is no fixed schema by default.
- Key question: *How is MongoDB different from a SQL database like MySQL?*

**2. What is Mongoose?**
- Search: "Mongoose ODM tutorial Node.js"
- Understand: Mongoose is a library that adds structure (schemas) to MongoDB. It validates data before saving, lets you define relationships, and provides a clean API for querying.
- Key question: *Why use Mongoose instead of the raw MongoDB driver?*

**3. What is a Schema vs a Model?**
- Search: "Mongoose schema vs model difference"
- Understand: A Schema defines the structure (fields, types, validation). A Model is the class you use to interact with a collection — it's built from a Schema.
- Key question: *If you have `const User = mongoose.model('User', userSchema)`, what does `User.find()` return?*

**4. What is an ObjectId?**
- Search: "MongoDB ObjectId explained"
- Understand: MongoDB auto-generates a unique `_id` for every document. It's a 12-byte value, displayed as a 24-character hex string. It's used to reference documents across collections.
- Key question: *What does `ref: 'User'` in a Mongoose schema field mean?*

**5. What is populate()?**
- Search: "Mongoose populate explained"
- Understand: `populate()` replaces an ObjectId reference with the actual document from the referenced collection. It's like a JOIN in SQL, but done at the application level.
- Key question: *What does `Message.find().populate('sender', 'name avatar')` return?*

**6. What are Mongoose hooks (pre/post)?**
- Search: "Mongoose pre save hook example"
- Understand: Hooks let you run code automatically before or after certain operations. The `pre('save')` hook fires before a document is saved to the database.
- Key question: *Why does the password hashing live in a `pre('save')` hook instead of the controller?*

**7. What is an index in a database?**
- Search: "database index explained simply"
- Understand: An index is like a book's table of contents — it makes lookups faster. Without an index, MongoDB scans every document to find a match (slow). With an index, it jumps straight to the result.
- Key question: *Why do we add an index on `{ room: 1, createdAt: -1 }` in the Message model?*

### ✅ Check questions — answer these before Day 2
- What does `mongoose.connect(uri)` return? How do you handle its failure?
- What is the difference between `User.create({})` and `new User({}).save()`?
- What does `select: false` on a schema field do?
- How do you tell Mongoose to automatically add `createdAt` and `updatedAt`?

---

## Day 3 — Authentication (JWT + bcrypt)

### Concepts to study

**1. What is authentication vs authorization?**
- Search: "authentication vs authorization explained"
- Understand: Authentication = proving who you are (login). Authorization = proving you're allowed to do something (access a protected route). These are different things.
- Key question: *Is checking "is this user logged in?" auth or authz? What about "is this user an admin?"*

**2. What is password hashing?**
- Search: "bcrypt password hashing explained"
- Understand: Passwords must never be stored as plain text. Hashing is a one-way transformation — you can verify a password against a hash, but you can't reverse a hash back to the password.
- Key question: *Why is bcrypt preferred over MD5 or SHA256 for passwords?*

**3. What is a JWT (JSON Web Token)?**
- Search: "JWT explained simply"
- Understand: A JWT is a self-contained token with 3 parts: header (algorithm), payload (data like userId), and signature (tamper-proof). The server issues it at login; the client sends it with every subsequent request.
- Key question: *If I have a JWT, can I read what's inside it? Is it encrypted?*

**4. What is a salt in bcrypt?**
- Search: "bcrypt salt rounds explained"
- Understand: A salt is random data added to the password before hashing. This means two users with the same password get different hashes. `genSalt(10)` means 2^10 = 1024 hashing rounds — slow enough to resist brute-force attacks.
- Key question: *What does the `10` in `bcrypt.genSalt(10)` control?*

**5. What is the JWT flow?**
- Search: "JWT authentication flow diagram"
- Understand the full cycle:
  1. User sends email + password → server verifies → server signs a JWT → returns token
  2. Client stores token (localStorage)
  3. Client sends token in `Authorization: Bearer <token>` header on every request
  4. Server verifies token signature → extracts userId → processes request
- Key question: *Where is the JWT secret used — on the server or the client?*

**6. What is Express middleware — protect pattern?**
- Search: "Express auth middleware JWT protect route"
- Understand: A `protect` middleware sits in front of any route that requires login. It extracts the token from the `Authorization` header, verifies it, fetches the user, attaches them to `req.user`, and calls `next()`. If anything fails, it sends a 401 before the route handler ever runs.
- Key question: *What happens to a request that hits a protected route with an expired token?*

**7. What is a custom error class?**
- Search: "JavaScript custom error class extends Error"
- Understand: Extending the built-in `Error` class lets you attach extra properties like `statusCode`. This lets your error handler send the right HTTP status code automatically.

### ✅ Check questions — answer these before Day 3
- What does `jwt.sign(payload, secret, options)` return?
- What does `jwt.verify(token, secret)` throw if the token is invalid?
- What does `next(new AppError('Not authorized', 401))` do inside a middleware?
- Why does `errorHandler` need 4 parameters `(err, req, res, next)` to work in Express?

---

## Day 4 — REST API (Rooms + Messages)

### Concepts to study

**1. What is input validation and why does it matter?**
- Search: "input validation vs sanitization Node.js"
- Understand: Validation checks that incoming data is the right type, format, and length before it reaches the database. Without it, users can send garbage (or attacks) into your DB.
- Key question: *What is the difference between validation (rejecting bad data) and sanitization (cleaning bad data)?*

**2. What is the controller pattern?**
- Search: "MVC controller pattern Express"
- Understand: Routes are thin wires — they just map a URL to a function. Controllers contain all the business logic. This separation makes code easier to test and maintain.
- Key question: *Why is it bad to put database queries directly inside route files?*

**3. What is pagination?**
- Search: "pagination with MongoDB skip limit"
- Understand: You never return all documents at once — only a page at a time. `skip((page-1) * limit)` jumps past earlier pages. `limit(N)` caps how many come back.
- Key question: *If page=3 and limit=20, how many documents do you skip?*

**4. What is express-validator?**
- Search: "express-validator tutorial"
- Understand: express-validator lets you declare validation rules directly in your route files, then check the results inside your controller with `validationResult(req)`.
- Key question: *Where in the request lifecycle does validation run — before or after the controller?*

**5. What are HTTP status codes and when to use them?**
- Search: "HTTP status codes cheat sheet"
- Understand the ones you'll use: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Server Error).
- Key question: *What is the difference between 401 and 403? When do you use each?*

**6. What does req.params vs req.query vs req.body mean?**
- Understand the three ways data arrives in a request:
  - `req.params` → from the URL path: `/rooms/:id` → `req.params.id`
  - `req.query` → from the URL query string: `?page=2&limit=20` → `req.query.page`
  - `req.body` → from the request body (JSON): `{ name: 'General' }` → `req.body.name`
- Key question: *A GET request for paginated messages uses which of these three?*

### ✅ Check questions — answer these before Day 4
- How do you protect a route with the `protect` middleware in a route file?
- What does `Room.find({ participants: userId })` return?
- How do you check if a user is in a room's participants array before returning data?
- What is the `asyncHandler` wrapper doing, step by step?

---

## Day 5 — Socket.io Real-time Messaging

### Concepts to study

**1. What is a WebSocket?**
- Search: "WebSocket vs HTTP explained"
- Understand: HTTP is request-response — the client always initiates. WebSockets are a persistent two-way connection — the server can push data to the client at any time. This is what makes real-time possible.
- Key question: *Why can't you build a real-time chat with regular HTTP requests alone?*

**2. What is Socket.io?**
- Search: "Socket.io tutorial beginners"
- Understand: Socket.io wraps WebSockets with extra features: automatic reconnection, rooms, namespaces, and fallback to HTTP long-polling if WebSockets aren't supported.
- Key question: *What is a Socket.io "room"? How is it different from your MongoDB Room model?*

**3. What are events in Socket.io?**
- Search: "Socket.io emit on events explained"
- Understand: Communication happens via named events. `socket.emit('event-name', data)` sends. `socket.on('event-name', callback)` listens. Both client and server can emit and listen.
- Key question: *What is the difference between `io.to(room).emit()` and `socket.to(room).emit()`?*

**4. What are Socket.io rooms?**
- Search: "Socket.io rooms tutorial"
- Understand: A room is a named channel. `socket.join('room-123')` adds the socket to that group. `io.to('room-123').emit(...)` broadcasts to everyone in that group. Rooms exist only in server memory — not in the database.
- Key question: *If a user closes their browser and reconnects, are they still in the Socket.io room?*

**5. How does Socket.io authentication work?**
- Search: "Socket.io JWT authentication middleware"
- Understand: Unlike HTTP where you put the token in a header, Socket.io sends auth data in `socket.handshake.auth`. The server uses `io.use()` middleware to verify it before the connection is established.
- Key question: *What happens to a socket connection if the JWT verification fails in `io.use()`?*

**6. What is the Socket.io + HTTP server relationship?**
- Search: "Socket.io attach to Express server"
- Understand: Socket.io attaches to a Node.js `http.Server` instance, not directly to the Express `app`. That's why you need `http.createServer(app)` and pass the result to `new Server(httpServer)`.
- Key question: *Why do both the REST API and Socket.io share the same port?*

### ✅ Check questions — answer these before Day 5
- What is the difference between `socket.emit` (sends to yourself) and `socket.to(room).emit` (sends to room except you)?
- Where do you save the message to MongoDB — before or after emitting to the room? Why?
- What event fires when a client disconnects unexpectedly?
- How do you get the connected user's data inside a socket event handler?

---

## Day 6 — Security + File Uploads

### Concepts to study

**1. What does Helmet do?**
- Search: "helmet.js Express security headers"
- Understand: Helmet sets HTTP security headers that protect against common attacks (clickjacking, XSS via scripts, sniffing MIME types). One line of code, significant protection.
- Key question: *What is the X-Frame-Options header and what attack does it prevent?*

**2. What is CORS and why do you need it?**
- Search: "CORS explained simply"
- Understand: Browsers block frontend apps from calling a different domain's API unless the server explicitly allows it. CORS (Cross-Origin Resource Sharing) is the mechanism that grants permission.
- Key question: *Why doesn't CORS matter in Postman but does in the browser?*

**3. What is rate limiting?**
- Search: "rate limiting API Express"
- Understand: Rate limiting caps how many requests a single IP can make in a time window. Prevents brute-force attacks (e.g., trying 10,000 passwords per minute) and API abuse.
- Key question: *What HTTP status code should rate limiting return? Why that code?*

**4. What is Multer?**
- Search: "Multer file upload Express tutorial"
- Understand: Multer is middleware that parses `multipart/form-data` requests (the format used when uploading files). Without it, Express can't read uploaded files at all.
- Key question: *What does `req.file` contain after Multer processes an upload request?*

**5. What is Cloudinary?**
- Search: "Cloudinary Node.js upload tutorial"
- Understand: Cloudinary is a cloud service for storing and serving images. `multer-storage-cloudinary` makes Multer upload directly to Cloudinary instead of saving to local disk.
- Key question: *Why don't we save uploaded files to the local filesystem on Railway?*

**6. What is XSS (Cross-Site Scripting)?**
- Search: "XSS attack explained simply"
- Understand: XSS is when a malicious user injects JavaScript into your app via an input field. The `xss-clean` package strips HTML tags from request bodies before they reach your database.
- Key question: *What happens if a user registers with the name `<script>document.cookie</script>` and you don't sanitize it?*

**7. What is NoSQL injection?**
- Search: "MongoDB NoSQL injection attack"
- Understand: Similar to SQL injection but for MongoDB. An attacker can send `{ "$gt": "" }` as a password to bypass authentication. `express-mongo-sanitize` strips `$` and `.` from request bodies.
- Key question: *Why is `{ password: { "$gt": "" } }` dangerous in a MongoDB query?*

### ✅ Check questions — answer these before Day 6
- What order should helmet, cors, express.json, and your routes be registered in `index.js`?
- What is the difference between `multer.memoryStorage()` and `multer-storage-cloudinary`?
- What does `select: false` prevent and why is it related to security?
- What does the `asyncHandler` pattern prevent from reaching the global error handler unhandled?

---

## Day 7 — Frontend Connection + Deployment

### Concepts to study

**1. What is Next.js App Router?**
- Search: "Next.js App Router tutorial 2024"
- Understand: Next.js 13+ uses the `app/` directory. Files named `page.jsx` become routes. `layout.jsx` wraps pages with shared UI. Route groups in `(parentheses)` don't affect the URL.
- Key question: *What is the difference between a Server Component and a Client Component in Next.js?*

**2. What is an Axios interceptor?**
- Search: "Axios interceptors tutorial"
- Understand: An interceptor runs before every request or after every response. A request interceptor is perfect for automatically attaching the JWT token to every API call without repeating it everywhere.
- Key question: *Without an interceptor, what would you have to do for every single API call?*

**3. What is React Context?**
- Search: "React Context API tutorial"
- Understand: Context is a way to share state globally without prop drilling. AuthContext stores the current user and the login/logout functions. Any component can read it with `useContext(AuthContext)`.
- Key question: *What problem does Context solve that regular props don't?*

**4. What is socket.io-client?**
- Search: "socket.io-client React tutorial"
- Understand: The client-side counterpart of the server-side Socket.io. `io(URL, options)` creates a connection. You listen to events with `socket.on()` and send events with `socket.emit()`.
- Key question: *Why do we set `autoConnect: false` when creating the socket in `lib/socket.js`?*

**5. What is Railway and how do you deploy to it?**
- Search: "deploy Node.js Express to Railway"
- Understand: Railway detects your Node.js project automatically. You connect your GitHub repo, set environment variables in the Railway dashboard, and it deploys on every push to main.
- Key question: *How does Railway know to run `npm start` instead of `npm run dev`?*

**6. What is Vercel and how do you deploy Next.js to it?**
- Search: "deploy Next.js to Vercel"
- Understand: Vercel is made by the Next.js team. It auto-detects Next.js projects. You connect GitHub, set your `NEXT_PUBLIC_*` env vars, and it deploys automatically.
- Key question: *Why must frontend env variables that are used in the browser be prefixed with `NEXT_PUBLIC_`?*

**7. What is CORS in production?**
- Search: "CORS production Express Vercel Railway"
- Understand: In production, your frontend is on `https://yourapp.vercel.app` and your backend is on `https://yourapp.railway.app`. These are different origins. You must update `CLIENT_URL` in Railway to the Vercel URL or the browser will block all API calls.
- Key question: *What error will you see in the browser console if CORS is misconfigured in production?*

### ✅ Check questions — answer these before Day 7
- What is the difference between `'use client'` and a Server Component in Next.js?
- How do you protect a page route in Next.js so unauthenticated users get redirected?
- What does `localStorage.getItem('token')` return if no token is stored?
- What does `socket.connect()` do, and when should you call it?

---

## General Concepts (Study Any Time)

These are foundational concepts that apply across all days. If you're confused about one of these, look it up immediately — they underlie everything else.

| Concept | Search term | Why it matters |
|---------|-------------|----------------|
| Async/await | "JavaScript async await explained" | Everything in Node.js is async |
| Promises | "JavaScript promises tutorial" | async/await is built on top of Promises |
| Destructuring | "JavaScript destructuring examples" | Used constantly in controllers and routes |
| Spread operator | "JavaScript spread operator" | Used in object merging and array operations |
| Arrow functions | "JavaScript arrow function vs regular" | Used everywhere |
| Array methods | "JavaScript map filter reduce" | Used for transforming data from MongoDB |
| HTTP methods | "HTTP GET POST PUT DELETE explained" | The foundation of REST |
| JSON | "JSON explained simply" | All API data is JSON |
| Error first callbacks | "Node.js error first callback pattern" | Older Node.js pattern you'll see in docs |
| npm | "npm explained beginners" | How you install and manage packages |

---

*This file does not need to be updated as you build — it is static study material. If you discover a concept that wasn't listed here but was crucial for a day, add it at the bottom with a note.*

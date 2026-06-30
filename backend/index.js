import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

import connectDB from './src/config/db.js';
import testRouter from './src/routes/test.js';
import authRouter from './src/routes/auth.js';
import errorHandler from './src/middleware/errorHandler.js';
import roomsRouter from './src/routes/rooms.js';
import messagesRouter from './src/routes/messages.js';
import uploadRouter from './src/routes/upload.js';
import initSocket from './src/socket/index.js';

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

// ── Global Middleware ─────────────────────────────────────────────────────────

app.use(morgan('dev'));
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(mongoSanitize());
app.use(xss());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
}));

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api', testRouter);
app.use('/api/auth', authRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/upload', uploadRouter);

// ── 404 Handler ───────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Error Handler — must be last ──────────────────────────────────────────────

app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}















export default app;

/*
===============================================================================
INDEX.JS - FUNCTIONALITY SUMMARY
===============================================================================

Purpose
-------
This is the main entry point of the ChatterBox backend application.

It is responsible for:

• Loading environment variables.
• Connecting to MongoDB.
• Creating the Express application.
• Creating the HTTP server.
• Initializing Socket.IO.
• Configuring global middleware.
• Registering API routes.
• Handling unknown routes.
• Handling application errors.
• Starting the server.

Every request or socket connection begins here.

===============================================================================
1. LOAD ENVIRONMENT VARIABLES
===============================================================================

dotenv loads configuration values from the ".env" file into process.env.

Examples include:

• PORT
• MONGO_URI
• JWT_SECRET
• CLIENT_URL
• CLOUDINARY credentials

These values are used throughout the application.

===============================================================================
2. DATABASE CONNECTION
===============================================================================

connectDB() establishes a connection to MongoDB before the application starts.

If the database connection fails, the server cannot function correctly.

===============================================================================
3. SERVER INITIALIZATION
===============================================================================

The application creates:

• An Express application
      Handles HTTP requests and API routes.

• An HTTP server
      Wraps the Express application and allows Socket.IO to share the same
      server.

• A Socket.IO server
      Enables real-time communication such as messaging, typing indicators,
      and user presence updates.

===============================================================================
4. GLOBAL MIDDLEWARE
===============================================================================

Middleware is executed for every incoming request.

Configured middleware includes:

• morgan
      Logs incoming HTTP requests.

• helmet
      Adds security-related HTTP headers.

• cors
      Allows requests from the frontend application.

• express.json()
      Parses incoming JSON request bodies.

• express-mongo-sanitize
      Protects against MongoDB injection attacks.

• xss-clean
      Helps prevent Cross-Site Scripting (XSS) attacks by sanitizing user input.

• express-rate-limit
      Limits the number of requests a client can make within a specific time
      window, helping protect the API from abuse.

===============================================================================
5. API ROUTES
===============================================================================

The application registers multiple route modules:

• /api
      General test routes.

• /api/auth
      Authentication (register, login, profile, etc.).

• /api/rooms
      Chat room management.

• /api/messages
      Message-related operations.

• /api/upload
      Avatar image uploads.

Each module contains its own routes and business logic, keeping the project
organized and modular.

===============================================================================
6. 404 ROUTE HANDLER
===============================================================================

If no registered route matches the incoming request, the server responds with:

• HTTP Status: 404
• A JSON error message indicating the requested route was not found.

This provides a consistent response for invalid endpoints.

===============================================================================
7. GLOBAL ERROR HANDLER
===============================================================================

The custom error-handling middleware is registered last.

It catches errors generated anywhere in the application and converts them into
standardized JSON responses.

This ensures consistent error handling across all routes.

===============================================================================
8. STARTING THE SERVER
===============================================================================

The server listens on the configured port unless the application is running in
the test environment.

Condition:

    NODE_ENV !== "test"

This prevents automated tests from accidentally starting another server,
allowing the test suite to create and manage its own isolated server instance.

===============================================================================
OVERALL RESPONSIBILITY
===============================================================================

This file serves as the application's central bootstrap file.

It is responsible for:

✓ Loading configuration.
✓ Connecting to MongoDB.
✓ Creating the Express application.
✓ Creating the HTTP server.
✓ Initializing Socket.IO.
✓ Configuring global middleware.
✓ Registering API routes.
✓ Handling unknown routes.
✓ Handling application-wide errors.
✓ Starting the backend server.

In short, this file brings together every major component of the backend and
starts the ChatterBox application, making it the central entry point for both
HTTP requests and real-time Socket.IO communication.
===============================================================================
*/





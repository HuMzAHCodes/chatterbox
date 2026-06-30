import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import registerRoomHandlers from './handlers/roomHandler.js';
import registerMessageHandlers from './handlers/messageHandler.js';

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  // ── Auth Middleware ──────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User no longer exists'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  // ── Connection ───────────────────────────────────────────────────────────
  io.on('connection', async (socket) => {
    console.log(`Socket connected: ${socket.user.name} (${socket.id})`);

    // Mark user online
    await User.findByIdAndUpdate(socket.user._id, { isOnline: true });
    io.emit('user-online', { userId: socket.user._id.toString() });

    // Register event handlers
    registerRoomHandlers(io, socket);
    registerMessageHandlers(io, socket);

    // ── Disconnect ─────────────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.user.name}`);

      await User.findByIdAndUpdate(socket.user._id, {
        isOnline: false,
        lastSeen: new Date(),
      });

      io.emit('user-offline', { userId: socket.user._id.toString() });
    });
  });

  return io;
};

export default initSocket;








/*
===============================================================================
SOCKET.JS - FUNCTIONALITY SUMMARY
===============================================================================

This file is responsible for setting up the entire Socket.IO server for the
application. It handles real-time communication between the server and all
connected clients.

Flow of execution:

1. Creates a Socket.IO server
   - Attaches Socket.IO to the existing HTTP server.
   - Enables CORS so the frontend can establish socket connections.

2. Authenticates every incoming socket connection
   - Reads the JWT token from:
       socket.handshake.auth.token
   - Verifies the token using JWT.
   - Finds the corresponding user in MongoDB.
   - If authentication succeeds:
         socket.user = authenticated user
     so every event handler can access the logged-in user.
   - If authentication fails, the connection is rejected.

3. Handles new client connections
   - Runs whenever a user successfully connects.
   - Prints a log message.
   - Marks the user as online in the database.
   - Broadcasts a "user-online" event to every connected client.

4. Registers feature-specific socket handlers
   - registerRoomHandlers(...)
       Handles room creation, joining, leaving, etc.
   - registerMessageHandlers(...)
       Handles sending and receiving chat messages.

   This keeps the code modular instead of placing every socket event in one file.

5. Handles client disconnection
   - Runs automatically when the user closes the app, refreshes the page,
     or loses the connection.
   - Marks the user as offline.
   - Updates the user's lastSeen timestamp.
   - Broadcasts a "user-offline" event to every connected client.

6. Returns the configured Socket.IO instance
   - Allows the rest of the application to use the initialized io object.

Overall responsibility:
This file acts as the main entry point for all real-time communication.
It initializes Socket.IO, authenticates users, tracks online/offline status,
registers socket event handlers, and manages client connections.
===============================================================================
*/
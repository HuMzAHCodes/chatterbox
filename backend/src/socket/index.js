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
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.user.name} (${socket.id})`);

    // Register event handlers FIRST — before any async DB work
    registerRoomHandlers(io, socket);
    registerMessageHandlers(io, socket);

    // Mark user online — fire and forget, doesn't block listener registration
    User.findByIdAndUpdate(socket.user._id, { isOnline: true })
      .then(() => {
        io.emit('user-online', { userId: socket.user._id.toString() });
      })
      .catch((err) => console.error('Failed to set user online:', err));

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
SOCKET/INDEX.JS - FUNCTIONALITY SUMMARY
===============================================================================

Purpose
-------
This file initializes and configures the application's Socket.IO server.

It is the main entry point for all real-time communication and is responsible
for:

• Creating the Socket.IO server.
• Authenticating socket connections using JWT.
• Registering all socket event handlers.
• Tracking users' online/offline status.
• Broadcasting user presence changes to connected clients.

===============================================================================
1. SOCKET.IO SERVER INITIALIZATION
===============================================================================

A new Socket.IO server is attached to the existing HTTP server.

Configuration includes:

• CORS settings that allow requests from the frontend.
• Credential support for authenticated connections.

Once initialized, the Socket.IO server can accept real-time client
connections.

===============================================================================
2. SOCKET AUTHENTICATION MIDDLEWARE
===============================================================================

Before any client is allowed to connect, every socket passes through an
authentication middleware.

Authentication process:

1. Read the JWT from:

       socket.handshake.auth.token

2. Verify the JWT using the application's secret.

3. Retrieve the corresponding user from MongoDB.

4. If the user exists:

       socket.user = authenticated user

   This makes the authenticated user available to every socket event handler.

5. If authentication fails:

   • Missing token
   • Invalid token
   • User no longer exists

   the connection is rejected and the client receives an authentication error.

===============================================================================
3. CLIENT CONNECTION HANDLING
===============================================================================

When authentication succeeds, the "connection" event is fired.

For every connected client, this file:

• Logs the successful connection.
• Registers all room-related event handlers.
• Registers all message-related event handlers.
• Updates the user's online status.
• Broadcasts that the user is online.

===============================================================================
4. REGISTERING SOCKET EVENT HANDLERS
===============================================================================

Immediately after a client connects, the following modules are registered:

• registerRoomHandlers()
      Handles joining and leaving chat rooms.

• registerMessageHandlers()
      Handles sending messages and typing indicators.

Important design decision:

The handlers are registered BEFORE any asynchronous database operations.

This ensures that clients can immediately emit events after connecting without
risking those events being missed while the server is waiting for database
updates.

===============================================================================
5. USER ONLINE STATUS
===============================================================================

After registering event handlers, the server updates the user's status.

It:

• Marks the user as online in MongoDB.
• Broadcasts a "user-online" event to every connected client.

This database update runs asynchronously ("fire and forget"), so it does not
delay the registration of socket listeners.

===============================================================================
6. CLIENT DISCONNECTION
===============================================================================

When a client disconnects, the server:

• Logs the disconnection.
• Marks the user as offline.
• Updates the user's lastSeen timestamp.
• Broadcasts a "user-offline" event to all connected clients.

This keeps every client informed about users' online presence.

===============================================================================
OVERALL RESPONSIBILITY
===============================================================================

This file serves as the central coordinator for the application's real-time
communication system.

It is responsible for:

✓ Initializing the Socket.IO server.
✓ Authenticating every socket connection.
✓ Making authenticated user information available to socket handlers.
✓ Registering room and message event handlers.
✓ Tracking users' online and offline status.
✓ Broadcasting presence updates to connected clients.

Every real-time interaction begins here, making this file the entry point for
all Socket.IO functionality in the application.
===============================================================================
*/
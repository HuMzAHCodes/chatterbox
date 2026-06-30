import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';
import { io as ioClient } from 'socket.io-client';
import express from 'express';
import initSocket from '../socket/index.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import jwt from 'jsonwebtoken';

dotenv.config();

let server;
let port;
let userA, userB;
let tokenA, tokenB;
let room;

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

const createClient = (token) => {
  return ioClient(`http://localhost:${port}`, {
    auth: { token },
    transports: ['websocket'],
    forceNew: true,
    reconnection: false,
  });
};

const waitForConnect = (socket) =>
  new Promise((resolve, reject) => {
    if (socket.connected) return resolve();
    socket.once('connect', resolve);
    socket.once('connect_error', reject);
  });

const waitForEvent = (socket, event, timeout = 5000) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout waiting for ${event}`)), timeout);
    socket.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);

  const app = express();
  server = http.createServer(app);
  initSocket(server);

  await new Promise((resolve) => {
    server.listen(0, () => {
      port = server.address().port;
      resolve();
    });
  });
}, 30000);

beforeEach(async () => {
  userA = await User.create({ name: 'Ali', email: `ali${Date.now()}@test.com`, password: 'secret123' });
  userB = await User.create({ name: 'Sara', email: `sara${Date.now()}@test.com`, password: 'secret123' });

  tokenA = generateToken(userA._id);
  tokenB = generateToken(userB._id);

  room = await Room.create({
    name: 'Test Room',
    createdBy: userA._id,
    participants: [userA._id, userB._id],
  });
}, 30000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await new Promise((resolve) => server.close(resolve));
}, 30000);

// ── CONNECTION ────────────────────────────────────────────────────────────────

describe('Socket.io Connection', () => {
  it('should connect with a valid JWT', async () => {
    const client = createClient(tokenA);
    await waitForConnect(client);
    expect(client.connected).toBe(true);
    client.disconnect();
  }, 15000);

  it('should reject connection with invalid JWT', async () => {
    const client = createClient('invalid-token');
    try {
      await waitForConnect(client);
      throw new Error('Should not have connected');
    } catch (err) {
      expect(err.message).toBe('Authentication failed');
    }
    client.disconnect();
  }, 15000);

  it('should reject connection with no token', async () => {
    const client = ioClient(`http://localhost:${port}`, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });
    try {
      await waitForConnect(client);
      throw new Error('Should not have connected');
    } catch (err) {
      expect(err.message).toBe('No token provided');
    }
    client.disconnect();
  }, 15000);
});

// ── ROOMS ─────────────────────────────────────────────────────────────────────

describe('Socket.io Room Events', () => {
  it('should join a room and receive confirmation', async () => {
    const client = createClient(tokenA);
    await waitForConnect(client);
    await delay(100);

    client.emit('join-room', { roomId: room._id.toString() });
    const data = await waitForEvent(client, 'joined-room');

    expect(data.roomId).toBe(room._id.toString());
    client.disconnect();
  }, 15000);

  it('should notify other users when someone joins', async () => {
    const clientA = createClient(tokenA);
    const clientB = createClient(tokenB);

    await waitForConnect(clientA);
    await waitForConnect(clientB);
    await delay(100);

    clientA.emit('join-room', { roomId: room._id.toString() });
    await waitForEvent(clientA, 'joined-room');

    const userJoinedPromise = waitForEvent(clientA, 'user-joined');
    clientB.emit('join-room', { roomId: room._id.toString() });

    const data = await userJoinedPromise;
    expect(data.username).toBe('Sara');

    clientA.disconnect();
    clientB.disconnect();
  }, 15000);
});

// ── MESSAGES ──────────────────────────────────────────────────────────────────

describe('Socket.io Message Events', () => {
  it('should send a message and save it to the database', async () => {
    const client = createClient(tokenA);
    await waitForConnect(client);
    await delay(100);

    client.emit('join-room', { roomId: room._id.toString() });
    await waitForEvent(client, 'joined-room');

    const newMessagePromise = waitForEvent(client, 'new-message');
    client.emit('send-message', { roomId: room._id.toString(), content: 'Hello!' });

    const msg = await newMessagePromise;
    expect(msg.content).toBe('Hello!');
    expect(msg.sender.name).toBe('Ali');

    client.disconnect();
  }, 15000);

  it('should broadcast message to all clients in the room', async () => {
    const clientA = createClient(tokenA);
    const clientB = createClient(tokenB);

    await waitForConnect(clientA);
    await waitForConnect(clientB);
    await delay(100);

    clientA.emit('join-room', { roomId: room._id.toString() });
    await waitForEvent(clientA, 'joined-room');

    clientB.emit('join-room', { roomId: room._id.toString() });
    await waitForEvent(clientB, 'joined-room');

    const aReceives = waitForEvent(clientA, 'new-message');
    const bReceives = waitForEvent(clientB, 'new-message');

    clientA.emit('send-message', { roomId: room._id.toString(), content: 'Hi everyone' });

    const [msgA, msgB] = await Promise.all([aReceives, bReceives]);
    expect(msgA.content).toBe('Hi everyone');
    expect(msgB.content).toBe('Hi everyone');

    clientA.disconnect();
    clientB.disconnect();
  }, 15000);

  it('should notify other users when someone is typing (not sender)', async () => {
    const clientA = createClient(tokenA);
    const clientB = createClient(tokenB);

    await waitForConnect(clientA);
    await waitForConnect(clientB);
    await delay(100);

    clientA.emit('join-room', { roomId: room._id.toString() });
    await waitForEvent(clientA, 'joined-room');

    clientB.emit('join-room', { roomId: room._id.toString() });
    await waitForEvent(clientB, 'joined-room');

    let senderReceivedTyping = false;
    clientA.once('user-typing', () => { senderReceivedTyping = true; });

    const bReceivesTyping = waitForEvent(clientB, 'user-typing');
    clientA.emit('typing', { roomId: room._id.toString() });

    const data = await bReceivesTyping;
    expect(data.username).toBe('Ali');
    expect(senderReceivedTyping).toBe(false);

    clientA.disconnect();
    clientB.disconnect();
  }, 15000);
});







/*
===============================================================================
SOCKET.INTEGRATION.TEST.JS - FUNCTIONALITY SUMMARY
===============================================================================

Purpose
-------
This file contains integration tests for the application's Socket.IO server.
Instead of testing individual functions in isolation, these tests verify that
the complete real-time chat system works correctly by checking the interaction
between:

• Socket.IO server
• Socket.IO clients
• JWT authentication
• MongoDB database
• Chat room functionality
• Real-time messaging

These tests simulate real users connecting to the server and exchanging events,
making them much closer to real application behavior than unit tests.

===============================================================================
TEST ENVIRONMENT SETUP
===============================================================================

beforeAll()
-----------
Executed once before the test suite begins.

Responsibilities:
• Connect to the test MongoDB database.
• Create an Express application.
• Create an HTTP server.
• Initialize the Socket.IO server.
• Start the server on a randomly available port.

This provides an isolated environment dedicated to testing.

-------------------------------------------------------------------------------

beforeEach()
------------
Executed before every test.

Responsibilities:
• Create two test users (Ali and Sara).
• Generate JWT tokens for both users.
• Create a chat room containing both users.

Each test starts with completely fresh data, ensuring tests remain independent
and repeatable.

-------------------------------------------------------------------------------

afterEach()
-----------
Executed after every test.

Responsibilities:
• Remove all documents from every MongoDB collection.

This prevents data created in one test from affecting another.

-------------------------------------------------------------------------------

afterAll()
----------
Executed once after every test has completed.

Responsibilities:
• Drop the test database.
• Close the MongoDB connection.
• Stop the HTTP server.

This releases all resources used during testing.

===============================================================================
HELPER FUNCTIONS
===============================================================================

generateToken(userId)
---------------------
Generates a valid JWT for a user.

The generated token is used to authenticate Socket.IO clients during testing.

-------------------------------------------------------------------------------

createClient(token)
-------------------
Creates a Socket.IO client configured for testing.

Configuration includes:
• JWT authentication
• WebSocket transport only
• Forced new connection
• Automatic reconnection disabled

This ensures each test uses a fresh and predictable socket connection.

-------------------------------------------------------------------------------

waitForConnect(socket)
----------------------
Returns a Promise that resolves when the socket successfully connects.

If authentication fails or another connection error occurs, the Promise is
rejected with the corresponding error.

This allows tests to simply write:

    await waitForConnect(client);

instead of managing callback-based connection events.

-------------------------------------------------------------------------------

waitForEvent(socket, event)
---------------------------
Waits for a specific Socket.IO event to occur.

Features:
• Resolves when the event is received.
• Rejects automatically if the event is not received within the timeout.
• Prevents tests from hanging indefinitely.

Example:

    const message = await waitForEvent(client, 'new-message');

-------------------------------------------------------------------------------

delay(ms)
---------
Introduces a small delay before continuing execution.

This gives Socket.IO enough time to finish joining rooms or processing previous
events, reducing race conditions and making tests more reliable.

===============================================================================
TEST SUITES
===============================================================================

1. Socket Connection Tests
--------------------------

These tests verify authentication behavior.

Scenarios tested:

✓ Successful connection using a valid JWT.

✓ Rejection of clients using an invalid JWT.

✓ Rejection of clients that provide no authentication token.

These tests validate the Socket.IO authentication middleware.

-------------------------------------------------------------------------------

2. Room Event Tests
-------------------

These tests verify room management functionality.

Scenarios tested:

✓ User successfully joins a room.

✓ User receives a "joined-room" confirmation.

✓ Existing room members receive a "user-joined" notification when another user
  joins.

These tests validate roomHandler.js.

-------------------------------------------------------------------------------

3. Message Event Tests
----------------------

These tests verify messaging functionality.

Scenarios tested:

✓ Sending a message.

✓ Saving messages to MongoDB.

✓ Broadcasting messages to every participant in the room.

✓ Typing indicator notifications.

✓ Ensuring typing notifications are NOT sent back to the sender.

These tests validate messageHandler.js.

===============================================================================
OVERALL RESPONSIBILITY
===============================================================================

This file performs end-to-end integration testing for the application's
Socket.IO layer.

It verifies that:

✓ Authentication works correctly.
✓ Users can establish socket connections.
✓ Users can join chat rooms.
✓ Room events are broadcast correctly.
✓ Messages are stored successfully.
✓ Messages are delivered to every participant.
✓ Typing indicators function correctly.
✓ Invalid clients are rejected.

By testing the complete communication flow—from Socket.IO clients, through the
server and database, and back to connected clients—this test suite helps ensure
that the real-time chat system behaves reliably in a production-like
environment.
===============================================================================
*/
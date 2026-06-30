import mongoose from 'mongoose';
import dotenv from 'dotenv';
import request from 'supertest';
import app from '../../index.js';
import Room from '../models/Room.js';
import Message from '../models/Message.js';

dotenv.config();

let token;
let userId;
let roomId;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI_TEST);
  }
}, 30000);

beforeEach(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Ali', email: `ali${Date.now()}@test.com`, password: 'secret123' });
  token = res.body.data.token;
  userId = res.body.data.user._id;

  const roomRes = await request(app)
    .post('/api/rooms')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Test Room' });
  roomId = roomRes.body.data._id;
}, 30000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}, 30000);

afterAll(async () => {
  await mongoose.connection.dropDatabase();
}, 30000);

describe('GET /api/messages/:roomId', () => {
  it('should return empty array when no messages', async () => {
    const res = await request(app)
      .get(`/api/messages/${roomId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.totalPages).toBe(0);
  }, 30000);

  it('should return paginated messages with populated sender', async () => {
    await Message.create([
      { content: 'Message 1', sender: userId, room: roomId },
      { content: 'Message 2', sender: userId, room: roomId },
      { content: 'Message 3', sender: userId, room: roomId },
    ]);

    const res = await request(app)
      .get(`/api/messages/${roomId}?page=1&limit=2`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.page).toBe(1);
    expect(res.body.totalPages).toBe(2);
    expect(res.body.data[0].sender.name).toBe('Ali');
    expect(res.body.data[0].sender.password).toBeUndefined();
  }, 30000);

  it('should return messages sorted newest first', async () => {
    await Message.create({ content: 'First',  sender: userId, room: roomId });
    await Message.create({ content: 'Second', sender: userId, room: roomId });
    await Message.create({ content: 'Third',  sender: userId, room: roomId });

    const res = await request(app)
      .get(`/api/messages/${roomId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.data[0].content).toBe('Third');
    expect(res.body.data[2].content).toBe('First');
  }, 30000);

  it('should return 403 if user is not in room', async () => {
    const otherRoom = await Room.create({
      name: 'Other Room',
      createdBy: new mongoose.Types.ObjectId(),
      participants: [new mongoose.Types.ObjectId()],
    });

    const res = await request(app)
      .get(`/api/messages/${otherRoom._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  }, 30000);

  it('should return 404 for invalid room ID', async () => {
    const res = await request(app)
      .get(`/api/messages/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  }, 30000);

  it('should return 401 with no token', async () => {
    const res = await request(app).get(`/api/messages/${roomId}`);
    expect(res.statusCode).toBe(401);
  }, 30000);
});




/* ==========================================================================

FILE FUNCTIONALITY
==================

This file contains integration tests for the Message API endpoint
(GET /api/messages/:roomId). It verifies that authenticated users can
retrieve messages from rooms they belong to while enforcing pagination,
sorting, and access control.

1. DATABASE SETUP
   - Connects to the MongoDB test database before all tests.
   - Uses the MONGO_URI_TEST environment variable.

2. TEST DATA SETUP
   - Registers a new user before each test.
   - Retrieves a JWT token for authenticated requests.
   - Creates a test chat room owned by the authenticated user.
   - Stores the user ID and room ID for use throughout the tests.

3. DATABASE CLEANUP
   - Removes all documents from every collection after each test.
   - Drops the test database after all tests have completed.

4. MESSAGE RETRIEVAL TESTS (GET /api/messages/:roomId)
   - Returns an empty array when the room contains no messages.
   - Retrieves existing messages from a room.
   - Supports pagination using page and limit query parameters.
   - Returns pagination metadata (count, page, totalPages).
   - Populates sender information for each message.
   - Ensures sensitive fields (such as passwords) are excluded.
   - Returns messages sorted from newest to oldest.

5. AUTHORIZATION & VALIDATION TESTS
   - Allows only room participants to access room messages.
   - Returns HTTP 403 when the authenticated user is not a participant.
   - Returns HTTP 404 when the requested room does not exist.
   - Returns HTTP 401 when no authentication token is provided.

Overall Purpose
---------------
This file performs integration testing for the Message retrieval API,
ensuring that authentication, authorization, pagination, sorting,
sender population, and API responses all function correctly under both
successful and failure scenarios.

=========================================================================== */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import request from 'supertest';
import app from '../../index.js';
import Room from '../models/Room.js';

dotenv.config();

let token;
let userId;

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

describe('POST /api/rooms', () => {
  it('should create a room and add creator to participants', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'General', description: 'Main room', isPrivate: false });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('General');
    expect(res.body.data.participants).toHaveLength(1);
    expect(res.body.data.participants[0]._id).toBe(userId);
    expect(res.body.data.createdBy.name).toBe('Ali');
  }, 30000);

  it('should return 401 with no token', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .send({ name: 'General' });

    expect(res.statusCode).toBe(401);
  }, 30000);

  it('should return 400 for missing room name', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'No name room' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  }, 30000);

  it('should default isPrivate to false', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Public Room' });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.isPrivate).toBe(false);
  }, 30000);
});

describe('GET /api/rooms', () => {
  it('should return only rooms the user is participant of', async () => {
    await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My Room' });

    const res = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].name).toBe('My Room');
  }, 30000);

  it('should return empty array if user has no rooms', async () => {
    const res = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(0);
    expect(res.body.data).toHaveLength(0);
  }, 30000);

  it('should return 401 with no token', async () => {
    const res = await request(app).get('/api/rooms');
    expect(res.statusCode).toBe(401);
  }, 30000);
});

describe('GET /api/rooms/:id', () => {
  it('should return room if user is participant', async () => {
    const createRes = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Room' });

    const roomId = createRes.body.data._id;

    const res = await request(app)
      .get(`/api/rooms/${roomId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe(roomId);
  }, 30000);

  it('should return 403 if user is not a participant', async () => {
    const room = await Room.create({
      name: 'Private Room',
      createdBy: new mongoose.Types.ObjectId(),
      participants: [new mongoose.Types.ObjectId()],
    });

    const res = await request(app)
      .get(`/api/rooms/${room._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Not authorized to access this room');
  }, 30000);

  it('should return 404 for invalid room ID', async () => {
    const res = await request(app)
      .get(`/api/rooms/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  }, 30000);
});





/* ==========================================================================

FILE FUNCTIONALITY
==================

This test file verifies the Room API endpoints using Supertest and a
MongoDB test database.

1. DATABASE SETUP
   - Connects to the MongoDB test database before running tests.
   - Uses the MONGO_URI_TEST environment variable.

2. TEST DATA SETUP
   - Registers a new user before each test.
   - Retrieves a valid JWT token for authenticated requests.
   - Stores the authenticated user's ID for validation.

3. DATABASE CLEANUP
   - Removes all documents from every collection after each test.
   - Drops the entire test database after all tests complete.

4. CREATE ROOM ENDPOINT TESTS (POST /api/rooms)
   - Creates a new chat room successfully.
   - Automatically adds the room creator to the participants list.
   - Verifies creator information is populated correctly.
   - Validates required fields (room name).
   - Confirms the default value of isPrivate is false.
   - Rejects unauthenticated requests.

5. GET USER ROOMS ENDPOINT TESTS (GET /api/rooms)
   - Returns only rooms where the authenticated user is a participant.
   - Returns an empty array when the user has no rooms.
   - Rejects requests without authentication.

6. GET SINGLE ROOM ENDPOINT TESTS (GET /api/rooms/:id)
   - Returns room details for authorized participants.
   - Prevents access to users who are not room participants.
   - Returns 404 when the requested room does not exist.
   - Verifies room authorization logic.

Overall Purpose
---------------
This file performs integration testing for the Room API, ensuring that
room creation, retrieval, authentication, authorization, validation,
participant management, and API responses work correctly.

=========================================================================== */
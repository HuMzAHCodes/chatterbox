import mongoose from 'mongoose';
import dotenv from 'dotenv';
import request from 'supertest';
import app from '../../index.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Message from '../models/Message.js';

dotenv.config();

let token;
let userId;
let roomId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
}, 30000);

beforeEach(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Ali', email: 'ali@test.com', password: 'secret123' });
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
  await mongoose.connection.close();
}, 30000);

// ── GET MESSAGES ──────────────────────────────────────────────────────────────

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
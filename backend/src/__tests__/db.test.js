import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Message from '../models/Message.js';

dotenv.config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
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
}, 30000);

describe('Database Models', () => {

  describe('User Model', () => {
    it('should create a user with hashed password', async () => {
      const user = await User.create({
        name: 'Ali Hassan',
        email: 'ali@test.com',
        password: 'secret123',
      });
      expect(user._id).toBeDefined();
      expect(user.password).not.toBe('secret123');
      expect(user.password).toMatch(/^\$2[ab]\$/);
    }, 30000);

    it('should find a user by email', async () => {
      await User.create({ name: 'Sara Ahmed', email: 'sara@test.com', password: 'secret123' });
      const found = await User.findOne({ email: 'sara@test.com' });
      expect(found).not.toBeNull();
      expect(found.name).toBe('Sara Ahmed');
    }, 30000);

    it('matchPassword() returns true for correct password', async () => {
      const user = await User.create({ name: 'Test', email: 'test@test.com', password: 'mypassword' });
      const fetched = await User.findById(user._id).select('+password');
      const isMatch = await fetched.matchPassword('mypassword');
      expect(isMatch).toBe(true);
    }, 30000);

    it('matchPassword() returns false for wrong password', async () => {
      const user = await User.create({ name: 'Test2', email: 'test2@test.com', password: 'mypassword' });
      const fetched = await User.findById(user._id).select('+password');
      const isMatch = await fetched.matchPassword('wrongpassword');
      expect(isMatch).toBe(false);
    }, 30000);

    it('should throw on duplicate email', async () => {
      await User.create({ name: 'First', email: 'dup@test.com', password: 'secret123' });
      await expect(
        User.create({ name: 'Second', email: 'dup@test.com', password: 'secret123' })
      ).rejects.toThrow();
    }, 30000);

    it('password field not returned by default', async () => {
      await User.create({ name: 'Hidden', email: 'hidden@test.com', password: 'secret123' });
      const user = await User.findOne({ email: 'hidden@test.com' });
      expect(user.password).toBeUndefined();
    }, 30000);
  });

  describe('Room Model', () => {
    let testUser;
    beforeEach(async () => {
      testUser = await User.create({
        name: 'Creator',
        email: `creator${Date.now()}@test.com`,
        password: 'secret123',
      });
    }, 30000);

    it('should create a room', async () => {
      const room = await Room.create({
        name: 'General',
        createdBy: testUser._id,
        participants: [testUser._id],
      });
      expect(room._id).toBeDefined();
      expect(room.isPrivate).toBe(false);
      expect(room.lastMessage).toBeNull();
    }, 30000);

    it('should throw on missing name', async () => {
      await expect(
        Room.create({ createdBy: testUser._id })
      ).rejects.toThrow('Room name is required');
    }, 30000);

    it('should find rooms by participant', async () => {
      await Room.create({ name: 'Test Room', createdBy: testUser._id, participants: [testUser._id] });
      const rooms = await Room.find({ participants: testUser._id });
      expect(rooms).toHaveLength(1);
    }, 30000);
  });

  describe('Message Model', () => {
    let testUser, testRoom;
    beforeEach(async () => {
      testUser = await User.create({
        name: 'Sender',
        email: `sender${Date.now()}@test.com`,
        password: 'secret123',
      });
      testRoom = await Room.create({
        name: 'Chat',
        createdBy: testUser._id,
        participants: [testUser._id],
      });
    }, 30000);

    it('should create a message', async () => {
      const msg = await Message.create({
        content: 'Hello!',
        sender: testUser._id,
        room: testRoom._id,
      });
      expect(msg._id).toBeDefined();
      expect(msg.messageType).toBe('text');
    }, 30000);

    it('should populate sender', async () => {
      const msg = await Message.create({ content: 'Hi', sender: testUser._id, room: testRoom._id });
      const populated = await Message.findById(msg._id).populate('sender', 'name avatar');
      expect(populated.sender.name).toBe('Sender');
      expect(populated.sender.password).toBeUndefined();
    }, 30000);

    it('should throw on missing content', async () => {
      await expect(
        Message.create({ sender: testUser._id, room: testRoom._id })
      ).rejects.toThrow('Message content is required');
    }, 30000);

    it('should sort messages by createdAt descending', async () => {
      await Message.create({ content: 'First',  sender: testUser._id, room: testRoom._id });
      await Message.create({ content: 'Second', sender: testUser._id, room: testRoom._id });
      await Message.create({ content: 'Third',  sender: testUser._id, room: testRoom._id });
      const messages = await Message.find({ room: testRoom._id }).sort({ createdAt: -1 });
      expect(messages[0].content).toBe('Third');
      expect(messages[2].content).toBe('First');
    }, 30000);
  });
});
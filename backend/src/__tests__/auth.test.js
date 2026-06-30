import mongoose from 'mongoose';
import dotenv from 'dotenv';
import request from 'supertest';
import app from '../../index.js';
import User from '../models/User.js';

dotenv.config();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI_TEST);
  }
}, 30000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
}, 30000);

describe('POST /api/auth/register', () => {
  it('should register a new user and return token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ali Hassan', email: 'ali@test.com', password: 'secret123' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('ali@test.com');
    expect(res.body.data.user.password).toBeUndefined();
  }, 30000);

  it('should return 400 for duplicate email', async () => {
    await User.create({ name: 'Ali', email: 'ali@test.com', password: 'secret123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ali 2', email: 'ali@test.com', password: 'secret123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Email already in use');
  }, 30000);

  it('should return 400 for missing name', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'ali@test.com', password: 'secret123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  }, 30000);

  it('should return 400 for missing password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ali', email: 'ali@test.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  }, 30000);

  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ali', email: 'notanemail', password: 'secret123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  }, 30000);
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await User.create({ name: 'Ali', email: 'ali@test.com', password: 'secret123' });
  }, 30000);

  it('should login with correct credentials and return token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ali@test.com', password: 'secret123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
  }, 30000);

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ali@test.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  }, 30000);

  it('should return 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'secret123' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  }, 30000);

  it('should return 400 for missing email or password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ali@test.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  }, 30000);
});

describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ali', email: 'ali@test.com', password: 'secret123' });
    token = res.body.data.token;
  }, 30000);

  it('should return current user with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('ali@test.com');
    expect(res.body.data.password).toBeUndefined();
  }, 30000);

  it('should return 401 with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('No token provided');
  }, 30000);

  it('should return 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer thisisafaketoken');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Token is invalid');
  }, 30000);

  it('should return 401 with malformed authorization header', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'InvalidFormat');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  }, 30000);
});




/* ==========================================================================

FILE FUNCTIONALITY
==================

This test file verifies the Authentication API endpoints using Supertest
and a dedicated MongoDB test database.

1. DATABASE SETUP
   - Connects to the test database before all tests.
   - Uses the MONGO_URI_TEST environment variable.

2. DATABASE CLEANUP
   - Clears all collections after each test to ensure test isolation.
   - Drops the test database after all tests complete.

3. REGISTER ENDPOINT TESTS (POST /api/auth/register)
   - Registers a new user successfully.
   - Returns a JWT authentication token after registration.
   - Ensures the password is not included in the response.
   - Rejects duplicate email addresses.
   - Validates required fields (name, email, password).
   - Validates email format.

4. LOGIN ENDPOINT TESTS (POST /api/auth/login)
   - Authenticates users with valid credentials.
   - Returns a JWT token upon successful login.
   - Rejects incorrect passwords.
   - Rejects non-existent email addresses.
   - Validates required login fields.
   - Ensures the password is never returned in the response.

5. CURRENT USER ENDPOINT TESTS (GET /api/auth/me)
   - Retrieves the authenticated user's information.
   - Verifies JWT authentication middleware.
   - Rejects requests without an authentication token.
   - Rejects invalid JWT tokens.
   - Rejects malformed Authorization headers.
   - Ensures sensitive fields (password) are not exposed.

Overall Purpose
---------------
This file performs integration testing for the authentication system,
verifying that user registration, login, JWT authentication, input
validation, authorization middleware, and API responses all function
correctly.

=========================================================================== */
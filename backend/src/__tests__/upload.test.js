import mongoose from 'mongoose';
import dotenv from 'dotenv';
import request from 'supertest';
import path from 'path';
import { fileURLToPath } from 'url';
import app from '../../index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let token;

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

describe('POST /api/upload/avatar', () => {
  it('should upload a valid image and return Cloudinary URL', async () => {
    const res = await request(app)
      .post('/api/upload/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('avatar', path.join(__dirname, 'fixtures', 'test-image.jpg'));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.avatar).toMatch(/^https:\/\/res\.cloudinary\.com/);
  }, 30000);

  it('should reject a non-image file', async () => {
    const res = await request(app)
      .post('/api/upload/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('avatar', path.join(__dirname, 'fixtures', 'test-file.txt'));

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  }, 30000);

  it('should return 401 with no token', async () => {
    const res = await request(app)
      .post('/api/upload/avatar');

    expect(res.statusCode).toBe(401);
  }, 30000);

  it('should return 400 if no file is attached', async () => {
    const res = await request(app)
      .post('/api/upload/avatar')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  }, 30000);
});




/* ==========================================================================

FILE FUNCTIONALITY
==================

This test file verifies the Avatar Upload API endpoint using Supertest,
a MongoDB test database, and test fixture files.

1. DATABASE SETUP
   - Connects to the MongoDB test database before running tests.
   - Uses the MONGO_URI_TEST environment variable.

2. TEST DATA SETUP
   - Registers a new user before each test.
   - Retrieves a valid JWT token for authenticated upload requests.
   - Determines the current directory path to access test fixture files.

3. DATABASE CLEANUP
   - Clears all collections after each test.
   - Drops the test database after all tests complete.

4. AVATAR UPLOAD ENDPOINT TESTS (POST /api/upload/avatar)
   - Successfully uploads a valid image file.
   - Verifies the uploaded image is stored on Cloudinary.
   - Confirms the API returns a valid Cloudinary image URL.
   - Rejects files that are not valid image formats.
   - Returns 400 when no file is provided.
   - Returns 401 when the request is unauthenticated.

5. TEST FIXTURES
   - test-image.jpg
       Used to verify successful image uploads.
   - test-file.txt
       Used to verify file type validation by attempting to upload a
       non-image file.

Overall Purpose
---------------
This file performs integration testing for the avatar upload API,
ensuring file validation, authentication, Cloudinary integration, and
API responses function correctly for both successful and error
scenarios.

=========================================================================== */
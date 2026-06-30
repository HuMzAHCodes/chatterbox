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
  await mongoose.connect(process.env.MONGO_URI_TEST);
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
  await mongoose.connection.close();
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
      .post('/api/upload/avatar')
      .attach('avatar', path.join(__dirname, 'fixtures', 'test-image.jpg'));

    expect(res.statusCode).toBe(401);
  }, 30000);

  it('should return 400 if no file is attached', async () => {
    const res = await request(app)
      .post('/api/upload/avatar')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  }, 30000);
});


/*
===============================================================================
UPLOAD.INTEGRATION.TEST.JS - FUNCTIONALITY SUMMARY
===============================================================================

Purpose
-------
This file contains integration tests for the avatar upload API.

Its purpose is to verify that the complete upload workflow functions correctly,
including:

• User authentication
• Image upload
• Multer middleware
• Cloudinary integration
• MongoDB updates
• API responses

Unlike unit tests, these tests verify that all components involved in the
upload process work together as expected.

===============================================================================
TEST ENVIRONMENT SETUP
===============================================================================

beforeAll()
-----------
Runs once before all tests.

Responsibilities:

• Connect to the test MongoDB database.

-------------------------------------------------------------------------------

beforeEach()
------------
Runs before every individual test.

Responsibilities:

• Register a new test user.
• Retrieve the JWT returned from the registration endpoint.
• Store the token for authenticated upload requests.

Creating a new user for every test ensures that each test runs independently.

-------------------------------------------------------------------------------

afterEach()
-----------
Runs after every test.

Responsibilities:

• Remove all documents from every MongoDB collection.

This guarantees that data created during one test does not affect any other
test.

-------------------------------------------------------------------------------

afterAll()
----------
Runs once after the entire test suite completes.

Responsibilities:

• Drop the test database.
• Close the MongoDB connection.

This cleans up all testing resources.

===============================================================================
TEST SUITE
===============================================================================

POST /api/upload/avatar
------------------------

This suite tests the avatar upload endpoint under different scenarios.

Test Case 1:
-------------
Uploads a valid image.

Verifies that:

✓ The request succeeds.
✓ HTTP status code is 200.
✓ Success is true.
✓ A valid Cloudinary URL is returned.

-------------------------------------------------------------------------------

Test Case 2:
-------------
Uploads a non-image file.

Verifies that:

✓ The request is rejected.
✓ HTTP status code is 400.
✓ Success is false.

This confirms that the upload middleware correctly validates file types.

-------------------------------------------------------------------------------

Test Case 3:
-------------
Attempts an upload without authentication.

Verifies that:

✓ HTTP status code is 401 (Unauthorized).

This confirms that only authenticated users can upload avatars.

-------------------------------------------------------------------------------

Test Case 4:
-------------
Sends an authenticated request without attaching a file.

Verifies that:

✓ HTTP status code is 400.

This confirms that the API requires an image file before processing the
request.

===============================================================================
OVERALL RESPONSIBILITY
===============================================================================

This file performs end-to-end integration testing for the avatar upload
feature.

It verifies that:

✓ Authentication protects the upload endpoint.
✓ Valid image files are accepted.
✓ Invalid file types are rejected.
✓ Missing authentication is handled correctly.
✓ Missing uploads produce appropriate errors.
✓ Images are successfully uploaded to Cloudinary.
✓ The API returns the expected response after a successful upload.

By testing the complete request flow—from the client request through
authentication, upload middleware, Cloudinary, database interaction, and API
response—this file helps ensure that the avatar upload feature works reliably
in a production-like environment.
===============================================================================
*/
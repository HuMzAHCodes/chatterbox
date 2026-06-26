import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to test DB before all tests
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
});

// Clean up all collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Disconnect after all tests are done
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
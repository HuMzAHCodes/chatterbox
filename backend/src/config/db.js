import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.NODE_ENV === 'test'
    ? process.env.MONGO_URI_TEST
    : process.env.MONGO_URI;

  const conn = await mongoose.connect(uri);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

export default connectDB;

/*
===========================================
Functionality of this File
===========================================

1. Imports the Mongoose library to communicate with MongoDB.

2. Defines an asynchronous function (connectDB) that establishes a
   connection to the MongoDB database.

3. Checks the current environment:
   - If NODE_ENV is "test", it uses the test database URI
     (MONGO_URI_TEST).
   - Otherwise, it uses the main database URI (MONGO_URI).

4. Uses mongoose.connect() to connect to the selected MongoDB database.

5. After a successful connection, it logs the MongoDB host to confirm
   that the database is connected.

6. Exports the connectDB function so it can be imported and called
   from the application's entry point (e.g., app.js or server.js).

*/
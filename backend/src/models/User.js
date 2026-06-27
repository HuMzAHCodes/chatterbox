import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for fast login lookup
userSchema.index({ email: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;

/*
==================================================
Functionality of this File
==================================================

1. Imports:
   - mongoose: Used to create the schema and interact with MongoDB.
   - bcryptjs: Used to hash passwords and compare hashed passwords.

2. Creates a User Schema that defines the structure of each user
   document stored in the MongoDB database.

3. User fields:
   - name: User's full name with validation.
   - email: Unique email address with format validation.
   - password: Stores the hashed password (hidden by default).
   - avatar: Stores the user's profile image URL/path.
   - isOnline: Indicates whether the user is currently online.
   - lastSeen: Stores the last active timestamp.

4. Enables timestamps:
   - createdAt: Automatically records when the user is created.
   - updatedAt: Automatically updates whenever the document changes.

5. Creates an index on the email field to speed up login and
   email-based searches.

6. Uses a pre('save') middleware:
   - Runs before a user document is saved.
   - Checks if the password has been modified.
   - Generates a salt using bcrypt.
   - Hashes the password before storing it in the database.
   - Prevents already-hashed passwords from being hashed again.

7. Defines a custom instance method (matchPassword):
   - Compares the user's entered password with the stored hashed
     password.
   - Returns true if they match; otherwise returns false.
   - Used during user authentication (login).

8. Creates a User model from the schema.

9. Exports the User model so it can be imported and used throughout
   the application for creating, reading, updating, and deleting
   user documents.

*/
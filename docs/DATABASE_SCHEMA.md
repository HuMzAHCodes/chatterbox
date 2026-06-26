# DATABASE_SCHEMA.md

> **Purpose:** Complete MongoDB/Mongoose schema definitions for every model in the project. Includes full code, field-by-field explanation, relationships between models, and indexing decisions. Any AI tool reading this should be able to write queries, create documents, and understand populate() calls without guessing.

---

## 1. Overview — Models & Relationships

```
User ──────────────────────────────────────────────────────┐
  │                                                         │
  │  A User creates many Rooms                              │
  │  A User participates in many Rooms                      │
  │  A User sends many Messages                             │
  ▼                                                         │
Room ──────────────────────────────────────────────────────┤
  │                                                         │
  │  A Room has many Messages                               │
  │  A Room has many participants (Users)                   │
  ▼                                                         │
Message                                                     │
       sender    → ref: User  ──────────────────────────────┘
       room      → ref: Room
```

**Relationship summary:**
| From    | To      | Type       | Field              |
|---------|---------|------------|--------------------|
| Room    | User    | Many-to-Many | participants: [ref User] |
| Room    | User    | Many-to-One  | createdBy: ref User |
| Message | User    | Many-to-One  | sender: ref User   |
| Message | Room    | Many-to-One  | room: ref Room     |

---

## 2. User Model

**File:** `src/models/User.js`

```javascript
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
      select: false,        // ← never returned in queries by default
    },

    avatar: {
      type: String,
      default: '',          // ← Cloudinary URL, empty string if not set
    },

    isOnline: {
      type: Boolean,
      default: false,       // ← toggled by Socket.io connect/disconnect
    },

    lastSeen: {
      type: Date,
      default: Date.now,    // ← updated on socket disconnect
    },
  },
  {
    timestamps: true,       // ← adds createdAt, updatedAt automatically
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });   // fast lookup on login

// ── Pre-save hook: hash password before saving ─────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();  // only hash if changed
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare entered password with hashed ──────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
```

### Field reference

| Field      | Type    | Required | Notes                                        |
|------------|---------|----------|----------------------------------------------|
| name       | String  | Yes      | 2–50 chars, trimmed                          |
| email      | String  | Yes      | unique, lowercased, validated format         |
| password   | String  | Yes      | min 6 chars, `select: false` (hidden by default) |
| avatar     | String  | No       | Cloudinary URL, defaults to empty string     |
| isOnline   | Boolean | No       | managed by Socket.io, default false          |
| lastSeen   | Date    | No       | updated on disconnect                        |
| createdAt  | Date    | auto     | added by timestamps: true                    |
| updatedAt  | Date    | auto     | added by timestamps: true                    |

### Important notes
- `password` has `select: false` — to get it in a query you must explicitly do `.select('+password')`
- `matchPassword()` is called in `authController.js` during login
- The pre-save hook only runs on `save()` — not on `findOneAndUpdate()`. Never update passwords with `findOneAndUpdate`.

---

## 3. Room Model

**File:** `src/models/Room.js`

```javascript
import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      minlength: [2, 'Room name must be at least 2 characters'],
      maxlength: [50, 'Room name cannot exceed 50 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },

    isPrivate: {
      type: Boolean,
      default: false,       // ← false = public room, true = invite-only
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,       // ← every room must have an owner
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',        // ← array of User ObjectIds
      },
    ],

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,        // ← updated whenever a new message is sent
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
roomSchema.index({ participants: 1 });   // fast lookup: rooms for a given user
roomSchema.index({ createdBy: 1 });      // fast lookup: rooms created by a user

const Room = mongoose.model('Room', roomSchema);
export default Room;
```

### Field reference

| Field        | Type       | Required | Notes                                          |
|--------------|------------|----------|------------------------------------------------|
| name         | String     | Yes      | 2–50 chars                                     |
| description  | String     | No       | max 200 chars, defaults to empty               |
| isPrivate    | Boolean    | No       | default false (public)                         |
| createdBy    | ObjectId   | Yes      | ref: User — the room creator                   |
| participants | [ObjectId] | No       | ref: User — array, includes creator            |
| lastMessage  | ObjectId   | No       | ref: Message — updated on new message          |
| createdAt    | Date       | auto     | timestamps                                     |
| updatedAt    | Date       | auto     | timestamps                                     |

### Important notes
- When a room is created, the creator should be automatically added to `participants`
- `lastMessage` is used on the frontend to show a preview in the room list — update it in `messageHandler.js` after every new message
- To fetch all rooms a user belongs to: `Room.find({ participants: userId })`

---

## 4. Message Model

**File:** `src/models/Message.js`

```javascript
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },

    messageType: {
      type: String,
      enum: ['text', 'image'],
      default: 'text',      // ← reserved for future image messages
    },

    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',        // ← users who have seen this message (future feature)
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
messageSchema.index({ room: 1, createdAt: -1 });
// ↑ Most important index: fetch messages for a room, sorted newest first
// This is the query pattern used in getMessages controller

const Message = mongoose.model('Message', messageSchema);
export default Message;
```

### Field reference

| Field       | Type       | Required | Notes                                         |
|-------------|------------|----------|-----------------------------------------------|
| content     | String     | Yes      | max 2000 chars                                |
| sender      | ObjectId   | Yes      | ref: User                                     |
| room        | ObjectId   | Yes      | ref: Room                                     |
| messageType | String     | No       | enum: text/image, default text                |
| readBy      | [ObjectId] | No       | ref: User, for read receipts (v2 feature)     |
| createdAt   | Date       | auto     | timestamps — used for ordering messages       |
| updatedAt   | Date       | auto     | timestamps                                    |

### Important notes
- Messages are **created via Socket.io** (`messageHandler.js`), not via a REST POST endpoint
- They are **fetched via REST** (`GET /api/messages/:roomId`) for initial load and pagination
- The compound index `{ room: 1, createdAt: -1 }` is critical — without it, fetching messages for a busy room does a full collection scan

---

## 5. Common Query Patterns

These are the exact queries used in controllers and handlers. Copy these patterns when writing new code.

### Get all rooms for a user (with last message preview)
```javascript
const rooms = await Room.find({ participants: req.user._id })
  .populate('participants', 'name avatar isOnline')
  .populate('lastMessage', 'content createdAt')
  .populate('createdBy', 'name')
  .sort({ updatedAt: -1 });
```

### Get paginated messages for a room
```javascript
const page  = parseInt(req.query.page)  || 1;
const limit = parseInt(req.query.limit) || 20;
const skip  = (page - 1) * limit;

const messages = await Message.find({ room: roomId })
  .populate('sender', 'name avatar')
  .sort({ createdAt: -1 })     // newest first
  .skip(skip)
  .limit(limit);

// Reverse on frontend so oldest appears at top of chat window
```

### Create a message (in Socket.io handler)
```javascript
const message = await Message.create({
  content,
  sender: socket.user._id,
  room: roomId,
});

// Update room's lastMessage
await Room.findByIdAndUpdate(roomId, { lastMessage: message._id });

// Populate before emitting to clients
const populated = await message.populate('sender', 'name avatar');
io.to(roomId).emit('new-message', populated);
```

### Register a new user
```javascript
const user = await User.create({ name, email, password });
// password is auto-hashed by the pre-save hook
```

### Login — get user with password field
```javascript
const user = await User.findOne({ email }).select('+password');
// select('+password') overrides the select: false on the field
const isMatch = await user.matchPassword(enteredPassword);
```

---

## 6. What populate() Does

`populate()` replaces an ObjectId reference with the actual document from the referenced collection.

```javascript
// Without populate — what MongoDB stores:
{
  _id: "msg123",
  content: "Hello!",
  sender: "64abc123..."    ← just an ObjectId string
}

// With .populate('sender', 'name avatar') — what you get back:
{
  _id: "msg123",
  content: "Hello!",
  sender: {
    _id: "64abc123...",
    name: "Ali",
    avatar: "https://cloudinary.com/..."
  }
}
```

The second argument `'name avatar'` is a field selector — only those fields are included. Always specify it to avoid over-fetching.

---

*Last updated: Day 2. Do not modify schema field names without also updating API_REFERENCE.md and any controller that references those fields.*

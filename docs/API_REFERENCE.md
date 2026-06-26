# API_REFERENCE.md

> **Purpose:** Complete reference for every REST API endpoint. Includes method, path, auth requirement, request body, success response, and all possible error responses. Any AI tool reading this should be able to write a controller, write a test, or consume the API from the frontend without guessing any field names or status codes.

---

## Conventions

- Base URL (dev): `http://localhost:5000`
- Base URL (prod): `https://your-app.railway.app`
- All request bodies: `Content-Type: application/json`
- Protected routes require header: `Authorization: Bearer <token>`
- All responses follow this envelope:

```json
// Success
{ "success": true, "data": { ... } }

// Success with pagination
{ "success": true, "count": 20, "page": 1, "totalPages": 5, "data": [ ... ] }

// Error
{ "success": false, "message": "Human-readable error description" }
```

---

## AUTH ROUTES — `/api/auth`

---

### POST `/api/auth/register`

Register a new user account.

**Auth required:** No

**Request body:**
```json
{
  "name": "Ali Hassan",
  "email": "ali@example.com",
  "password": "secret123"
}
```

**Field rules:**
| Field    | Type   | Required | Validation                  |
|----------|--------|----------|-----------------------------|
| name     | String | Yes      | 2–50 characters             |
| email    | String | Yes      | valid email format, unique  |
| password | String | Yes      | minimum 6 characters        |

**Success response — `201 Created`:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "64abc123...",
      "name": "Ali Hassan",
      "email": "ali@example.com",
      "avatar": "",
      "isOnline": false,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

**Error responses:**
| Status | Message                              | Cause                        |
|--------|--------------------------------------|------------------------------|
| 400    | "Name is required"                   | name field missing           |
| 400    | "Please provide a valid email"       | bad email format             |
| 400    | "Password must be at least 6 characters" | password too short        |
| 400    | "Email already in use"               | duplicate email in DB        |
| 500    | "Server error"                       | unexpected server failure    |

---

### POST `/api/auth/login`

Log in with email and password. Returns a JWT token.

**Auth required:** No

**Request body:**
```json
{
  "email": "ali@example.com",
  "password": "secret123"
}
```

**Success response — `200 OK`:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "64abc123...",
      "name": "Ali Hassan",
      "email": "ali@example.com",
      "avatar": "",
      "isOnline": false,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

**Error responses:**
| Status | Message                        | Cause                              |
|--------|--------------------------------|------------------------------------|
| 400    | "Please provide email and password" | missing fields                |
| 401    | "Invalid credentials"          | wrong email or wrong password      |
| 500    | "Server error"                 | unexpected server failure          |

---

### GET `/api/auth/me`

Get the currently logged-in user's profile.

**Auth required:** Yes

**Request body:** None

**Success response — `200 OK`:**
```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "name": "Ali Hassan",
    "email": "ali@example.com",
    "avatar": "",
    "isOnline": true,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Error responses:**
| Status | Message                  | Cause                            |
|--------|--------------------------|----------------------------------|
| 401    | "No token provided"      | Authorization header missing     |
| 401    | "Token is invalid"       | JWT verification failed          |
| 401    | "Token expired"          | JWT past expiry date             |
| 404    | "User not found"         | user deleted after token issued  |

---

## ROOM ROUTES — `/api/rooms`

---

### POST `/api/rooms`

Create a new chat room. Creator is automatically added to participants.

**Auth required:** Yes

**Request body:**
```json
{
  "name": "General",
  "description": "General discussion room",
  "isPrivate": false
}
```

**Field rules:**
| Field       | Type    | Required | Validation           |
|-------------|---------|----------|----------------------|
| name        | String  | Yes      | 2–50 characters      |
| description | String  | No       | max 200 characters   |
| isPrivate   | Boolean | No       | default: false       |

**Success response — `201 Created`:**
```json
{
  "success": true,
  "data": {
    "_id": "64def456...",
    "name": "General",
    "description": "General discussion room",
    "isPrivate": false,
    "createdBy": {
      "_id": "64abc123...",
      "name": "Ali Hassan",
      "avatar": ""
    },
    "participants": [
      {
        "_id": "64abc123...",
        "name": "Ali Hassan",
        "avatar": "",
        "isOnline": true
      }
    ],
    "lastMessage": null,
    "createdAt": "2024-01-15T10:05:00.000Z"
  }
}
```

**Error responses:**
| Status | Message                          | Cause                      |
|--------|----------------------------------|----------------------------|
| 400    | "Room name is required"          | name field missing         |
| 400    | "Name must be at least 2 characters" | name too short         |
| 401    | "No token provided"              | missing auth header        |
| 500    | "Server error"                   | unexpected failure         |

---

### GET `/api/rooms`

Get all rooms the authenticated user is a participant of.

**Auth required:** Yes

**Query params:** None

**Success response — `200 OK`:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64def456...",
      "name": "General",
      "description": "General discussion room",
      "isPrivate": false,
      "createdBy": { "_id": "...", "name": "Ali Hassan" },
      "participants": [
        { "_id": "...", "name": "Ali Hassan", "avatar": "", "isOnline": true }
      ],
      "lastMessage": {
        "_id": "...",
        "content": "Hey everyone!",
        "createdAt": "2024-01-15T11:00:00.000Z"
      },
      "createdAt": "2024-01-15T10:05:00.000Z"
    }
  ]
}
```

**Error responses:**
| Status | Message             | Cause                    |
|--------|---------------------|--------------------------|
| 401    | "No token provided" | missing auth header      |
| 401    | "Token is invalid"  | JWT verification failed  |

---

### GET `/api/rooms/:id`

Get a single room by ID. User must be a participant.

**Auth required:** Yes

**URL param:** `:id` — the room's MongoDB `_id`

**Success response — `200 OK`:**
```json
{
  "success": true,
  "data": {
    "_id": "64def456...",
    "name": "General",
    "description": "General discussion room",
    "isPrivate": false,
    "createdBy": { "_id": "...", "name": "Ali Hassan", "avatar": "" },
    "participants": [
      { "_id": "...", "name": "Ali Hassan", "avatar": "", "isOnline": true },
      { "_id": "...", "name": "Sara Ahmed", "avatar": "", "isOnline": false }
    ],
    "lastMessage": { "_id": "...", "content": "Hey!", "createdAt": "..." },
    "createdAt": "2024-01-15T10:05:00.000Z"
  }
}
```

**Error responses:**
| Status | Message                          | Cause                              |
|--------|----------------------------------|------------------------------------|
| 401    | "No token provided"              | missing auth header                |
| 403    | "Not authorized to access this room" | user not in participants list  |
| 404    | "Room not found"                 | invalid or non-existent room ID    |

---

## MESSAGE ROUTES — `/api/messages`

> Messages are **created** via Socket.io (`send-message` event).
> Messages are **fetched** via REST (this endpoint) for initial load and pagination.

---

### GET `/api/messages/:roomId`

Get paginated message history for a room. Returns newest messages first — reverse on frontend for display.

**Auth required:** Yes

**URL param:** `:roomId` — the room's MongoDB `_id`

**Query params:**
| Param | Type   | Default | Description                    |
|-------|--------|---------|--------------------------------|
| page  | Number | 1       | page number                    |
| limit | Number | 20      | messages per page (max: 50)    |

**Example:** `GET /api/messages/64def456?page=1&limit=20`

**Success response — `200 OK`:**
```json
{
  "success": true,
  "count": 20,
  "page": 1,
  "totalPages": 4,
  "data": [
    {
      "_id": "64ghi789...",
      "content": "Hey everyone!",
      "messageType": "text",
      "sender": {
        "_id": "64abc123...",
        "name": "Ali Hassan",
        "avatar": ""
      },
      "room": "64def456...",
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

**Error responses:**
| Status | Message                              | Cause                              |
|--------|--------------------------------------|------------------------------------|
| 401    | "No token provided"                  | missing auth header                |
| 403    | "Not authorized to access this room" | user not in participants           |
| 404    | "Room not found"                     | invalid room ID                    |

---

## UPLOAD ROUTES — `/api/upload`

---

### POST `/api/upload/avatar`

Upload a user avatar image. Saves to Cloudinary and updates the user's `avatar` field.

**Auth required:** Yes

**Request type:** `multipart/form-data` (not JSON)

**Form field:**
| Field  | Type | Required | Notes                              |
|--------|------|----------|------------------------------------|
| avatar | File | Yes      | jpg/png/webp only, max 2MB         |

**Success response — `200 OK`:**
```json
{
  "success": true,
  "data": {
    "avatar": "https://res.cloudinary.com/your-cloud/image/upload/v123/avatars/64abc123.jpg"
  }
}
```

**Error responses:**
| Status | Message                        | Cause                          |
|--------|--------------------------------|--------------------------------|
| 400    | "Please upload an image file"  | non-image file type            |
| 400    | "File size cannot exceed 2MB"  | file too large                 |
| 401    | "No token provided"            | missing auth header            |
| 500    | "Image upload failed"          | Cloudinary error               |

---

## Socket.io Events Reference

> Full flow is in `ARCHITECTURE.md`. This is the quick field reference for what each event sends and receives.

### Events the CLIENT emits (sends to server)

| Event         | Payload                          | Description                    |
|---------------|----------------------------------|--------------------------------|
| `join-room`   | `{ roomId: String }`             | Join a Socket.io room          |
| `leave-room`  | `{ roomId: String }`             | Leave a Socket.io room         |
| `send-message`| `{ roomId: String, content: String }` | Send a message            |
| `typing`      | `{ roomId: String }`             | Notify others user is typing   |
| `stop-typing` | `{ roomId: String }`             | Notify others user stopped     |

### Events the SERVER emits (sends to client)

| Event            | Payload                                              | Sent to          |
|------------------|------------------------------------------------------|------------------|
| `joined-room`    | `{ roomId: String }`                                 | sender only      |
| `user-joined`    | `{ userId, username }`                               | whole room       |
| `user-left`      | `{ userId, username }`                               | whole room       |
| `new-message`    | `{ _id, content, sender: {_id, name, avatar}, room, createdAt }` | whole room |
| `user-typing`    | `{ userId, username }`                               | room except sender |
| `user-stop-typing`| `{ userId }`                                        | room except sender |
| `user-online`    | `{ userId }`                                         | all connected    |
| `user-offline`   | `{ userId }`                                         | all connected    |
| `error`          | `{ message: String }`                                | sender only      |

---

## HTTP Status Codes Used

| Code | Meaning               | When used                                      |
|------|-----------------------|------------------------------------------------|
| 200  | OK                    | successful GET, successful login               |
| 201  | Created               | successful POST (register, create room)        |
| 400  | Bad Request           | validation error, missing fields               |
| 401  | Unauthorized          | missing/invalid/expired token                  |
| 403  | Forbidden             | valid token but no permission                  |
| 404  | Not Found             | resource does not exist                        |
| 429  | Too Many Requests     | rate limit exceeded                            |
| 500  | Internal Server Error | unexpected server crash                        |

---

*Last updated: Day 1. Update this file immediately whenever an endpoint is added, removed, or any field name changes. The frontend and tests depend on this contract.*

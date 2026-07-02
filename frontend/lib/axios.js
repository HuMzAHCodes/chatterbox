import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If token expires, redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

/*
===============================================================================
                               FILE FLOW
===============================================================================

This file creates a custom Axios instance that is used throughout the application
to communicate with the backend API. Instead of importing Axios directly in every
component, we import this configured instance.

1. Axios Instance Creation
--------------------------
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

- Creates a reusable Axios client.
- Every request automatically starts with the given base URL.
- Example:

    api.get('/users')

becomes

    GET http://localhost:5000/users

(if NEXT_PUBLIC_API_URL=http://localhost:5000)

-------------------------------------------------------------------------------

2. Request Interceptor
----------------------
Before EVERY request is sent, this interceptor runs.

Steps:
    Request starts
          ↓
    Read JWT token from localStorage
          ↓
    Token exists?
       ├── Yes → Add
       │         Authorization: Bearer <token>
       │
       └── No → Send request normally
          ↓
    Request reaches backend

This means we never have to manually attach the token in every API call.

Without this interceptor we'd have to write:

    axios.get('/profile', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

for every protected request.

-------------------------------------------------------------------------------

3. Response Interceptor
-----------------------
After the server responds, this interceptor runs.

Successful response (200, 201, etc.)

        Server
          ↓
     Response
          ↓
    return response

Nothing special happens.

-------------------------------------------------------------------------------

4. Handling Expired Tokens
--------------------------
If the backend returns:

    401 Unauthorized

it usually means:

- JWT has expired
- JWT is invalid
- User is no longer authenticated

The interceptor then:

1. Removes the stored token

    localStorage.removeItem('token')

2. Redirects the user

    window.location.href = '/login'

This forces the user to log in again.

-------------------------------------------------------------------------------

5. Returning Other Errors
-------------------------
For every error (including 401 after handling), we do:

    return Promise.reject(error);

This passes the error back to the component that made the request, allowing it
to display messages such as:

- "Email already exists"
- "Room not found"
- "Server error"

-------------------------------------------------------------------------------

Overall Request Lifecycle
-------------------------

Component
    │
    ▼
api.get('/rooms')
    │
    ▼
Request Interceptor
    │
    ├── Read token
    ├── Add Authorization header
    ▼
Backend API
    │
    ▼
Response
    │
    ▼
Response Interceptor
    │
    ├── Success?
    │      │
    │      └── Return response
    │
    └── 401 Unauthorized?
           │
           ├── Remove token
           ├── Redirect to /login
           └── Reject Promise

===============================================================================

Purpose of this file:
- Centralizes API configuration.
- Automatically attaches JWT tokens.
- Handles expired authentication globally.
- Keeps components clean by removing repetitive authentication code.
- Provides one reusable Axios client for the entire application.

===============================================================================
*/
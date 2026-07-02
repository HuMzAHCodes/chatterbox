'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/axios.js';
import { connectSocket, disconnectSocket } from '../lib/socket.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/api/auth/me')
        .then((res) => {
          setUser(res.data.data);
          connectSocket(token);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token, user } = res.data.data;
    localStorage.setItem('token', token);
    setUser(user);
    connectSocket(token);
    router.push('/rooms');
  };

  const register = async (name, email, password) => {
    const res = await api.post('/api/auth/register', { name, email, password });
    const { token, user } = res.data.data;
    localStorage.setItem('token', token);
    setUser(user);
    connectSocket(token);
    router.push('/rooms');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    disconnectSocket();
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;






/*
===============================================================================
                          AUTH CONTEXT FLOW
===============================================================================

This file creates and manages the application's authentication state using
React Context.

Instead of every component managing its own authentication logic, the
AuthProvider stores the authenticated user in one central place and provides
helper functions like:

- login()
- register()
- logout()

Any component inside the AuthProvider can access these values by calling:

    const { user, login, logout } = useAuth();

===============================================================================

1. Creating the Context
-----------------------

const AuthContext = createContext(null);

A React Context acts like a global storage for authentication data.

Without Context:

Component A
    │
    ▼
Pass props
    │
    ▼
Component B
    │
    ▼
Pass props
    │
    ▼
Component C

With Context:

            AuthContext
                 │
        ┌────────┴────────┐
        ▼                 ▼
 Component A        Component B
        │                 │
        ▼                 ▼
            Component C

No prop drilling is needed.

===============================================================================

2. AuthProvider
---------------

<AuthProvider>

This component wraps the entire application.

Example:

<App>
    └── AuthProvider
            ├── Navbar
            ├── Rooms
            ├── Chat
            └── Profile

Every child component can access authentication information.

===============================================================================

3. State Variables
------------------

user

Stores the currently authenticated user.

Initially:

    user = null

After login:

    user = {
        _id,
        name,
        email,
        ...
    }

------------------------------------------------

loading

Used while checking whether the user is already logged in.

Initially:

    loading = true

Once authentication is checked:

    loading = false

This prevents rendering protected pages before authentication finishes.

===============================================================================

4. Checking Existing Login (useEffect)
--------------------------------------

This effect runs ONLY once when the application starts.

Flow:

Application loads
        │
        ▼
Read token from localStorage
        │
        ▼
Token exists?
        │
        ├── No
        │      │
        │      ▼
        │ loading = false
        │
        └── Yes
               │
               ▼
GET /api/auth/me
               │
               ▼
Backend verifies JWT
               │
       ┌───────┴────────┐
       ▼                ▼
Valid Token      Invalid Token
       │                │
       ▼                ▼
setUser()      Remove token
connectSocket()
       │
       ▼
loading = false

Purpose:

- Keeps users logged in after refreshing the page.
- Restores the authenticated user automatically.
- Opens the socket connection only after successful authentication.

===============================================================================

5. login()
----------

Purpose:

Authenticates an existing user.

Flow:

User submits login form
        │
        ▼
POST /api/auth/login
        │
        ▼
Backend validates credentials
        │
        ▼
Returns:

- JWT token
- User object

        │
        ▼
Save token in localStorage
        │
        ▼
setUser(user)
        │
        ▼
connectSocket(token)
        │
        ▼
Navigate to:

    /rooms

After this, the entire application knows the user is logged in.

===============================================================================

6. register()
-------------

Purpose:

Creates a new account.

Flow:

User submits registration form
        │
        ▼
POST /api/auth/register
        │
        ▼
Backend creates user
        │
        ▼
Returns:

- JWT
- User

        │
        ▼
Save token
        │
        ▼
setUser()
        │
        ▼
Connect Socket
        │
        ▼
Redirect to /rooms

The new user is automatically logged in immediately after registration.

===============================================================================

7. logout()
-----------

Purpose:

Logs the user out completely.

Flow:

logout()
      │
      ▼
Remove token
      │
      ▼
setUser(null)
      │
      ▼
Disconnect socket
      │
      ▼
Redirect to:

    /login

After logout:

- No JWT exists.
- User state becomes null.
- Real-time connection closes.
- Protected pages become inaccessible.

===============================================================================

8. Providing Context
--------------------

<AuthContext.Provider
    value={{
        user,
        loading,
        login,
        register,
        logout
    }}
>

This makes these values available to every child component.

Any component can simply write:

    const {
        user,
        loading,
        login,
        register,
        logout
    } = useAuth();

instead of passing props through multiple component levels.

===============================================================================

9. useAuth()
------------

This is a custom React Hook.

Instead of writing:

    const context = useContext(AuthContext);

every time, components simply use:

    const auth = useAuth();

Safety check:

If a component tries to use useAuth() outside of an AuthProvider,
an error is thrown:

    "useAuth must be used within an AuthProvider"

This helps catch incorrect usage during development.

===============================================================================

Overall Authentication Lifecycle
--------------------------------

Application Starts
        │
        ▼
<AuthProvider>
        │
        ▼
Check localStorage
        │
        ▼
Token exists?
        │
   ┌────┴────┐
   ▼         ▼
 No          Yes
 │            │
 ▼            ▼
Guest   Verify JWT (/me)
              │
      ┌───────┴────────┐
      ▼                ▼
   Valid            Invalid
      │                │
      ▼                ▼
 setUser()      Remove token
 Connect Socket
      │
      ▼
Application Ready
      │
      ▼
User uses app
      │
      ▼
Logout
      │
      ▼
Remove token
      │
      ▼
Disconnect Socket
      │
      ▼
Redirect to Login

===============================================================================

Purpose of this file:
- Stores authentication state globally using React Context.
- Restores user sessions after page refresh.
- Provides login, registration, and logout functionality.
- Automatically connects/disconnects the Socket.IO client.
- Makes authentication data available throughout the application.
- Eliminates prop drilling by providing a centralized authentication system.

===============================================================================
*/
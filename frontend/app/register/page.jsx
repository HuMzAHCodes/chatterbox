'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import Link from 'next/link';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Join ChatterBox</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ali Hassan"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ali@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}




/*
===============================================================================
                           REGISTER PAGE FLOW
===============================================================================

This file implements the user registration page of the ChatterBox application.

Its responsibility is to:

- Display the registration form.
- Collect the user's name, email, and password.
- Send the registration data to AuthContext.
- Display validation or registration errors.
- Show a loading state while the registration request is being processed.

This page only handles the user interface. The actual registration,
authentication, token storage, and redirection are handled by AuthContext.

===============================================================================

1. Client Component
-------------------

'use client';

This page uses React Hooks such as:

- useState()
- useAuth()

Since React Hooks only work inside Client Components, the "use client"
directive is required.

===============================================================================

2. useAuth()
------------

const { register } = useAuth();

The register() function comes from AuthContext.

This component does not directly communicate with the backend API.

Instead, the registration flow is:

Register Page
      │
      ▼
register(name, email, password)
      │
      ▼
AuthContext
      │
      ▼
Axios
      │
      ▼
Backend API
      │
      ▼
Response

Centralizing the authentication logic inside AuthContext keeps this page clean
and allows registration to be managed consistently throughout the application.

===============================================================================

3. Component State
------------------

name

Stores the user's full name.

Example:

    Ali Hassan

------------------------------------------------

email

Stores the user's email address.

Example:

    ali@example.com

------------------------------------------------

password

Stores the user's password.

Example:

    ********

------------------------------------------------

error

Stores any error message returned by the backend.

Examples:

- Email already exists
- Invalid email format
- Password is too short

If empty, no error message is displayed.

------------------------------------------------

loading

Tracks whether a registration request is currently running.

false
    Register button is enabled.

true
    Register button is disabled and displays:

        Creating account...

This prevents multiple registration requests.

===============================================================================

4. Form Submission
------------------

When the Register button is clicked, handleSubmit() executes.

Flow:

User clicks Register
        │
        ▼
Prevent browser refresh

e.preventDefault()

        │
        ▼
Clear previous errors

setError('')

        │
        ▼
Enable loading

setLoading(true)

        │
        ▼
Call register(name, email, password)
        │
        ▼
AuthContext sends request
        │
        ▼
Backend validates user information
        │
   ┌────┴─────┐
   ▼          ▼
Success     Failure
   │           │
   ▼           ▼
Redirect    Display Error
to /rooms

        │
        ▼
Disable loading

setLoading(false)

===============================================================================

5. Error Handling
-----------------

If the registration request fails:

catch (err)

the page attempts to display the backend's error message.

Example:

err.response.data.message

Possible errors include:

- Email already exists
- Validation failed
- Invalid input

If no backend message is available, the page displays:

    "Registration failed"

===============================================================================

6. Controlled Inputs
--------------------

Each input field is controlled by React state.

Example:

value={email}

onChange={(e) => setEmail(e.target.value)}

Typing flow:

User types
      │
      ▼
onChange()
      │
      ▼
Update State
      │
      ▼
React re-renders input

This ensures that the UI and component state remain synchronized.

===============================================================================

7. Register Button
------------------

The Register button changes depending on the loading state.

loading = false

Button displays:

    Register

------------------------------------------------

loading = true

Button displays:

    Creating account...

and becomes disabled.

This prevents duplicate registration requests while waiting for the server.

===============================================================================

8. Login Link
-------------

If the user already has an account, they can navigate to the login page.

Clicking:

    Login

takes the user to:

    /login

using Next.js client-side routing without refreshing the page.

===============================================================================

Overall Registration Flow
-------------------------

User Opens Register Page
        │
        ▼
Enter Name
        │
        ▼
Enter Email
        │
        ▼
Enter Password
        │
        ▼
Click Register
        │
        ▼
handleSubmit()
        │
        ▼
Clear Errors
        │
        ▼
Enable Loading
        │
        ▼
Call AuthContext.register()
        │
        ▼
Backend Creates Account
        │
   ┌────┴─────┐
   ▼          ▼
Success     Failure
   │           │
   ▼           ▼
Redirect    Show Error
to /rooms

        │
        ▼
Disable Loading

===============================================================================

Purpose of this file:
- Displays the user registration interface.
- Collects the user's name, email, and password.
- Delegates registration logic to AuthContext.
- Displays backend validation errors.
- Prevents duplicate submissions with a loading state.
- Automatically redirects newly registered users after successful account
  creation (handled by AuthContext).

===============================================================================
*/
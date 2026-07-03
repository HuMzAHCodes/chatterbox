'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRouter } from 'next/navigation';
import api from '../../lib/axios.js';
import Link from 'next/link';

export default function RoomsPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user]);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/api/rooms');
      setRooms(res.data.data);
    } catch (err) {
      setError('Failed to load rooms');
    }
  };

  const createRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/api/rooms', { name: roomName });
      setRooms((prev) => [res.data.data, ...prev]);
      setRoomName('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">ChatterBox</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">👋 {user.name}</span>
          <button
            onClick={logout}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">

        {/* Create Room */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Create a Room</h2>
          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={createRoom} className="flex gap-2">
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Room name..."
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={creating}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? '...' : 'Create'}
            </button>
          </form>
        </div>

        {/* Rooms List */}
        <div className="bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold p-4 border-b">Your Rooms</h2>
          {rooms.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No rooms yet. Create one above!
            </div>
          ) : (
            <ul>
              {rooms.map((room) => (
                <li key={room._id} className="border-b last:border-0">
                  <Link
                    href={`/rooms/${room._id}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
                  >
                    <div>
                      <p className="font-medium">{room.name}</p>
                      <p className="text-sm text-gray-500">
                        {room.lastMessage
                          ? room.lastMessage.content
                          : 'No messages yet'}
                      </p>
                    </div>
                    <span className="text-gray-400 text-sm">
                      {room.participants.length} member{room.participants.length !== 1 ? 's' : ''}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}





/*
===============================================================================
                             ROOMS PAGE FLOW
===============================================================================

This file implements the Rooms page of the ChatterBox application.

It is the first page a user sees after successfully logging in.

Responsibilities:

- Ensure only authenticated users can access the page.
- Fetch all chat rooms from the backend.
- Allow users to create new chat rooms.
- Display all available rooms.
- Allow navigation to individual chat rooms.
- Allow the user to log out.

===============================================================================

1. Client Component
-------------------

'use client';

This page uses React Hooks such as:

- useState()
- useEffect()
- useAuth()
- useRouter()

Therefore it must be rendered as a Client Component.

===============================================================================

2. Authentication
-----------------

const { user, logout, loading } = useAuth();

The authentication context provides:

user
    Currently authenticated user.

loading
    Indicates whether authentication is still being verified.

logout()
    Removes authentication and redirects the user to the login page.

===============================================================================

3. Component State
------------------

rooms

Stores every chat room returned from the backend.

Example:

[
    {
        _id: "...",
        name: "General",
        participants: [...]
    },
    ...
]

------------------------------------------------

roomName

Stores the name entered into the "Create Room" input.

------------------------------------------------

creating

Tracks whether a room is currently being created.

false
    Create button is enabled.

true
    Create button becomes disabled.

------------------------------------------------

error

Stores any error message displayed to the user.

Examples:

- Failed to load rooms
- Failed to create room

===============================================================================

4. Authentication Guard
-----------------------

This effect protects the page.

Flow:

Page Loads
      │
      ▼
Authentication Finished?
      │
      ▼
User Exists?
      │
 ┌────┴────┐
 ▼         ▼
Yes        No
 │          │
 ▼          ▼
Stay      Redirect
Here      to /login

Unauthenticated users cannot access this page.

===============================================================================

5. Loading Rooms
----------------

A second useEffect() loads all rooms once the authenticated user is available.

Flow:

Authenticated User
        │
        ▼
fetchRooms()
        │
        ▼
GET /api/rooms
        │
        ▼
Backend
        │
        ▼
Room List
        │
        ▼
setRooms()

If the request fails:

setError("Failed to load rooms")

===============================================================================

6. fetchRooms()
---------------

Purpose:

Retrieve every room available to the current user.

Flow:

fetchRooms()
      │
      ▼
Axios GET Request
      │
      ▼
Backend
      │
      ▼
Return Room Array
      │
      ▼
Update rooms state

After updating the state, React automatically re-renders the room list.

===============================================================================

7. Creating a Room
------------------

When the form is submitted:

createRoom()

is executed.

Flow:

User enters room name
        │
        ▼
Click Create
        │
        ▼
Prevent page refresh
        │
        ▼
Ignore empty names
        │
        ▼
Enable loading
        │
        ▼
POST /api/rooms
        │
        ▼
Backend creates room
        │
   ┌────┴─────┐
   ▼          ▼
Success     Failure
   │           │
   ▼           ▼
Insert Room  Display Error
into List

If successful:

setRooms(prev => [newRoom, ...prev])

places the newly created room at the beginning of the list so the user sees it
immediately.

===============================================================================

8. Loading States
-----------------

Authentication Loading

if (loading)

Display:

    Loading...

until authentication finishes.

------------------------------------------------

Room Creation Loading

While creating a room:

Button displays:

    ...

and becomes disabled.

This prevents duplicate room creation requests.

===============================================================================

9. Navbar
---------

The navigation bar displays:

- Application name
- Current user's name
- Logout button

Clicking Logout executes:

logout()

which:

- Removes the authentication token.
- Disconnects the socket.
- Redirects to the login page.

===============================================================================

10. Room List
-------------

If no rooms exist:

Display:

    No rooms yet. Create one above!

Otherwise:

Loop through every room:

rooms.map(...)

Each room displays:

- Room name
- Last message (if one exists)
- Number of participants

Clicking a room navigates to:

    /rooms/<roomId>

where the user can begin chatting.

===============================================================================

Overall Page Lifecycle
----------------------

User Opens /rooms
        │
        ▼
Authentication Check
        │
   ┌────┴─────┐
   ▼          ▼
Authenticated  Not Authenticated
      │             │
      ▼             ▼
Fetch Rooms    Redirect to Login
      │
      ▼
Display Room List
      │
      ▼
User Creates Room
      │
      ▼
POST /api/rooms
      │
      ▼
Update Room List
      │
      ▼
User Selects Room
      │
      ▼
Navigate to /rooms/:id

===============================================================================

Purpose of this file:
- Protects the Rooms page from unauthorized access.
- Loads all chat rooms belonging to the authenticated user.
- Allows users to create new chat rooms.
- Displays room information including the latest message and participant count.
- Navigates users into individual chat rooms.
- Provides logout functionality through AuthContext.

===============================================================================
*/
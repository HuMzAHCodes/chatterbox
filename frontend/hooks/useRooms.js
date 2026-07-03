import { useState, useEffect } from 'react';
import api from '../lib/axios.js';

const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/rooms');
      setRooms(res.data.data);
    } catch (err) {
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (name, description = '') => {
    const res = await api.post('/api/rooms', { name, description });
    setRooms((prev) => [res.data.data, ...prev]);
    return res.data.data;
  };

  return { rooms, loading, error, fetchRooms, createRoom };
};

export default useRooms;










/*
===============================================================================
                             useRooms HOOK FLOW
===============================================================================

This file implements a custom React Hook for managing chat rooms.

Its purpose is to centralize all room-related operations so that components
don't need to repeatedly write the same API logic.

Responsibilities:

- Fetch all available rooms.
- Store room data.
- Track loading state.
- Handle loading errors.
- Create new rooms.
- Keep the room list updated.

Instead of each component making its own API requests, they can simply use:

    const {
        rooms,
        loading,
        error,
        fetchRooms,
        createRoom
    } = useRooms();

===============================================================================

1. Component State
------------------

rooms

Stores all chat rooms returned from the backend.

Example:

[
    {
        _id,
        name,
        participants,
        lastMessage
    },
    ...
]

------------------------------------------------

loading

Tracks whether a request is currently running.

true
    Data is being loaded.

false
    Loading has completed.

Components can use this to display loading indicators.

------------------------------------------------

error

Stores any error message that should be displayed.

Example:

    "Failed to load rooms"

===============================================================================

2. Initial Loading
------------------

When the component using this hook first mounts:

useEffect()

executes automatically.

Flow:

Component Mounts
        │
        ▼
fetchRooms()
        │
        ▼
Load Room Data

This means every component using this hook automatically receives the latest
room list without needing to call fetchRooms() manually.

===============================================================================

3. fetchRooms()
---------------

Purpose:

Retrieve all chat rooms from the backend.

Flow:

fetchRooms()
      │
      ▼
Enable Loading

setLoading(true)

      │
      ▼
GET /api/rooms
      │
      ▼
Backend
      │
      ▼
Return Room List
      │
      ▼
Update rooms State

If the request fails:

setError("Failed to load rooms")

Finally:

setLoading(false)

is executed regardless of success or failure.

===============================================================================

4. createRoom()
---------------

Purpose:

Create a new chat room.

Parameters:

name

Required room name.

------------------------------------------------

description

Optional room description.

Default:

''

(empty string)

-------------------------------------------------------------------------------

Flow:

createRoom(name)
        │
        ▼
POST /api/rooms
        │
        ▼
Backend Creates Room
        │
        ▼
Return New Room
        │
        ▼
Insert Room into State

The new room is inserted at the beginning of the array:

setRooms(prev => [newRoom, ...prev])

This allows the newly created room to appear immediately without performing
another API request.

The function also returns the created room so the calling component can use it
if needed.

===============================================================================

5. Returned Values
------------------

The hook returns:

rooms
    Current room list.

loading
    Loading status.

error
    Current error message.

fetchRooms()
    Reload all rooms.

createRoom()
    Create a new room.

Any component using this hook automatically gains access to these features.

===============================================================================

Overall Hook Lifecycle
----------------------

Component Uses useRooms()
        │
        ▼
Initialize State
        │
        ▼
Component Mounts
        │
        ▼
useEffect()
        │
        ▼
fetchRooms()
        │
        ▼
GET /api/rooms
        │
        ▼
Store Room List
        │
        ▼
Render UI
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
React Re-renders

===============================================================================

Purpose of this file:
- Encapsulates room-related API operations inside a reusable custom hook.
- Automatically loads chat rooms when a component mounts.
- Maintains room, loading, and error state.
- Provides helper functions for fetching and creating rooms.
- Updates the UI immediately after creating a room without requiring another
  API request.
- Keeps room management logic separate from presentation components.

===============================================================================
*/
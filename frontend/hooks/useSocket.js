import { useEffect, useRef } from 'react';
import { getSocket } from '../lib/socket.js';

const useSocket = (roomId, { onMessage, onUserTyping, onUserStopTyping, onUserJoined, onUserLeft } = {}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    const socket = getSocket();
    socketRef.current = socket;

    socket.emit('join-room', { roomId });

    if (onMessage) socket.on('new-message', onMessage);
    if (onUserTyping) socket.on('user-typing', onUserTyping);
    if (onUserStopTyping) socket.on('user-stop-typing', onUserStopTyping);
    if (onUserJoined) socket.on('user-joined', onUserJoined);
    if (onUserLeft) socket.on('user-left', onUserLeft);

    return () => {
      socket.emit('leave-room', { roomId });
      socket.off('new-message');
      socket.off('user-typing');
      socket.off('user-stop-typing');
      socket.off('user-joined');
      socket.off('user-left');
    };
  }, [roomId]);

  const sendMessage = (content) => {
    const socket = getSocket();
    socket.emit('send-message', { roomId, content });
  };

  const emitTyping = () => {
    const socket = getSocket();
    socket.emit('typing', { roomId });
  };

  const emitStopTyping = () => {
    const socket = getSocket();
    socket.emit('stop-typing', { roomId });
  };

  return { sendMessage, emitTyping, emitStopTyping };
};

export default useSocket;







/*
===============================================================================
                            useSocket HOOK FLOW
===============================================================================

This file implements a custom React Hook for managing Socket.IO communication.

Its purpose is to encapsulate all socket-related logic so that components do not
need to manually:

- Join chat rooms.
- Register socket event listeners.
- Remove event listeners.
- Emit messages.
- Emit typing events.

Instead, a component simply calls:

    const {
        sendMessage,
        emitTyping,
        emitStopTyping
    } = useSocket(roomId, { ...callbacks });

===============================================================================

1. useRef()
-----------

const socketRef = useRef(null);

This ref stores the socket instance.

Unlike state, updating a ref does NOT trigger a component re-render.

Purpose:

- Keep a reference to the current socket connection.
- Allow the same socket instance to be accessed throughout the hook.

===============================================================================

2. useEffect()
--------------

Whenever roomId changes, the effect executes.

Flow:

roomId available?
        │
   ┌────┴────┐
   ▼         ▼
 No         Yes
 │           │
 ▼           ▼
Return    Get Socket
               │
               ▼
        Join Socket Room
               │
               ▼
      Register Event Listeners

===============================================================================

3. Getting the Socket
---------------------

const socket = getSocket();

This retrieves the application's shared Socket.IO connection.

Since getSocket() follows the Singleton Pattern, every component shares the same
socket connection instead of creating new ones.

===============================================================================

4. Joining a Room
-----------------

socket.emit('join-room', { roomId });

The client notifies the server that it wants to join a specific chat room.

Flow:

Component
      │
      ▼
join-room
      │
      ▼
Socket Server
      │
      ▼
Socket joins room

After joining, the client will receive events only for that room.

===============================================================================

5. Registering Event Listeners
------------------------------

The hook registers listeners only if callback functions are provided.

------------------------------------------------

new-message

socket.on('new-message', onMessage)

Executed whenever a new message is received.

------------------------------------------------

user-typing

Triggered when another participant begins typing.

------------------------------------------------

user-stop-typing

Triggered when typing stops.

------------------------------------------------

user-joined

Triggered when a new participant joins the room.

------------------------------------------------

user-left

Triggered when a participant leaves the room.

This flexible approach allows components to subscribe only to the events they
actually need.

===============================================================================

6. Cleanup
----------

When the component unmounts or roomId changes:

socket.emit('leave-room')

is sent.

Then all registered event listeners are removed.

Removed events:

- new-message
- user-typing
- user-stop-typing
- user-joined
- user-left

Cleaning up listeners prevents:

- Memory leaks
- Duplicate event handlers
- Receiving events for rooms that are no longer active

===============================================================================

7. sendMessage()
----------------

Purpose:

Send a new chat message to the server.

Flow:

sendMessage(content)
        │
        ▼
socket.emit(
    'send-message',
    {
        roomId,
        content
    }
)

The server processes the message and broadcasts it to all participants in the
room.

===============================================================================

8. emitTyping()
---------------

Purpose:

Notify the server that the current user has started typing.

Flow:

emitTyping()
      │
      ▼
socket.emit(
    'typing',
    { roomId }
)

Other users receive a:

user-typing

event.

===============================================================================

9. emitStopTyping()
-------------------

Purpose:

Notify the server that the user has stopped typing.

Flow:

emitStopTyping()
        │
        ▼
socket.emit(
    'stop-typing',
    { roomId }
)

Other users receive:

user-stop-typing

allowing the typing indicator to disappear.

===============================================================================

10. Returned API
----------------

The hook returns:

{
    sendMessage,
    emitTyping,
    emitStopTyping
}

A component can use these functions like this:

sendMessage("Hello!")

emitTyping()

emitStopTyping()

without interacting with the socket directly.

===============================================================================

Overall Hook Lifecycle
----------------------

Component Mounts
        │
        ▼
useSocket(roomId)
        │
        ▼
Get Shared Socket
        │
        ▼
Join Room
        │
        ▼
Register Event Listeners
        │
        ▼
User Sends Messages
        │
        ▼
Receive Real-Time Events
        │
        ▼
Component Unmounts
        │
        ▼
Leave Room
        │
        ▼
Remove All Listeners

===============================================================================

Purpose of this file:
- Encapsulates Socket.IO functionality inside a reusable custom hook.
- Automatically joins and leaves chat rooms.
- Registers and cleans up socket event listeners.
- Provides helper functions for sending messages and typing events.
- Keeps React components clean by separating socket logic from UI code.
- Promotes code reuse across multiple chat-related components.

===============================================================================
*/
import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const connectSocket = (token) => {
  const s = getSocket();
  s.auth = { token };
  s.connect();
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default getSocket;

/*
===============================================================================
                           SOCKET CLIENT FLOW
===============================================================================

This file is responsible for creating and managing a single Socket.IO client
connection for the entire frontend application.

Instead of creating a new socket every time a component needs one, this file
implements the Singleton Pattern, ensuring only ONE socket connection exists.

===============================================================================

1. Socket Variable
------------------

let socket = null;

Initially, no socket connection exists.

    socket
      │
      ▼
    null

Once the first connection is created, this variable stores the socket instance
so every component shares the same connection.

===============================================================================

2. getSocket()
--------------

Purpose:
Returns the existing socket if one already exists. Otherwise, creates it.

Flow:

Component
    │
    ▼
getSocket()
    │
    ▼
Is socket null?
    │
    ├── Yes
    │      │
    │      ▼
    │   Create new socket
    │
    └── No
           │
           ▼
     Return existing socket

This prevents multiple unnecessary connections to the server.

-------------------------------------------------------------------------------

Socket Configuration

autoConnect: false

- The socket is NOT connected immediately after creation.
- It waits until connectSocket() is called.
- Useful because we usually need to attach the user's JWT first.

reconnection: true

- If the connection drops unexpectedly,
  Socket.IO automatically tries to reconnect.

reconnectionAttempts: 5

- Retry connecting up to 5 times.

reconnectionDelay: 1000

- Wait 1000 milliseconds (1 second) between retries.

===============================================================================

3. connectSocket(token)
-----------------------

Purpose:
Connects the socket to the backend using the user's JWT.

Flow:

User logs in
      │
      ▼
connectSocket(token)
      │
      ▼
getSocket()
      │
      ▼
Attach authentication

    s.auth = {
        token
    }

      │
      ▼
s.connect()
      │
      ▼
Connection request sent
      │
      ▼
Backend verifies JWT
      │
      ├── Valid token
      │      │
      │      ▼
      │   Connection established
      │
      └── Invalid token
             │
             ▼
      Connection rejected

The auth object is sent during the Socket.IO handshake and can be accessed on
the server to authenticate the user before allowing the connection.

===============================================================================

4. disconnectSocket()
---------------------

Purpose:
Closes the socket connection when the user logs out or the application no
longer needs real-time communication.

Flow:

disconnectSocket()
        │
        ▼
socket exists?
        │
        ├── No
        │      │
        │      ▼
        │   Do nothing
        │
        └── Yes
               │
               ▼
        socket.disconnect()
               │
               ▼
        Close WebSocket connection
               │
               ▼
        socket = null

Setting the socket back to null allows a completely fresh connection to be
created the next time getSocket() is called.

===============================================================================

5. Default Export
-----------------

export default getSocket;

This lets components simply write:

    import getSocket from '@/lib/socket';

instead of:

    import { getSocket } from '@/lib/socket';

===============================================================================

Overall Socket Lifecycle
------------------------

Application Starts
        │
        ▼
socket = null
        │
        ▼
User logs in
        │
        ▼
connectSocket(token)
        │
        ▼
getSocket()
        │
        ▼
Create socket (only once)
        │
        ▼
Attach JWT
        │
        ▼
Connect to server
        │
        ▼
Real-time communication
(messages, typing, notifications, etc.)
        │
        ▼
User logs out
        │
        ▼
disconnectSocket()
        │
        ▼
Connection closed
        │
        ▼
socket = null

===============================================================================

Purpose of this file:
- Maintains a single Socket.IO connection across the application.
- Prevents duplicate socket connections.
- Authenticates the socket using the user's JWT.
- Automatically attempts reconnection if the connection is lost.
- Provides simple helper functions to connect and disconnect the socket.
- Keeps all socket-related logic centralized in one place.

===============================================================================
*/
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext.jsx';
import api from '../../../lib/axios.js';
import { getSocket } from '../../../lib/socket.js';
import Link from 'next/link';

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [typing, setTyping] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch room + message history
  useEffect(() => {
    if (!user || !roomId) return;

    const fetchData = async () => {
      try {
        const [roomRes, msgRes] = await Promise.all([
          api.get(`/api/rooms/${roomId}`),
          api.get(`/api/messages/${roomId}?page=1&limit=50`),
        ]);
        setRoom(roomRes.data.data);
        // Messages come newest first — reverse for display
        setMessages(msgRes.data.data.reverse());
      } catch (err) {
        setError('Failed to load room');
      }
    };

    fetchData();
  }, [user, roomId]);

  // Socket.io events
  useEffect(() => {
    if (!user || !roomId) return;

    const socket = getSocket();

    socket.emit('join-room', { roomId });

    socket.on('new-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('user-typing', ({ username }) => {
      setTyping(username);
    });

    socket.on('user-stop-typing', () => {
      setTyping(null);
    });

    return () => {
      socket.emit('leave-room', { roomId });
      socket.off('new-message');
      socket.off('user-typing');
      socket.off('user-stop-typing');
    };
  }, [user, roomId]);

  // Auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const socket = getSocket();
    socket.emit('send-message', { roomId, content });
    socket.emit('stop-typing', { roomId });
    setContent('');
    setSending(false);
  };

  const handleTyping = (e) => {
    setContent(e.target.value);
    const socket = getSocket();
    socket.emit('typing', { roomId });

    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('stop-typing', { roomId });
    }, 1500);
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-white shadow px-6 py-4 flex items-center gap-4">
        <Link href="/rooms" className="text-gray-500 hover:text-gray-700 text-sm">
          ← Back
        </Link>
        <div>
          <h1 className="font-bold text-lg">{room?.name || 'Loading...'}</h1>
          <p className="text-xs text-gray-500">
            {room?.participants?.length || 0} member{room?.participants?.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 px-6 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            No messages yet. Say hello!
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.sender?._id === user._id;
          return (
            <div
              key={msg._id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isOwn && (
                  <span className="text-xs text-gray-500 mb-1 ml-1">
                    {msg.sender?.name}
                  </span>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl text-sm ${
                    isOwn
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 shadow rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-xs text-gray-400 mt-1 mx-1">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white shadow rounded-2xl rounded-bl-none px-4 py-2 text-sm text-gray-500 italic">
              {typing} is typing...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t px-6 py-4">
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={content}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="submit"
            disabled={!content.trim()}
            className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}





/*
===============================================================================
                           CHAT ROOM PAGE FLOW
===============================================================================

This file implements the real-time chat room page.

Responsibilities:

- Ensure only authenticated users can access the room.
- Fetch room information.
- Fetch previous chat history.
- Join the Socket.IO room.
- Listen for incoming messages.
- Send new messages.
- Display typing indicators.
- Automatically scroll to the latest message.
- Leave the room when the user navigates away.

This page combines both REST APIs (for initial data) and Socket.IO (for
real-time communication).

===============================================================================

1. Client Component
-------------------

'use client';

This page uses:

- useState()
- useEffect()
- useRef()
- useParams()
- useRouter()
- useAuth()

Therefore it must run on the client.

===============================================================================

2. Route Parameter
------------------

const { roomId } = useParams();

The roomId is extracted from the URL.

Example:

URL:

    /rooms/685c123abc456

roomId becomes:

    "685c123abc456"

Every API request and socket event uses this roomId to identify the chat room.

===============================================================================

3. Authentication
-----------------

const { user, loading } = useAuth();

The page first checks whether the user is authenticated.

Flow:

Page Loads
      │
      ▼
Authentication Complete?
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

Only authenticated users can access chat rooms.

===============================================================================

4. Component State
------------------

room

Stores information about the current chat room.

Example:

{
    _id,
    name,
    participants
}

------------------------------------------------

messages

Stores every message displayed in the conversation.

Example:

[
    message1,
    message2,
    message3
]

------------------------------------------------

content

Stores the text currently typed into the input field.

------------------------------------------------

typing

Stores the name of the user currently typing.

Example:

"Ali"

Displays:

Ali is typing...

------------------------------------------------

sending

Represents whether a message is currently being sent.

(Although declared here, it is not currently used to disable the Send button.)

------------------------------------------------

error

Stores any error displayed to the user.

===============================================================================

5. Refs
-------

bottomRef

Points to the invisible element at the bottom of the chat.

Used for automatic scrolling whenever a new message arrives.

------------------------------------------------

typingTimer

Stores a timeout used for typing events.

Every key press resets the timer.

If no typing occurs for 1.5 seconds:

stop-typing

is emitted automatically.

===============================================================================

6. Loading Room Data
--------------------

When both:

- user
- roomId

are available,

fetchData() executes.

Flow:

Page Opens
      │
      ▼
Promise.all()
      │
      ├──────────────┐
      ▼              ▼
GET Room       GET Messages
      │              │
      └──────┬───────┘
             ▼
Update State

The room information and message history are loaded simultaneously for better
performance.

-------------------------------------------------------------------------------

Messages returned from the backend are ordered:

Newest → Oldest

They are reversed so the UI displays:

Oldest → Newest

which is the natural reading order for chat applications.

===============================================================================

7. Socket.IO Connection
-----------------------

After the room loads:

const socket = getSocket();

The page joins the Socket.IO room.

socket.emit('join-room', { roomId });

From this point onward the user begins receiving real-time updates.

===============================================================================

8. Listening for Socket Events
------------------------------

new-message

Triggered whenever someone sends a message.

Flow:

Another User Sends Message
          │
          ▼
Server Broadcasts
          │
          ▼
new-message
          │
          ▼
Append Message

------------------------------------------------

user-typing

Triggered when another participant begins typing.

Displays:

<User> is typing...

------------------------------------------------

user-stop-typing

Removes the typing indicator.

===============================================================================

9. Cleanup
----------

When the component unmounts or the user changes rooms:

socket.emit('leave-room')

is sent.

All event listeners are removed:

- new-message
- user-typing
- user-stop-typing

This prevents:

- Memory leaks
- Duplicate event listeners
- Receiving events from rooms the user has already left

===============================================================================

10. Auto Scroll
---------------

Whenever messages change:

messages
      │
      ▼
scrollIntoView()

moves the chat window to the bottom.

This ensures the newest message is always visible.

===============================================================================

11. Sending Messages
--------------------

When the form is submitted:

sendMessage()

executes.

Flow:

User Types Message
        │
        ▼
Click Send
        │
        ▼
Prevent Refresh
        │
        ▼
Ignore Empty Messages
        │
        ▼
Socket Emit:

send-message

        │
        ▼
Server Receives Message
        │
        ▼
Broadcasts new-message
        │
        ▼
Every Client Updates Chat

After sending:

- stop-typing is emitted
- input field is cleared

===============================================================================

12. Typing Indicator
--------------------

Every key press executes:

handleTyping()

Flow:

User Types
      │
      ▼
Update Input
      │
      ▼
Emit:

typing

      │
      ▼
Restart Timer
      │
      ▼
No Typing For 1.5 Seconds
      │
      ▼
Emit:

stop-typing

This prevents unnecessary typing notifications from remaining visible.

===============================================================================

13. Message Rendering
---------------------

Each message is compared against the logged-in user.

const isOwn = msg.sender._id === user._id

If true:

- Message appears on the right.
- Blue bubble.
- White text.

If false:

- Message appears on the left.
- White bubble.
- Sender's name displayed.

This makes conversations easy to distinguish.

===============================================================================

14. Timestamp Formatting
------------------------

formatTime()

Converts the message creation time into a readable format.

Example:

2026-07-03T15:45:00Z

becomes

3:45 PM

(or according to the user's locale).

===============================================================================

Overall Chat Lifecycle
----------------------

User Opens Room
        │
        ▼
Authentication Check
        │
        ▼
Load Room Details
        │
        ▼
Load Message History
        │
        ▼
Join Socket Room
        │
        ▼
Display Conversation
        │
        ▼
User Types
        │
        ▼
Emit Typing Event
        │
        ▼
User Sends Message
        │
        ▼
Server Broadcasts Message
        │
        ▼
Every Connected User Receives Message
        │
        ▼
Auto Scroll to Bottom
        │
        ▼
Leave Room
        │
        ▼
Remove Socket Listeners

===============================================================================

Purpose of this file:
- Protects chat rooms from unauthorized access.
- Loads room information and previous messages.
- Joins a Socket.IO room for real-time communication.
- Sends and receives messages instantly.
- Displays typing indicators for active users.
- Automatically scrolls to new messages.
- Cleans up socket listeners when leaving the room.
- Provides the complete real-time chat experience for the application.

===============================================================================
*/
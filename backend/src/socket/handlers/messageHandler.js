import Message from '../../models/Message.js';
import Room from '../../models/Room.js';

const registerMessageHandlers = (io, socket) => {
  socket.on('send-message', async ({ roomId, content }) => {
    try {
      if (!content || !content.trim()) {
        return socket.emit('error', { message: 'Message content cannot be empty' });
      }

      const message = await Message.create({
        content,
        sender: socket.user._id,
        room: roomId,
      });

      // Update room's lastMessage
      await Room.findByIdAndUpdate(roomId, { lastMessage: message._id });

      // Populate sender before broadcasting
      const populated = await message.populate('sender', 'name avatar');

      // Send to EVERYONE in room including sender (confirmation)
      io.to(roomId).emit('new-message', populated);
    } catch (err) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('typing', ({ roomId }) => {
    // Send to everyone EXCEPT sender
    socket.to(roomId).emit('user-typing', {
      userId: socket.user._id.toString(),
      username: socket.user.name,
    });
  });

  socket.on('stop-typing', ({ roomId }) => {
    socket.to(roomId).emit('user-stop-typing', {
      userId: socket.user._id.toString(),
    });
  });
};

export default registerMessageHandlers;





/*
===============================================================================
MESSAGEHANDLER.JS - FUNCTIONALITY SUMMARY
===============================================================================

This file contains all Socket.IO event handlers related to messaging.

Its primary responsibility is to handle real-time chat communication,
including sending messages and notifying users when someone is typing.

Flow of execution:

1. Registers message-related socket events
   - The function is called when a user successfully connects.
   - It receives:
       • io     → The Socket.IO server instance.
       • socket → The currently connected user's socket.

2. Handles "send-message" event
   - Triggered when a user sends a chat message.
   - Performs the following steps:
       a. Validates that the message is not empty.
       b. Saves the message to the Message collection.
       c. Updates the corresponding room's lastMessage field.
       d. Populates the sender information (name and avatar).
       e. Broadcasts the complete message to everyone in the room,
          including the sender, using:
              io.to(roomId).emit('new-message', populated)

   - If any step fails, an error event is sent back to the sender.

3. Handles "typing" event
   - Triggered when a user starts typing.
   - Notifies every other user in the room (excluding the sender)
     that the user is typing by emitting:
         "user-typing"

4. Handles "stop-typing" event
   - Triggered when a user stops typing.
   - Notifies every other user in the room that typing has stopped
     by emitting:
         "user-stop-typing"

Socket.IO methods used:

• io.to(roomId).emit(...)
    Sends an event to every socket currently connected to the room,
    including the sender.

• socket.to(roomId).emit(...)
    Sends an event to every socket in the room except the sender.

• socket.emit(...)
    Sends an event only to the current connected client.

Overall responsibility:
This file manages real-time messaging features. It stores chat messages in
the database, updates the room's latest message, broadcasts new messages to
all participants, and provides typing indicators so users know when others
are actively composing messages.
===============================================================================
*/
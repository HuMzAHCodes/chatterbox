const registerRoomHandlers = (io, socket) => {
  socket.on('join-room', ({ roomId }) => {
    socket.join(roomId);
    socket.emit('joined-room', { roomId });
    socket.to(roomId).emit('user-joined', {
      userId: socket.user._id.toString(),
      username: socket.user.name,
    });
  });

  socket.on('leave-room', ({ roomId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-left', {
      userId: socket.user._id.toString(),
      username: socket.user.name,
    });
  });
};

export default registerRoomHandlers;




/*
===============================================================================
ROOMHANDLER.JS - FUNCTIONALITY SUMMARY
===============================================================================

This file contains all Socket.IO event handlers related to chat rooms.

Its responsibility is to manage users joining and leaving rooms so that
messages and events can be delivered only to members of the appropriate room.

Flow of execution:

1. Registers room-related socket events
   - The function is called whenever a new client successfully connects.
   - It receives:
       • io     → The Socket.IO server instance.
       • socket → The currently connected user's socket.

2. Handles "join-room" event
   - Triggered when a client requests to join a chat room.
   - Adds the user's socket to the specified room using:
         socket.join(roomId)
   - Sends a confirmation back to the same user:
         "joined-room"
   - Notifies all other users already in the room that a new user has joined
     by emitting:
         "user-joined"

3. Handles "leave-room" event
   - Triggered when a client leaves a chat room.
   - Removes the user's socket from the room using:
         socket.leave(roomId)
   - Notifies the remaining users in that room that the user has left
     by emitting:
         "user-left"

Socket.IO methods used:

• socket.join(roomId)
    Adds the current socket to a room.

• socket.leave(roomId)
    Removes the current socket from a room.

• socket.emit(...)
    Sends an event only to the current connected client.

• socket.to(roomId).emit(...)
    Sends an event to every socket in the room except the sender.

Overall responsibility:
This file manages room membership and broadcasts join/leave notifications,
ensuring that users can participate in room-based real-time communication.
===============================================================================
*/
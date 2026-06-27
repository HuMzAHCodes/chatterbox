import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image'],
      default: 'text',
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// Most critical index — fast message fetch per room
messageSchema.index({ room: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;

/*
==================================================
Functionality of this File
==================================================

1. Imports the Mongoose library to define the schema and interact
   with the MongoDB database.

2. Creates a Message Schema that defines the structure of each
   chat message stored in MongoDB.

3. Message fields:
   - content: Stores the text of the message with validation.
   - sender: References the User who sent the message.
   - room: References the chat Room where the message was sent.
   - messageType: Specifies the type of message
     (currently 'text' or 'image').
   - readBy: An array of User IDs representing users who have
     read the message.

4. Enables timestamps:
   - createdAt: Automatically stores when the message was created.
   - updatedAt: Automatically updates whenever the message is
     modified.

5. Creates a compound index on:
   - room (ascending)
   - createdAt (descending)

   This allows the database to quickly retrieve the newest
   messages for a specific chat room, making message loading
   much faster.

6. Creates the Message model from the schema.

7. Exports the Message model so it can be imported and used
   throughout the application to create, retrieve, update,
   and delete chat messages.

*/
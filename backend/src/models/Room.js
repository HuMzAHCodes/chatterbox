import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      minlength: [2, 'Room name must be at least 2 characters'],
      maxlength: [50, 'Room name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
  },
  { timestamps: true }
);

roomSchema.index({ participants: 1 });
roomSchema.index({ createdBy: 1 });

const Room = mongoose.model('Room', roomSchema);
export default Room;

/*
==================================================
Functionality of this File
==================================================

1. Imports the Mongoose library to define the schema and interact
   with the MongoDB database.

2. Creates a Room Schema that defines the structure of each chat
   room document stored in MongoDB.

3. Room fields:
   - name: The name of the chat room with validation rules.
   - description: An optional description of the room.
   - isPrivate: Indicates whether the room is private or public.
   - createdBy: References the User who created the room.
   - participants: An array of User IDs representing members of
     the room.
   - lastMessage: References the most recent message sent in the
     room for quick access.

4. Enables timestamps:
   - createdAt: Automatically stores when the room was created.
   - updatedAt: Automatically updates whenever the room document
     is modified.

5. Creates an index on the participants field to improve the
   performance of queries that search for rooms containing a
   specific user.

6. Creates an index on the createdBy field to speed up queries
   that retrieve rooms created by a particular user.

7. Creates the Room model from the schema.

8. Exports the Room model so it can be imported and used in other
   parts of the application to create, read, update, and delete
   chat room documents.

*/
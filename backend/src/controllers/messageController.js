import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import Message from '../models/Message.js';
import Room from '../models/Room.js';

// @desc    Get paginated messages for a room
// @route   GET /api/messages/:roomId
// @access  Protected
export const getMessages = asyncHandler(async (req, res, next) => {
  const { roomId } = req.params;
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip  = (page - 1) * limit;

  const room = await Room.findById(roomId);

  if (!room) {
    return next(new AppError('Room not found', 404));
  }

  const isMember = room.participants.some(
    (p) => p.toString() === req.user._id.toString()
  );

  if (!isMember) {
    return next(new AppError('Not authorized to access this room', 403));
  }

  const total = await Message.countDocuments({ room: roomId });
  const totalPages = Math.ceil(total / limit);

  const messages = await Message.find({ room: roomId })
    .populate('sender', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: messages.length,
    page,
    totalPages,
    data: messages,
  });
});
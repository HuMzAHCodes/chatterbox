import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import Room from '../models/Room.js';

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Protected
export const createRoom = asyncHandler(async (req, res, next) => {
  const { name, description, isPrivate } = req.body;

  const room = await Room.create({
    name,
    description,
    isPrivate,
    createdBy: req.user._id,
    participants: [req.user._id],
  });

  await room.populate('participants', 'name avatar isOnline');
  await room.populate('createdBy', 'name');

  res.status(201).json({ success: true, data: room });
});

// @desc    Get all rooms for current user
// @route   GET /api/rooms
// @access  Protected
export const getRooms = asyncHandler(async (req, res, next) => {
  const rooms = await Room.find({ participants: req.user._id })
    .populate('participants', 'name avatar isOnline')
    .populate('lastMessage', 'content createdAt')
    .populate('createdBy', 'name')
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    count: rooms.length,
    data: rooms,
  });
});

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Protected
export const getRoomById = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id)
    .populate('participants', 'name avatar isOnline')
    .populate('lastMessage', 'content createdAt')
    .populate('createdBy', 'name');

  if (!room) {
    return next(new AppError('Room not found', 404));
  }

  const isMember = room.participants.some(
    (p) => p._id.toString() === req.user._id.toString()
  );

  if (!isMember) {
    return next(new AppError('Not authorized to access this room', 403));
  }

  res.status(200).json({ success: true, data: room });
});
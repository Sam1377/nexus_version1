const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Room = require('../models/Room');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/rooms - list public rooms
router.get('/', protect, async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false })
      .populate('owner', 'username avatar')
      .select('-code -messages -password')
      .sort({ lastActivity: -1 })
      .limit(50);
    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/rooms - create room
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, language, isPrivate, password } = req.body;
    const roomId = uuidv4().slice(0, 8).toUpperCase();

    const room = await Room.create({
      roomId,
      name: name || `Room ${roomId}`,
      description: description || '',
      language: language || 'javascript',
      owner: req.user._id,
      participants: [req.user._id],
      isPrivate: isPrivate || false,
      password: password || '',
    });

    await room.populate('owner', 'username avatar');
    res.status(201).json({ room });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/rooms/:roomId - get room by roomId
router.get('/:roomId', protect, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate('owner', 'username avatar')
      .populate('participants', 'username avatar');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ room });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/rooms/:roomId
router.delete('/:roomId', protect, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only owner can delete the room' });

    await room.deleteOne();
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

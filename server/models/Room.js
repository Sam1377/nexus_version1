const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', maxlength: 300 },
    language: { type: String, default: 'javascript' },
    code: { type: String, default: '// Welcome to Nexus\n// Start coding together!\n' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [messageSchema],
    isPrivate: { type: Boolean, default: false },
    password: { type: String, default: '' },
    maxParticipants: { type: Number, default: 10 },
    activeUsers: [{ socketId: String, userId: String, username: String }],
    lastActivity: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);

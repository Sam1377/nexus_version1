const Room = require('../models/Room');

// In-memory map: roomId -> { socketId -> { userId, username } }
const activeRooms = new Map();

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─── JOIN ROOM ────────────────────────────────────────────────────────────
    socket.on('join_room', async ({ roomId, userId, username }) => {
      try {
        const room = await Room.findOne({ roomId });
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        socket.join(roomId);

        // Track in memory
        if (!activeRooms.has(roomId)) activeRooms.set(roomId, new Map());
        activeRooms.get(roomId).set(socket.id, { userId, username });

        // Persist active users in DB
        await Room.findOneAndUpdate(
          { roomId },
          {
            $addToSet: { activeUsers: { socketId: socket.id, userId, username } },
            lastActivity: new Date(),
          }
        );

        // Send current room state to the joining user
        socket.emit('room_joined', {
          code: room.code,
          language: room.language,
          messages: room.messages.slice(-50),
        });

        // Broadcast updated user list
        const users = Array.from(activeRooms.get(roomId).values());
        io.to(roomId).emit('users_update', { users });

        // Notify others
        socket.to(roomId).emit('user_joined', { username, userId });

        console.log(`👤 ${username} joined room ${roomId}`);
      } catch (err) {
        console.error('join_room error:', err);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // ─── CODE CHANGE ─────────────────────────────────────────────────────────
    socket.on('code_change', async ({ roomId, code }) => {
      socket.to(roomId).emit('code_update', { code });

      // Debounced DB save — save every time (simple approach)
      try {
        await Room.findOneAndUpdate({ roomId }, { code, lastActivity: new Date() });
      } catch (err) {
        console.error('code_change DB error:', err);
      }
    });

    // ─── LANGUAGE CHANGE ─────────────────────────────────────────────────────
    socket.on('language_change', async ({ roomId, language }) => {
      io.to(roomId).emit('language_update', { language });
      try {
        await Room.findOneAndUpdate({ roomId }, { language });
      } catch (err) {
        console.error('language_change error:', err);
      }
    });

    // ─── CHAT MESSAGE ─────────────────────────────────────────────────────────
    socket.on('send_message', async ({ roomId, userId, username, content }) => {
      const message = { userId, username, content, timestamp: new Date() };

      io.to(roomId).emit('new_message', message);

      try {
        await Room.findOneAndUpdate(
          { roomId },
          { $push: { messages: message }, lastActivity: new Date() }
        );
      } catch (err) {
        console.error('send_message error:', err);
      }
    });

    // ─── TYPING INDICATOR ────────────────────────────────────────────────────
    socket.on('typing_start', ({ roomId, username }) => {
      socket.to(roomId).emit('user_typing', { username });
    });

    socket.on('typing_stop', ({ roomId, username }) => {
      socket.to(roomId).emit('user_stopped_typing', { username });
    });

    // ─── LEAVE ROOM ──────────────────────────────────────────────────────────
    socket.on('leave_room', async ({ roomId, username }) => {
      await handleLeave(socket, io, roomId, username);
    });

    // ─── DISCONNECT ──────────────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      // Find which room this socket was in
      for (const [roomId, users] of activeRooms.entries()) {
        if (users.has(socket.id)) {
          const { username } = users.get(socket.id);
          await handleLeave(socket, io, roomId, username);
          break;
        }
      }
    });
  });
};

async function handleLeave(socket, io, roomId, username) {
  socket.leave(roomId);

  if (activeRooms.has(roomId)) {
    activeRooms.get(roomId).delete(socket.id);
    if (activeRooms.get(roomId).size === 0) activeRooms.delete(roomId);
  }

  try {
    await Room.findOneAndUpdate(
      { roomId },
      { $pull: { activeUsers: { socketId: socket.id } } }
    );
  } catch (err) {
    console.error('handleLeave DB error:', err);
  }

  const users = activeRooms.has(roomId)
    ? Array.from(activeRooms.get(roomId).values())
    : [];

  io.to(roomId).emit('users_update', { users });
  io.to(roomId).emit('user_left', { username });

  console.log(`👋 ${username} left room ${roomId}`);
}

module.exports = initSocket;

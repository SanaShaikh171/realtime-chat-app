require('dotenv').config();
const Message = require('./models/Message');
const User = require('./models/User');
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => {
  res.send('Server is alive!');
});
const onlineUsers = new Map();
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('join_room', (conversationId) => {
    socket.join(conversationId);
  });
  socket.on('send_message', async ({ conversationId, senderId, text }) => {
    try {
      const message = await Message.create({
        conversation: conversationId,
        sender: senderId,
        text,
      });
      const populatedMessage = await message.populate('sender', 'name');
      io.to(conversationId).emit('receive_message', populatedMessage);
    } catch (err) {
      console.log('Error sending message:', err);
    }
  });
  socket.on('user_online', async (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    await User.findByIdAndUpdate(userId, { isOnline: true });
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });
  socket.on('disconnect', async () => {
    console.log('A user disconnected:', socket.id);
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
      });
      io.emit('online_users', Array.from(onlineUsers.keys()));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => {
  res.send('Server is alive!');
});
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

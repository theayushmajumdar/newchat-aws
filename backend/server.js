require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const PORT = process.env.PORT || 5001;
const app = express();
const server = http.createServer(app);

// Updated Socket.IO configuration for production behind Nginx
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  allowEIO3: true,
  path: '/socket.io/',
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with updated options
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });

// Message Schema
const messageSchema = new mongoose.Schema({
  user: String,
  content: String,
  room: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Socket.IO Connection with error handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const message = new Message({
        user: data.user,
        content: data.content,
        room: data.room
      });

      await message.save();
      io.to(data.room).emit('receive_message', {
        ...data,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', 'Failed to save message');
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// API Routes with error handling
app.get('/api/messages/:room', async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// Serve static files from the correct path inside Docker
app.use(express.static(path.join(__dirname, 'public')));

// Handle React routing - Serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
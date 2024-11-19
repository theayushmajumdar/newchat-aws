// backend/server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*",  // Allow all origins for now (for development, adjust in production)
    methods: ["GET", "POST"]
  }
});
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');  // Add this
require('dotenv').config();  // Ensure dotenv is loaded correctly

// Middleware
app.use(cors());
app.use(express.json());

// Log the MongoDB URI to ensure it's being loaded correctly
if (!process.env.MONGODB_URI) {
  console.error('MongoDB URI is not defined in the .env file');
  process.exit(1);  // Exit the app if MONGODB_URI is missing
}
console.log('MongoDB URI:', process.env.MONGODB_URI);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch((error) => {
  console.error('MongoDB connection error:', error.message);
  process.exit(1);  // Exit the app on connection error
});

// Message Schema
const messageSchema = new mongoose.Schema({
  user: String,
  content: String,
  room: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('send_message', async (data) => {
    const message = new Message({
      user: data.user,
      content: data.content,
      room: data.room
    });

    try {
      await message.save();
      io.to(data.room).emit('receive_message', {
        ...data,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// API Routes
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

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

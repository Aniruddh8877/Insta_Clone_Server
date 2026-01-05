const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(cors({
     origin: ["http://localhost:3000", "https://insta-clone-mauve-gamma.vercel.app"],
     methods: ["GET", "POST"]
}));
app.use(express.json());

app.get('/', (req, res) => {
     res.send('Instagram Clone Real-time Server is Running');
});

const io = new Server(server, {
     cors: {
          origin: ["http://localhost:3000", "https://insta-clone-mauve-gamma.vercel.app"],
          methods: ["GET", "POST"]
     }
});

io.on('connection', (socket) => {
     console.log('A user connected:', socket.id);

     socket.on('join_user', (userId) => {
          if (userId) {
               socket.join(`user:${userId}`);
               console.log(`Socket ${socket.id} joined room user:${userId}`);
          }
     });

     socket.on('disconnect', () => {
          console.log('User disconnected:', socket.id);
     });
});

// Webhook for Next.js to trigger updates
app.post('/api/socket/update', (req, res) => {
     const { type, postId, data } = req.body;

     if (!type || !postId) {
          return res.status(400).json({ error: 'Missing parameters' });
     }

     // Broadcast to all connected clients
     if (type === 'message:new') {
          // Expect data to contain receiverId
          const { receiverId } = data;
          if (receiverId) {
               io.to(`user:${receiverId}`).emit('message:new', data);
               console.log(`Sent DM to user:${receiverId}`);
          }
     } else {
          // Event name convention: 'post:update'
          io.emit('post:update', { type, postId, data });
     }

     console.log(`Broadcasted update: ${type}`);
     res.json({ success: true });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
     console.log(`Socket.io server running on port ${PORT}`);
});

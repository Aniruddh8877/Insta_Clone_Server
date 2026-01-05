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

const io = new Server(server, {
     cors: {
          origin: ["http://localhost:3000", "https://insta-clone-mauve-gamma.vercel.app"],
          methods: ["GET", "POST"]
     }
});

io.on('connection', (socket) => {
     console.log('A user connected:', socket.id);

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
     // Event name convention: 'post:update'
     io.emit('post:update', { type, postId, data });

     console.log(`Broadcasted update for post ${postId}: ${type}`);
     res.json({ success: true });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
     console.log(`Socket.io server running on port ${PORT}`);
});

// socket-server.js
const { Server } = require("socket.io");
const http = require("http");

const port = process.env.PORT || 3001;
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

server.listen(port, () => {
  console.log(`Socket.IO server running on port ${port}`);
  console.log(`CORS origin: ${corsOrigin}`);
});

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // When a user opens a chat, they join a room for that conversation
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined room ${conversationId}`);
  });

  // When a new message is sent, broadcast it to the correct room
  socket.on("new_message", (data) => {
    // Send to everyone in the room (including the sender for UI updates)
    io.to(data.conversationId).emit("message_received", data.message);
  });

  // Listeners for posts and likes remain the same
  socket.on("new_post", (postData) => {
    socket.broadcast.emit("post_received", postData);
  });

  socket.on("new_like", (likeData) => {
    socket.broadcast.emit("like_received", likeData);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});
// socket-server.js
const { Server } = require("socket.io");

const io = new Server(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

console.log("Socket.IO server running on port 3001");

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
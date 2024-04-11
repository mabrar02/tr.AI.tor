require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(express.json());
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_DEPLOYMENT,
  },
});

const rooms = {};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  const updatePlayers = (roomId) => {
    io.to(roomId).emit("update_players", Object.values(rooms[roomId].players));
    console.log(rooms);
  };

  socket.on("host_room", (roomId) => {
    rooms[roomId] = { players: {} };
    socket.join(roomId);
    rooms[roomId].players[socket.id] = "Host";
    updatePlayers(roomId);
    console.log(`Room hosted: ${roomId}`);
  });

  socket.on("join_room", (roomId) => {
    if (rooms[roomId]) {
      socket.join(roomId);
      rooms[roomId].players[socket.id] = "Player";
      updatePlayers(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User DCed: ${socket.id}`);
    for (const roomId in rooms) {
      if (
        rooms.hasOwnProperty(roomId) &&
        rooms[roomId].players.hasOwnProperty(socket.id)
      ) {
        delete rooms[roomId].players[socket.id];
        updatePlayers(roomId);
      }
    }
  });
});

httpServer.listen(process.env.PORT, () => {
  console.log("server is running");
});

const roomHandlers = require("./handlers/roomHandlers");
const playerHandlers = require("./handlers/playerHandlers");

module.exports = function initializeSocket(io) {
  const rooms = {};

  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    roomHandlers(socket, io, rooms);
    playerHandlers(socket, io, rooms);
  });
};

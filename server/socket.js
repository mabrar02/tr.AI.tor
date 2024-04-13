const roomHandlers = require("./handlers/roomHandlers");
const playerHandlers = require("./handlers/playerHandlers");
const phaseHandlers = require("./handlers/phaseHandlers");

module.exports = function initializeSocket(io) {
  const rooms = {};

  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    roomHandlers(socket, io, rooms);
    playerHandlers(socket, io, rooms);
    phaseHandlers(socket, io, rooms);
  });
};

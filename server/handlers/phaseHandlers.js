module.exports = function playerHandlers(socket, io, rooms) {
  socket.on("start_game", (roomId) => {
    io.to(roomId).emit("game_started", {});
  });
};

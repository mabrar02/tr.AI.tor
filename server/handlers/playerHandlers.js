module.exports = function playerHandlers(socket, io, rooms) {
  const updatePlayers = (roomId) => {
    io.to(roomId).emit("update_players", Object.values(rooms[roomId].players));
    console.log(rooms);
  };

  socket.on("submit_answer", (roomId, answer) => {
    io.to(roomId).emit("answer_submitted", { playerId: socket.id, answer });
  });

  socket.on("vote_answer", (roomId, playerIdVotedFor) => {
    io.to(roomId).emit("vote_submitted", {
      voterId: socket.id,
      playerIdVotedFor,
    });
  });
};

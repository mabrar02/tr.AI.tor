module.exports = function playerHandlers(socket, io, rooms) {
  const updatePlayers = (roomId) => {
    io.to(roomId).emit("update_players", Object.values(rooms[roomId].players));
    console.log(rooms);
  };

  socket.on("submit_answer", ({ roomId, answer }) => {
    rooms[roomId].answers[socket.id] = answer;
    rooms[roomId].numSubmitted++;

    if (rooms[roomId].numSubmitted == rooms[roomId].numPlayers) {
      io.to(roomId).emit("voting_phase", {});
    }
  });
};

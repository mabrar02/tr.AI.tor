function updatePlayers(io, roomId, rooms) {
  io.to(roomId).emit("update_players", Object.values(rooms[roomId].players));
  console.log(rooms);
}

module.exports = {
  updatePlayers,
};


const geminiHandlers = require("./geminiHandlers");


module.exports = function playerHandlers(socket, io, rooms) {
  const updatePlayers = (roomId) => {
    io.to(roomId).emit("update_players", Object.values(rooms[roomId].players));
    console.log(rooms);
  };

  socket.on("submit_answer", async ({ roomId, answer }) => {
    rooms[roomId].players[socket.id].answers = answer;
    rooms[roomId].numSubmitted++;

    const geminiFilter = await geminiHandlers("wizard"/*rooms[roomId].players[socket.id].character*/, answer);
    const content = await geminiFilter("wizard"/*rooms[roomId].players[socket.id].character*/, answer);

    console.log(content);

    rooms[roomId].players[socket.id].filteredAnswer = content;

    if (rooms[roomId].numSubmitted == rooms[roomId].numPlayers) {
      updatePlayers(roomId);
      io.to(roomId).emit("voting_phase", {});
    }
  });
};

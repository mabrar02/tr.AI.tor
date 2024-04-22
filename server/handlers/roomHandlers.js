module.exports = function roomHandlers(socket, io, rooms) {
  const updatePlayers = (roomId) => {
      if(rooms[roomId]) {
        const playerTemp = Object.values(rooms[roomId].players);
        const socketIdTemp = Object.keys(rooms[roomId].players);
        const idx = socketIdTemp.indexOf(socket.id);
        io.to(roomId).emit("update_players", playerTemp);
        socket.emit("update_index", idx);
    //    console.log(rooms);
    }
  };
  
  socket.on("host_room", ({ roomId, username }) => {
    rooms[roomId] = {
      players: {},
      numSubmitted: 0,
      numPlayers: 1,
      characters: [],
    };
    socket.join(roomId);
    rooms[roomId].players[socket.id] = { username, host: true, character: "", answer: "", filteredAnswer: ""};
    updatePlayers(roomId);
    console.log(`Room hosted: ${roomId}`);
  });

  socket.on("join_room", ({ roomId, username }, callback) => {
    console.log(rooms);
    if (rooms[roomId]) {
      socket.join(roomId);
      rooms[roomId].players[socket.id] = { username, host: false, character: "", answer: "", filteredAnswer: ""};
      rooms[roomId].numPlayers++;
      updatePlayers(roomId);
      callback(true);
      console.log(`User ${username} joined room: ${roomId}`);
    } else {
      callback(false);
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
        rooms[roomId].numPlayers--;
        if(rooms[roomId].numPlayers == 0) {
          delete rooms[roomId];
        }
        updatePlayers(roomId);
      }
    }
  });
};

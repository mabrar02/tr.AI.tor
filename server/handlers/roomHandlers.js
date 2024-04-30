module.exports = function roomHandlers(socket, io, rooms) {
  const updatePlayers = (roomId) => {
    if (rooms[roomId]) {
      const playerTemp = Object.values(rooms[roomId].players);
      io.to(roomId).emit("update_players", playerTemp);
    }
  };

  socket.on("host_room", ({ roomId, username }) => {
    rooms[roomId] = {
      players: {},
      numSubmitted: 0,
      numPlayers: 1,
      characters: [],
      round: 0,
      prompts: [],
      colors: [
        "#69db88",
        "#f0f2aa",
        "#a3f7e7",
        "#f5a4c7",
        "#a88df2",
        "#ed4532",
        "#5f72d9",
        "#f5592f",
      ],
      timerActive: false,
      timer: 0,
    };
    socket.join(roomId);
    rooms[roomId].players[socket.id] = {
      username,
      host: true,
      character: "",
      answer: "",
      filteredAnswer: "",
      role: "",
      vote: "",
      color: rooms[roomId].colors[0],
    };
    updatePlayers(roomId);
    console.log(`Room hosted: ${roomId}`);
  });

  socket.on("join_room", ({ roomId, username }, callback) => {
    console.log(rooms);
    if (rooms[roomId]) {
      socket.join(roomId);
      rooms[roomId].players[socket.id] = {
        username,
        host: false,
        character: "",
        answer: "",
        filteredAnswer: "",
        role: "",
        vote: "",
        color: rooms[roomId].colors[rooms[roomId].numPlayers],
      };
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
        handleLeaveRoom(socket, roomId);
      }
    }
  });

  const handleLeaveRoom = (socket, roomId) => {
    if (rooms[roomId] && rooms[roomId].players[socket.id]) {
      delete rooms[roomId].players[socket.id];
      rooms[roomId].numPlayers--;
      if (rooms[roomId].numPlayers === 0) {
        delete rooms[roomId];
      }
      updatePlayers(roomId);
    }
  };

  socket.on("leave_room", ({ roomId }) => {
    handleLeaveRoom(socket, roomId);
  });
};

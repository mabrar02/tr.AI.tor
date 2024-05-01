module.exports = function roomHandlers(socket, io, rooms) {
  const updatePlayers = (roomId) => {
    if (rooms[roomId]) {
      const playerTemp = Object.values(rooms[roomId].players);
      io.to(roomId).emit("update_players", playerTemp);
    }
  };

  const getRandomColors = () => {
    const colors = [];
    for (let i = 0; i < 8; i++) {
      const randColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
      colors.push(randColor);
    }
    return colors;
  };

  socket.on("host_room", ({ roomId, username }) => {
    rooms[roomId] = {
      players: {},
      numSubmitted: 0,
      numPlayers: 1,
      characters: [],
      round: 0,
      prompts: [],
      colors: getRandomColors(),
      timerActive: false,
      timer: 0,
      index:0,
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
      index: 0,
    };
    updatePlayers(roomId);
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
        index: rooms[roomId].index+1,
      };
      rooms[roomId].numPlayers++;
      rooms[roomId].index++;
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

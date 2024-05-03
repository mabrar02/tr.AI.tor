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
      colors: [
        "#c4fabe",
        "#f4fab6",
        "#b6fae8",
        "#e7b6fa",
        "#faa5a5",
        "#5c62d1",
        "#b34f90",
        "#6db827",
      ],
      timerActive: false,
      timer: 0,
      index: 0,
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
      sab: false,
    };
    updatePlayers(roomId);
  });

  socket.on("join_room", ({ roomId, username }, callback) => {
    const room = rooms[roomId];

    if (!room) {
      callback("This room doesn't exist!");
    } else if (room.numPlayers >= 8) {
      callback("This game is full!");
    } else {
      const isUsernameTaken = Object.values(room.players).some(
        (player) => player.username.toLowerCase() === username.toLowerCase()
      );

      if (isUsernameTaken) {
        callback("This username is already taken!");
      } else {
        socket.join(roomId);
        const { players, colors, numPlayers, index } = room;
        players[socket.id] = {
          username,
          host: false,
          character: "",
          answer: "",
          filteredAnswer: "",
          role: "",
          vote: "",
          color: colors[numPlayers],
          index: index + 1,
          sab: false,
        };
        room.numPlayers++;
        room.index++;
        updatePlayers(roomId);
        callback("success");
        console.log(`User ${username} joined room: ${roomId}`);
      }
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
      const player = rooms[roomId].players[socket.id];
      const wasHost = player.host;
      const newHostSocketId = findNewHost(socket.id, roomId);

      delete rooms[roomId].players[socket.id];
      rooms[roomId].numPlayers--;

      if (wasHost && newHostSocketId) {
        rooms[roomId].players[newHostSocketId].host = true;
        io.to(newHostSocketId).emit("host_swap");
      }

      if (rooms[roomId].numPlayers === 0) {
        delete rooms[roomId];
      }
      updatePlayers(roomId);
    }
  };
  const findNewHost = (leavingSocketId, roomId) => {
    const players = rooms[roomId].players;

    for (const playerId in players) {
      if (players[playerId].host === false && playerId !== leavingSocketId) {
        return playerId;
      }
    }
    return null;
  };

  socket.on("leave_room", ({ roomId }) => {
    handleLeaveRoom(socket, roomId);
  });
};

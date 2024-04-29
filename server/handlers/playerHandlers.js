const geminiHandlers = require("./geminiHandlers");
const fs = require("fs");

const characters = JSON.parse(fs.readFileSync("characters.json", "utf-8"));

module.exports = function playerHandlers(socket, io, rooms) {
  const updatePlayers = (roomId) => {
    if (rooms[roomId]) {
      const playerTemp = Object.values(rooms[roomId].players);
      io.to(roomId).emit("update_players", playerTemp);
    }
  };

  const getRandomChars = (roomId, playerId) => {
    const randChars = [];
    let tempChars = characters;

    for (let i = 0; i < 3; i++) {
      const randIndex = Math.floor(Math.random() * tempChars.length);
      randChars[i] = tempChars[randIndex];

      if (!rooms[roomId].characters.includes(characters[randIndex])) {
        rooms[roomId].characters.push(tempChars[randIndex]);
      }

      tempChars = tempChars.filter((item) => item !== randChars[i]);
    }

    rooms[roomId].players[playerId].character = randChars[0];
    return randChars;
  };

  socket.on("get_char_options", ({ roomId }) => {
    for (const playerId in rooms[roomId].players) {
      if (rooms[roomId].players.hasOwnProperty(playerId)) {
        const player = rooms[roomId].players[playerId];
        let chars = [];
        if (player.role !== "Traitor") {
          chars = getRandomChars(roomId, playerId);
        }

        io.to(playerId).emit("update_char_options", {
          role: player.role,
          characters: chars,
        });
      }
    }

    rooms[roomId].numSubmitted = 1;
  });

  const getFilteredResponse = async (character, answer) => {
    const geminiFilter = await geminiHandlers(character, answer);
    const content = await geminiFilter(character, answer);

    return content;
  };

  socket.on("submit_answer", async ({ roomId, answer }) => {
    console.log(answer);
    rooms[roomId].players[socket.id].answers = answer;
    rooms[roomId].numSubmitted++;

    if (rooms[roomId].players[socket.id].role === "Traitor") {
      rooms[roomId].players[socket.id].filteredAnswer = answer;
      io.to(socket.id).emit("answer_submitted", answer);
    } else {
      const content = await getFilteredResponse(
        rooms[roomId].players[socket.id].character,
        answer
      );
      rooms[roomId].players[socket.id].filteredAnswer = content;
      io.to(socket.id).emit("answer_submitted", content);
    }

    updatePlayers(roomId);

    if (
      rooms[roomId].numSubmitted == rooms[roomId].numPlayers &&
      rooms[roomId].timer > 12
    ) {
      rooms[roomId].timer = 10;
      io.to(roomId).emit("timer_update", rooms[roomId].timer);
    }
  });

  socket.on("regenerate_answer", async ({ roomId }) => {
//    console.log(roomId);
    const content = await getFilteredResponse(
      rooms[roomId].players[socket.id].character,
      rooms[roomId].players[socket.id].answers
    );

    rooms[roomId].players[socket.id].filteredAnswer = content;

    updatePlayers(roomId);
    socket.emit("answer_regenerated", content);
  });

  socket.on("select_char", ({ character, roomId }) => {
    rooms[roomId].players[socket.id].character = character;
    rooms[roomId].numSubmitted++;

    if (
      rooms[roomId].numSubmitted == rooms[roomId].numPlayers &&
      rooms[roomId].timer > 7
    ) {
      rooms[roomId].timer = 5;
      io.to(roomId).emit("timer_update", rooms[roomId].timer);
    }
  });

  socket.on("send_vote", ({ roomId, vote }) => {
    rooms[roomId].players[socket.id].vote = vote;
  });
};

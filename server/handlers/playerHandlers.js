const { getFips } = require("crypto");
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

  const getRandomChars = (roomId) => {
    const randChars = [];

    for (let i = 0; i < 3; i++) {
      const randIndex = Math.floor(Math.random() * characters.length);
      randChars[i] = characters[randIndex];
      rooms[roomId].characters.push(characters[randIndex]);
    }

    rooms[roomId].players[socket.id].character = randChars[0];
    return randChars;
  };

  socket.on("get_char_options", ({ roomId }) => {
    for (const playerId in rooms[roomId].players) {
      if (rooms[roomId].players.hasOwnProperty(playerId)) {
        const player = rooms[roomId].players[playerId];
        let chars = [];
        if (player.role !== "Traitor") {
          chars = getRandomChars(roomId);
        }

        io.to(playerId).emit("update_char_options", {
          role: player.role,
          characters: chars,
        });
      }
    }
  });

  const getFilteredResponse = async (character, answer) => {
    const geminiFilter = await geminiHandlers(character, answer);
    const content = await geminiFilter(character, answer);

    return content;
  };

  socket.on("submit_answer", async ({ roomId, answer }) => {
    rooms[roomId].players[socket.id].answers = answer;
    rooms[roomId].numSubmitted++;

    const content = await getFilteredResponse(
      rooms[roomId].players[socket.id].character,
      answer
    );

    rooms[roomId].players[socket.id].filteredAnswer = content;
    updatePlayers(roomId);

    io.to(socket.id).emit("answer_submitted", content);

    if (rooms[roomId].numSubmitted == rooms[roomId].numPlayers) {
      io.to(roomId).emit("voting_phase", {});
    }
  });

  socket.on("regenerate_answer", async ({ roomId }) => {
    console.log(roomId);
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
  });

  socket.on("send_vote", ({ roomId, vote }) => {
    rooms[roomId].players[socket.id].vote = vote;
    console.log(rooms[roomId].players);
  });
};

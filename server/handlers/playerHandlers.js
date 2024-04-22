
const { getFips } = require("crypto");
const geminiHandlers = require("./geminiHandlers");
const fs = require("fs");

const characters = JSON.parse(fs.readFileSync("characters.json", "utf-8"));


module.exports = function playerHandlers(socket, io, rooms) {
  const updatePlayers = (roomId) => {
      if(rooms[roomId]) {
        const playerTemp = Object.values(rooms[roomId].players);
        const socketIdTemp = Object.keys(rooms[roomId].players);
        const idx = socketIdTemp.indexOf(socket.id);
        io.to(roomId).emit("update_players", playerTemp);
        socket.emit("update_index", idx);
        console.log(rooms);
    }
  };

  const getRandomChars = (roomId) => {
    const randChars = [];
    for (let i = 0; i < 3; i++) {
      const randIndex = Math.floor(Math.random() * characters.length);
      if(rooms[roomId].characters.includes(characters[randIndex])) {
        i--;
      } else {
        randChars[i] = characters[randIndex];
        rooms[roomId].characters.push(characters[randIndex]);
      }
    }
    // Default to first selected
    rooms[roomId].players[socket.id].character = randChars[0];
    return randChars;
  };

  const getFilteredResponse = async (character, answer) => {
    const geminiFilter = await geminiHandlers(character, answer);
    const content = await geminiFilter(character, answer);

    return content;
  };

  socket.on("submit_answer", async ({ roomId, answer }) => {
    rooms[roomId].players[socket.id].answers = answer;
    rooms[roomId].numSubmitted++;

    const content = await getFilteredResponse(rooms[roomId].players[socket.id].character, answer);
    //console.log(content);

    rooms[roomId].players[socket.id].filteredAnswer = content;
    updatePlayers(roomId);

    if (rooms[roomId].numSubmitted == rooms[roomId].numPlayers) {
      io.to(roomId).emit("voting_phase", {});
    }
  });

  socket.on("regenerate_answer", async ({ roomId }) => {
    console.log(roomId);
    const content = await getFilteredResponse(rooms[roomId].players[socket.id].character, rooms[roomId].players[socket.id].answers);
    console.log(content);

    rooms[roomId].players[socket.id].filteredAnswer = content;

    updatePlayers(roomId);
    socket.emit("answer_regenerated");
  });

  socket.on("get_char_options", ({roomId}) => {
    const characters = getRandomChars(roomId);
    socket.emit("update_char_options", characters);
    //console.log(rooms[roomId]);
  });

  socket.on("select_char", ({character, roomId}) => {
    rooms[roomId].players[socket.id].character = character;
    console.log(rooms[roomId]);
  });
};

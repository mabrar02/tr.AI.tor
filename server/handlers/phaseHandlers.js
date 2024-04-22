const fs = require("fs");

const prompts = JSON.parse(fs.readFileSync("prompts.json", "utf-8"));

const getRandomPrompt = () => {
  const randIndex = Math.floor(Math.random() * prompts.length);
  const randPrompt = prompts[randIndex];

  return randPrompt;
};

module.exports = function phaseHandlers(socket, io, rooms) {
  socket.on("start_game", (roomId) => {
    io.to(roomId).emit("game_started", {});
  });

  socket.on("request_prompt", (roomId) => {
    rooms[roomId].numSubmitted = 0;
    const prompt = getRandomPrompt();

    io.to(roomId).emit("get_prompt", {
      prompt: prompt,
    });
  });

  socket.on("request_answers", (roomId) => {
    const answers = rooms[roomId].answers;
    const answersWithUserInfo = {};

    for (const playerId in answers) {
      if (answers.hasOwnProperty(playerId)) {
        const username = rooms[roomId].players[playerId].username;

        answersWithUserInfo[playerId] = {
          id: playerId,
          answer: answers[playerId],
          username: username,
        };
      }
    }
    console.log(answersWithUserInfo);
    io.to(roomId).emit("get_answers", answersWithUserInfo);
  });
};

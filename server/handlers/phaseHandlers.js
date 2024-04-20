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
    const prompt = getRandomPrompt();
    console.log(prompt);

    io.to(roomId).emit("get_prompt", {
      prompt: prompt,
    });
  });
};

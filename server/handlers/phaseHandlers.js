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
    const randTraitor = Math.floor(Math.random() * rooms[roomId].numPlayers);

    let i = 0;
    Object.keys(rooms[roomId].players).forEach((key) => {
      if (i == randTraitor) {
        rooms[roomId].players[key].role = "Imposter";
      } else {
        rooms[roomId].players[key].role = "Innocent";
      }
      i++;
    });

    console.log(rooms[roomId].players);
  });

  socket.on("request_prompt", (roomId) => {
    rooms[roomId].numSubmitted = 0;
    const prompt = getRandomPrompt();
    rooms[roomId].currentPrompt = prompt;

    io.to(roomId).emit("get_prompt", {
      prompt: prompt,
    });
  });

  socket.on("request_answers", (roomId) => {
    const prompt = rooms[roomId].currentPrompt;
    const answers = rooms[roomId].answers;
    const answersWithUserInfo = {};
  });
  //  socket.on("request_answers", (roomId) => {
  //    const answers = rooms[roomId].answers;
  //    const answersWithUserInfo = {};
  //
  //    for (const playerId in answers) {
  //      if (answers.hasOwnProperty(playerId)) {
  //        const username = rooms[roomId].players[playerId].username;
  //
  //        answersWithUserInfo[playerId] = {
  //          id: playerId,
  //          answer: answers[playerId],
  //          username: username,
  //        };
  //      }
  //    }
  //    console.log(answersWithUserInfo);
  //    io.to(roomId).emit("get_answers", answersWithUserInfo);
  //  });

  socket.on("tally_votes", (roomId) => {
    const votee_dict = {};

    Object.keys(rooms[roomId].players).forEach((key) => {
      voter = rooms[roomId].players[key].username;
      votee = rooms[roomId].players[key].vote;
      if (!votee_dict.hasOwnProperty(votee)) {
        votee_dict[votee] = { votes: 1, voters: [] };
      } else {
        votee_dict[votee]["votes"] += 1;
      }
      votee_dict[votee]["voters"].push(voter);
    });

    io.to(roomId).emit("get_tally_votes", votee_dict);
    console.log(votee_dict);
  });
};

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
        rooms[roomId].players[key].role = "Traitor";
      } else {
        rooms[roomId].players[key].role = "Innocent";
      }
      i++;
    });
  });

  socket.on("request_prompt", (roomId) => {
    rooms[roomId].numSubmitted = 0;
    rooms[roomId].round += 1;
    const prompt = getRandomPrompt();
    rooms[roomId].currentPrompt = prompt;

    console.log(prompt);

    io.to(roomId).emit("get_prompt", prompt);
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

  socket.on("tally_votes", (roomId) => {
    const votee_dict = {};
    let most_voted = {};
    let most_votes = 0;

    Object.keys(rooms[roomId].players).forEach((key) => {
      if (rooms[roomId].players[key].vote != "") {
        voter = rooms[roomId].players[key].username;
        votee = rooms[roomId].players[key].vote;
        if (!votee_dict.hasOwnProperty(votee)) {
          votee_dict[votee] = { votes: 1, voters: [], role: "" };
        } else {
          votee_dict[votee]["votes"] += 1;
        }
        votee_dict[votee]["voters"].push(voter);
      } else {
        // Need to handle did not vote case
      }
    });

    Object.keys(rooms[roomId].players).forEach((key) => {
      if (
        Object.keys(votee_dict).includes(rooms[roomId].players[key].username)
      ) {
        votee_dict[rooms[roomId].players[key].username]["role"] =
          rooms[roomId].players[key].role;
      }
    });

    io.to(roomId).emit("get_tally_votes", votee_dict);

    Object.entries(votee_dict).forEach(([player, value]) => {
      if (value["votes"] > most_votes) {
        most_voted = {};
        most_voted[player] = value["role"];
        most_votes = value["votes"];
      } else if (value["votes"] == most_votes) {
        most_voted[player] = value["role"];
      }
    });

    console.log(votee_dict);

    // Need to define multiple imposter case
    Object.entries(most_voted).forEach(([player, role]) => {
      if (role == "Traitor" && most_votes >= rooms[roomId].numPlayers - 1) {
        io.to(roomId).emit("vote_decision", { decision: true, player: player });
      } else {
        io.to(roomId).emit("vote_decision", { decision: false, player: "" });
      }
    });
  });

  socket.on("reset_round", (roomId) => {
    Object.values(rooms[roomId].players).forEach((value) => {
      value["vote"] = "";
      value["answer"] = "";
      value["filteredAnswer"] = "";
    });
  });
};

const { time } = require("console");
const fs = require("fs");

const prompts = JSON.parse(fs.readFileSync("prompts.json", "utf-8"));

const delay = (duration) => {
  return new Promise((resolve) => setTimeout(resolve, duration));
};

module.exports = function phaseHandlers(socket, io, rooms) {
  socket.on("start_game", (roomId) => {
    io.to(roomId).emit("game_started", {});
    let i = 0;

    let randTraitor = Math.floor(Math.random() * rooms[roomId].numPlayers);
    Object.keys(rooms[roomId].players).forEach((key) => {
      if (i == randTraitor) {
        rooms[roomId].players[key].role = "Traitor";
      } else {
        rooms[roomId].players[key].role = "Innocent";
      }
      i++;
    });
  });

  const recentMessages = new Map();

  const getRandomPrompt = (roomId) => {
    const randIndex = Math.floor(Math.random() * prompts.length);
    let randPrompt = prompts[randIndex];

    if (randPrompt.includes("<PLAYER")) {
      const randPlayerUser = getRandomUser(roomId);
      randPrompt = randPrompt.replace("<PLAYER>", randPlayerUser);
    }

    return randPrompt;
  };

  const getRandomUser = (roomId) => {
    const players = Object.values(rooms[roomId].players);
    const randPlayerIndex = Math.floor(Math.random() * players.length);
    const randPlayerUsername = players[randPlayerIndex].username;

    return randPlayerUsername;
  };

  socket.on("request_prompt", (roomId) => {
    const currentTime = Date.now();
    const lastTime = recentMessages.get(socket.id);
    if (!lastTime || currentTime - lastTime > 500) {
      recentMessages.set(socket.id, currentTime);
      rooms[roomId].round += 1;
      io.to(roomId).emit("update_round", rooms[roomId].round);

      rooms[roomId].numSubmitted = 0;
      const prompt = getRandomPrompt(roomId);
      rooms[roomId].currentPrompt = prompt;

      console.log(prompt);

      io.to(roomId).emit("get_prompt", prompt);
    }
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
    console.log(rooms[roomId].players);

    // Need to define multiple imposter case
    if (Object.keys(most_voted).length !== 0) {
      Object.entries(most_voted).forEach(([player, role]) => {
        if (role == "Traitor" && most_votes >= rooms[roomId].numPlayers - 1) {
          io.to(roomId).emit("vote_decision", {
            decision: true,
            player: player,
          });
        } else {
          io.to(roomId).emit("vote_decision", { decision: false, player: "" });
        }
      });
    } else {
      io.to(roomId).emit("vote_decision", { decision: false, player: "" });
    }
  });

  socket.on("reset_round", (roomId) => {
    Object.values(rooms[roomId].players).forEach((value) => {
      value["vote"] = "";
      value["answer"] = "";
      value["filteredAnswer"] = "";
      value["sab"] = false;
    });
  });

  socket.on("return_to_lobby", (roomid) => {
    io.to(roomid).emit("players_return_to_lobby");
  });

  const startTimer = (roomId) => {
    const interval = setInterval(() => {
      if (rooms[roomId]) {
        if (rooms[roomId].timer > 0) {
          rooms[roomId].timer -= 1;

          io.to(roomId).emit("timer_update", rooms[roomId].timer);
        } else {
          rooms[roomId].timerActive = false;
          io.to(roomId).emit("timer_expired");
          rooms[roomId].numSubmitted = 0;
          clearInterval(interval);
        }
      }
    }, 1000);
  };

  socket.on("start_timer", ({ roomId, phase }) => {
    if (rooms[roomId].timerActive) return;
    let time = 0;
    switch (phase) {
      case "lobby":
        time = 3;
        break;
      case "characters":
        time = 20;
        break;
      case "prompts":
        time = 90;
        break;
      case "voting":
        time = 45;
        break;
      case "post-votes":
        time = 5; //Hardcoded in voting file
        break;
    }

    rooms[roomId].timerActive = true;
    rooms[roomId].timer = time;
    startTimer(roomId);
    io.to(roomId).emit("timer_max", time);
    io.to(roomId).emit("timer_update", rooms[roomId].timer);
  });

  socket.on("set_timer", ({ roomId, time }) => {
    rooms[roomId].timer = time;
    io.to(roomId).emit("timer_update", rooms[roomId].timer);
  });

  socket.on("start_showing_responses", async (roomId) => {
    let index = 0;
    let time_to_show;

    for (const [player, value] of Object.entries(rooms[roomId].players)) {
      io.to(roomId).emit("show_response_index", index);
      time_to_show = (value.filteredAnswer.length / 50) * 2500 + 3000;
      index++;
      await delay(time_to_show);
    }

    io.to(roomId).emit("show_response_index", index);
  });
};

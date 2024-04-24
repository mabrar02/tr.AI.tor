import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";

function Voting() {
  const { isHost, players, updatePlayers, joinCode, userName, socket, prompt } =
    useGameRoom();

  const [timer, setTimer] = useState(10);
  const [selected, selectSelect] = useState("");
  const [tallyVotes, updateTallyVotes] = useState({});
  const [timesUp, setTimesUp] = useState(false);

  useEffect(() => {
    socket?.on("get_tally_votes", (votee_dict) => {
      updateTallyVotes(votee_dict);
    });

    return () => {
      socket?.off("get_tally_votes");
    };
  }, []);

  // For timer
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer((timer) => {
        if (timer == 0) {
          clearInterval(intervalId);
          setTimesUp(true);
        } else {
          return timer - 1;
        }
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // To transition after timer end
  useEffect(() => {
    if (timer == 0 && isHost) {
      socket.emit("tally_votes", joinCode);
    }
  }, [timer]);

  const selectResponse = (index) => {
    selectSelect(index);
  };

  const sendVote = () => {
    socket.emit("send_vote", { roomId: joinCode, vote: selected });
  };

  function getRandomColor() {
    //Generates random color for lobby players (bkg of text)
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  }
  return (
    <div>
      {timer > 0 && (
        <div>
          Time left: {timer} Prompt: {prompt}
          <div className="flex-row justify-center">
            {players.map((player, index) => (
              <div
                key={index}
                className={`${
                  selected == player.username ? "bg-cyan-200" : "bg-slate-200"
                } m-4`}
                onClick={() => selectResponse(player.username)}
              >
                <p>Player: {player.username}</p>
                <p>Answer: {player.filteredAnswer}</p>
              </div>
            ))}
          </div>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 font-bold py-2 px-4 rounded-lg shadow-md transform transition-all hover:scale-105"
            onClick={sendVote}
          >
            {selected == ""
              ? "Who is the imposter?"
              : `${selected} is the imposter!`}
          </button>
        </div>
      )}

      {timesUp && (
        <div>
          Prompt: {prompt}
          <div className="flex-row justify-center">
            The results are in!<br></br>
            {Object.entries(tallyVotes).map(([votee, value]) => (
              <div
                key={votee}
                className="font-bold rounded-lg py-2 px-5 inline-block border border-black shadow shadow-lg mb-4 mx-1"
                style={{ backgroundColor: getRandomColor() }}
              >
                <p>Player: {votee}</p>
                {Object.entries(value).map(([key, value2]) => (
                  <div key={key}>
                    {key == "votes" && <p>Number of Votes: {value2}</p>}
                    {key == "voters" && <p>Voters: {value2.join(", ")} </p>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Voting;

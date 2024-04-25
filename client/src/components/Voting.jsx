import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";

function Voting() {
  const {
    isHost,
    players,
    updatePlayers,
    joinCode,
    transitionToGamePhase,
    userName,
    prompt,
    socket,
    roundNum,
    setRoundValue,
    setGameOver,
  } = useGameRoom();

  const [timer, setTimer] = useState(10);
  const [phase, setPhase] = useState("Voting");
  const [selected, selectSelect] = useState("");
  const [tallyVotes, updateTallyVotes] = useState({});
  const [voteText, setVoteText] = useState("");

  useEffect(() => {
    socket?.on("get_tally_votes", (votee_dict) => {
      updateTallyVotes(votee_dict);
    });

    socket?.on("vote_decision", (decision) => {
      voteDecision(decision);
    });

    return () => {
      socket?.off("get_tally_votes");
      socket?.off("vote_decision");
    };
  }, [socket]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer((timer) => {
        if (timer == 0) {
          clearInterval(intervalId);
        } else {
          return timer - 1;
        }
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // To transition after timer end
  useEffect(() => {
    if (timer == 0 && phase == "Voting") {
      if (isHost) {
        socket?.emit("tally_votes", joinCode);
      }
      setPhase("Post-Votes");
   }
  }, [timer]);

  const selectResponse = (index) => {
    selectSelect(index);
  };

  const sendVote = () => {
    socket?.emit("send_vote", { roomId: joinCode, vote: selected });
  };

  const voteDecision = ({ decision, player }) => {
    if (decision) {
      setVoteText(`${player} has been found as the traitor!`);
      
      if(players.length > 5) {
        // multiple traitors
      } else {
        setGameOver({innowin: true})
        setTimeout(() => {
          transitionToGamePhase("ending");
        }, 5000);
      }

    } else {
      console.log(roundNum);
      if(roundNum == 3) {
        setVoteText("No conclusive traitor was found... game over.");
        setGameOver({innowin: false});
        setTimeout(() => {
          transitionToGamePhase("ending");
        }, 5000);

      } else {
        setVoteText("No conclusive traitor was found... try again.");
        if (isHost) {
          socket.emit("reset_round", joinCode);
        }
        players.forEach((player) => {
          player.filteredAnswer = "";
          player.vote = "";
        });

        setTimeout(() => {
          transitionToGamePhase("prompts");
        }, 10000);
 
      }
    }


  };

  return (
    <div>
      {phase == "Voting" && (
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

      {phase == "Post-Votes" && (
        <div>
          Prompt: {prompt}
          <div className="flex-row justify-center">
            The results are in!<br></br>
            {Object.entries(tallyVotes).map(([votee, value]) => (
              <div
                key={votee}
                className="font-bold rounded-lg py-2 px-5 inline-block border border-black shadow shadow-lg mb-4 mx-1 bg-white"
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
          <div className="bg-yellow-500 font-bold py-2 px-4 rounded-lg shadow-md transform transition-all">
            {voteText}
          </div>
        </div>
      )}
    </div>
  );
}

export default Voting;

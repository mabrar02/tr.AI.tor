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
    timer,
  } = useGameRoom();

  const [phase, setPhase] = useState("voting");
  const [nextPhase, setNextPhase] = useState("resetting");
  const [selected, selectSelect] = useState("");
  const [tallyVotes, updateTallyVotes] = useState({});
  const [voteText, setVoteText] = useState("");

  useEffect(() => {
    if (isHost) {
      socket?.emit("start_timer", { roomId: joinCode, phase: phase });
    }
  }, [phase]);

  useEffect(() => {
    socket?.on("get_tally_votes", (votee_dict) => {
      updateTallyVotes(votee_dict);
    });

    socket?.on("vote_decision", (decision) => {
      voteDecision(decision);
    });

    socket?.on("timer_expired", () => {
      if (phase === "voting") {
        if (isHost) {
          socket?.emit("tally_votes", joinCode);
        }
        setPhase("post-votes");
      } else if (phase === "post-votes") {
        if (nextPhase === "ending") {
          transitionToGamePhase("ending");
        } else if (nextPhase === "resetting") {
          transitionToGamePhase("prompts");
        }
      }
    });

    return () => {
      socket?.off("get_tally_votes");
      socket?.off("vote_decision");
      socket?.off("timer_expired");
    };
  }, [socket, phase, nextPhase]);

  const selectResponse = (index) => {
    selectSelect(index);
  };

  const sendVote = () => {
    socket?.emit("send_vote", { roomId: joinCode, vote: selected });
  };

  const voteDecision = ({ decision, player }) => {
    if (decision) {
      setVoteText(`${player} has been found as the traitor!`);
      setGameOver({ innowin: true });
      setNextPhase("ending");
    } else {
      if (roundNum == 3) {
        setVoteText("No conclusive traitor was found... game over.");
        setGameOver({ innowin: false });
        setNextPhase("ending");
      } else {
        setVoteText("No conclusive traitor was found... try again.");
        setNextPhase("resetting");
        if (isHost) {
          socket.emit("reset_round", joinCode);
        }

        players.forEach((player) => {
          player.filteredAnswer = "";
          player.vote = "";
        });
      }
    }
  };

  return (
    <div>
      {phase == "voting" && (
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

      {phase == "post-votes" && (
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

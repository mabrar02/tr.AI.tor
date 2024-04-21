import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";

function AnswerPrompts({ socket }) {
  const {
    isHost,
    players,
    updatePlayers,
    joinCode,
    userName,
    transitionToGamePhase,
  } = useGameRoom();

  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isHost) {
      socket.emit("request_prompt", joinCode);
    }
  }, []);

  useEffect(() => {
    socket.on("update_players", (players) => {
      updatePlayers(players);
    });

    socket.on("get_prompt", (promptRes) => {
      setPrompt(promptRes.prompt);
    });

    socket.on("voting_phase", () => {
      console.log(players);
      transitionToGamePhase("responses");
    });

    return () => {
      socket.off("update_players");
      socket.off("get_prompt");
      socket.off("voting_phase");
    };
  }, []);

  const submitAnswer = () => {
    console.log(answer);
    setSubmitted(true);
    socket.emit("submit_answer", { roomId: joinCode, answer });
  };

  return (
    <div className="flex justify-center">
      {!submitted ? (
        <div className="bg-lime-400 w-[15rem] h-[10rem] text-center">
          <h1>PROMPT: {prompt}</h1>
          <input
            type="test"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          ></input>

          <button className="bg-blue-200" onClick={submitAnswer}>
            Submit Answer
          </button>
        </div>
      ) : (
        <div className="bg-cyan-600 w-[15rem] h-[10rem] text-center text-white">
          You've submitted! Waiting on all other player submissions...
        </div>
      )}
    </div>
  );
}

export default AnswerPrompts;

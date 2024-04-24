import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";

function AnswerPrompts() {
  const {
    isHost,
    players,
    updatePlayers,
    joinCode,
    userName,
    transitionToGamePhase,
    index,
    prompt,
    socket,
    setPrompt,
  } = useGameRoom();

  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(90);
  const [regenCount, setRegenCount] = useState(3);
  const [updatingResponse, setUpdatingResponse] = useState(false);

  useEffect(() => {
    if (isHost) {
      socket?.emit("request_prompt", joinCode);
    }

    return () => {
      socket?.off("request_prompt");
    };
  }, [socket]);

  // For timer
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer((timer) => {
        return timer - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // To transition after timer end
  useEffect(() => {
    if (timer < 1) {
      transitionToGamePhase("voting");
    }
  }, [timer]);

  useEffect(() => {
    socket?.on("get_prompt", (promptRes) => {
      setPrompt(promptRes.prompt);
    });

    socket?.on("voting_phase", () => {
      console.log(players);
      if (timer > 20) {
        setTimer(10); // After all players submit, set timer to 20 seconds
      }
    });

    socket?.on("answer_regenerated", () => {
      setUpdatingResponse(false);
    });

    return () => {
      socket?.off("get_prompt");
      socket?.off("voting_phase");
      socket?.off("answer_regenerated");
    };
  }, [socket]);

  const submitAnswer = () => {
    console.log(answer);
    socket?.emit("submit_answer", { roomId: joinCode, answer });
    setSubmitted(true);
  };

  const regenerateAnswer = () => {
    if (regenCount > 0) {
      socket?.emit("regenerate_answer", { roomId: joinCode });
      setRegenCount(regenCount - 1);
      setUpdatingResponse(true);
    }
  };

  return (
    <div>
      <div className="flex justify-center">
        <div className="bg-blue-400 w-[15rem] h-[10rem] text-center">
          <h2>
            Time left: <br></br>
            <b>{timer}!</b>
          </h2>
        </div>
        {!submitted && (
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
        )}

        {submitted && (
          <div className="bg-cyan-600 w-[15rem] h-[10rem] text-center text-white">
            You've submitted! Waiting on all other player submissions...
          </div>
        )}
      </div>

      {submitted && (
        <div className="flex flex-col items-center w-[40rem] justify-center bg-black text-white">
          <p>Your filtered answer:</p>
          <p>{players[index].filteredAnswer}</p>
          <button
            className={`${
              regenCount == 0 ? "bg-yellow-800" : "bg-yellow-200"
            } px-10 py-2 text-black`}
            onClick={regenerateAnswer}
          >
            {updatingResponse ? "..." : "Regenerate Answer"} (x{regenCount})
          </button>
        </div>
      )}
    </div>
  );
}

export default AnswerPrompts;

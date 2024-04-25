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
    setPrompt
  } = useGameRoom();

  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(90);
  const [regenCount, setRegenCount] = useState(3);
  const [updatingResponse, setUpdatingResponse] = useState(false);

  useEffect(() => {
    if (isHost) {
      socket?.emit("request_prompt", joinCode);

      return () => {
        socket?.off("request_prompt");
      };
    };


  }, [socket]);

  // For timer
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer(timer => {
        return timer - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // To transition after timer end
  useEffect(() => {
    if(timer < 1) {
      transitionToGamePhase("voting");
    }
  }, [timer]);


  useEffect(() => {
    socket?.on("get_prompt", (promptRes) => {
      setPrompt(promptRes.prompt);
    });

    socket?.on("voting_phase", () => {
      console.log(players);
      if(timer > 20) {
        setTimer(1); // After all players submit, set timer to 20 seconds
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
    setSubmitted(true);
    socket?.emit("submit_answer", { roomId: joinCode, answer });
  };

  const regenerateAnswer = () => {
    if(regenCount > 0) {
      socket?.emit("regenerate_answer", {roomId: joinCode});
      setRegenCount(regenCount-1);
      setUpdatingResponse(true);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center w-full h-screen bg-red-500">
        <div className="font-bold text-5xl w-full h-[5rem] text-center relative">
          <h2 className="pt-12">Time left: <br></br><b>{timer}!</b></h2>
          <div className="absolute top-0 left-0 w-full h-10 bg-yellow-600">
            <div className="h-full bg-yellow-200 animate-timer" style = {{ width: `${timer}%`}}></div>
          </div>
        </div>

        {!submitted && (
          <div className="mt-60 text-1xl bg-lime-400 w-[15rem] h-[10rem] text-center">
            <h1>PROMPT: {prompt}</h1>
            <input
              type="test"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            ></input>

            <button className="bg-yellow-400 hover:bg-yellow-600 font-bold py-2 px-4 rounded-lg border-b-4 border-l-2 border-yellow-700 shadow-md transform transition-all hover:scale-105 active:border-yellow-600" onClick={submitAnswer}>
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
            <button className={`${regenCount == 0 ? 'bg-yellow-800' : 'bg-yellow-200'} px-10 py-2 text-black`} onClick={regenerateAnswer}>
              {updatingResponse ? '...' : 'Regenerate Answer'} (x{regenCount})
            </button>
          </div>
        )}
    </div>
  );
}

export default AnswerPrompts;

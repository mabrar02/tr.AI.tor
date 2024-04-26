import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";
import { motion } from "framer-motion";

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
        <div className="font-bold text-3xl w-full h-[5rem] text-center relative">
          <h2 className="bg-gray-900 text-white">Time left: <b>{timer + "s"}</b></h2>
          <div className="absolute bot-0 left-0 w-full h-10 bg-yellow-600 shadow-md">
            <motion.div
            initial={{ width: "100%" }} //Initial width (full width)
            animate={{ width: `${timer}%` }} //Animated width based on the timer 
            className="h-full bg-yellow-300 animate-timer border-b-4 border-l-2 border-yellow-500" style = {{ width: `${timer}%`}}>
            </motion.div>
          </div>
        </div>

        {!submitted && (
          <div className="font-bold mt-60 text-xl bg-orange-400 w-[40rem] h-[10rem] text-center">
            <h1 className="">PROMPT: {prompt}</h1>
            <input
              className="mt-2"
              type="test"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            ></input>

            <button className="mt-4 mx-auto block bg-yellow-400 hover:bg-yellow-600 font-bold py-2 px-4 rounded-lg border-b-4 border-l-2 border-yellow-700 shadow-md transform transition-all hover:scale-105 active:border-yellow-600" onClick={submitAnswer}>
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

import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";
import { motion } from "framer-motion";

function ResponseBox() {
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
    role,
    roundNum,
    setRoundValue,
    timer,
    gamePhase,
  } = useGameRoom();
  const [answer, setAnswer] = useState("");
  const [filteredAnswer, setFilteredAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [regenCount, setRegenCount] = useState(3);
  const [updatingResponse, setUpdatingResponse] = useState(false);

  useEffect(() => {
    socket?.on("answer_regenerated", (content) => {
      setFilteredAnswer(content);
      setUpdatingResponse(false);
    });

    socket?.on("answer_submitted", (content) => {
      setFilteredAnswer(content);
    });

    return () => {
      socket?.off("answer_regenerated");
      socket?.off("answer_submitted");
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
    <div className="bg-green-400 w-[55%] h-[30%] mt-10 flex-col flex items-center rounded-3xl">
      <textarea
        className="px-4 py-2 border border-gray-300 rounded-2xl resize-none w-[80%] h-[50%] focus:outline-none mt-10"
        placeholder="Enter your answer..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <button
        onClick={submitAnswer}
        className="bg-yellow-400 hover:bg-yellow-600 font-bold py-2 px-4 rounded-lg border-b-4 border-l-2 border-yellow-700 shadow-md transform transition-all hover:scale-105 active:border-yellow-600 mt-6"
      >
        Submit Answer
      </button>

      {submitted && (
        <div className="flex flex-col items-center w-[40rem] justify-center bg-black text-white">
          {role === "Traitor" ? (
            <div>
              <p>Your answer will NOT be filtered:</p>
              <p>{filteredAnswer}</p>
            </div>
          ) : (
            <div>
              <p className="text-center">Your filtered answer:</p>
              <p>{filteredAnswer}</p>
              <div className="text-center">
                {timer > 5 && (
                  <button
                    className={`${
                      regenCount == 0 || updatingResponse
                        ? "bg-yellow-800"
                        : "bg-yellow-200"
                    } px-10 py-2 text-black my-2`}
                    onClick={regenerateAnswer}
                  >
                    {updatingResponse ? "..." : "Regenerate Answer"} (x
                    {regenCount})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ResponseBox;

import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";
import { motion } from "framer-motion";
import PromptBanner from "./PromptBanner";
import ResponseBox from "./ResponseBox";
import TransitionToPrompts from "./TransitionToPrompts";

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
  const [transition, setTransition] = useState(true);

  useEffect(() => {
    if (isHost) {
      socket?.emit("request_prompt", joinCode);
    }
  }, []);

  useEffect(() => {
    socket?.on("get_prompt", (prompt) => {
      setPrompt(prompt);
      setRoundValue(roundNum + 1);
    });

    socket?.on("timer_expired", () => {
      transitionToGamePhase("responses");
    });

    socket?.on("answer_regenerated", (content) => {
      setFilteredAnswer(content);
      setUpdatingResponse(false);
    });

    socket?.on("answer_submitted", (content) => {
      setFilteredAnswer(content);
    });

    return () => {
      socket?.off("timer_expired");
      socket?.off("get_prompt");
      socket?.off("answer_regenerated");
      socket?.off("answer_submitted");
    };
  }, [socket]);

  useEffect(() => {
    const timer = setTimeout(() => {
        setTransition(false);
      }, 8000);

    const timer2 = setTimeout(() => {
        if(isHost) {
          socket?.emit("start_timer", { roomId: joinCode, phase: gamePhase });
        }
      }, 9000);

      return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
      }
  }, []);

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
       { transition && (
        <TransitionToPrompts />
      )} 

      <div className="h-screen w-screen items-center flex-col flex">
        <PromptBanner />

        <div className="h-[30%] w-full flex flex-col justify-center "></div> 
        <ResponseBox />
        <span>Answer honestly!</span>


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
    </div>
  );
}

export default AnswerPrompts;

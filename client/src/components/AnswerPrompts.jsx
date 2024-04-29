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
  const animDuration = 8; // Duration of the transition animation

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
        setTransition(false); // For end of transition
      }, animDuration * 1000);

    const timer2 = setTimeout(() => {
        if(isHost) {
          socket?.emit("start_timer", { roomId: joinCode, phase: gamePhase });
        }
      }, animDuration * 1000 + 1000);

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
        <PromptBanner time={animDuration} />

        <div className="h-[30%] w-full flex flex-col justify-center "></div> {/*Dummy div*/}
        <ResponseBox time={animDuration}/>
        <span>Answer honestly!</span>



      </div>
    </div>
  );
}

export default AnswerPrompts;

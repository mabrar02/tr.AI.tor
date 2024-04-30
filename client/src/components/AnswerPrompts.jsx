import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";
import { AnimatePresence, motion } from "framer-motion";
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
    selectedChar,
    setSelectedChar,
  } = useGameRoom();

  const [answer, setAnswer] = useState("");
  const [filteredAnswer, setFilteredAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [regenCount, setRegenCount] = useState(3);
  const [updatingResponse, setUpdatingResponse] = useState(false);
  const [transition, setTransition] = useState(true);
  const [transitionOut, setTransitionOut] = useState(false);
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
      setTransitionOut(true)
      const timer = setTimeout(() => {
        clearTimeout(timer);
        transitionToGamePhase("responses");
      },  1000);
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
        <PromptBanner time={animDuration} animate={true} />

        <div className="h-[30%] w-full flex flex-col justify-center "></div> {/*Dummy div*/}

        <div className="w-screen flex-grow flex flex-col items-center overflow-hidden">
        <AnimatePresence>
          {!transitionOut && (
            <motion.div className="w-screen flex-grow flex flex-col items-center"
                key={0}
                animate={{ y: '0' }} 
                exit={{y: '100vh' }}
                transition={{ duration: 1, bounce: 0.2, delay: 0, type: 'spring' }} 
                >
              {role === "Innocent" && (
              <span className="mt-2">Answer honestly! The {selectedChar} will translate for you.</span>
              )}

              {role === "Traitor" && (
              <span className="mt-2">Try to deceive the others into thinking you're an AI!</span>
              )}
              <ResponseBox time={animDuration}/>
            </motion.div>
          )}
        </AnimatePresence>

        </div>
      </div>
    </div>
  );
}

export default AnswerPrompts;

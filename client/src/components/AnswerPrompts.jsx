import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";
import { AnimatePresence, motion } from "framer-motion";
import PromptBanner from "./PromptBanner";
import ResponseBox from "./ResponseBox";
import TransitionToPrompts from "./TransitionToPrompts";
import PowerUps from "./PowerUps";

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
    sabotageCount,
    updateSabotageCount,
  } = useGameRoom();

  const [transition, setTransition] = useState(true);
  const [transitionOut, setTransitionOut] = useState(false);
  const animDuration = 8; // Duration of the transition animation
  const [powerUpsVisible, setPowerUpsVisible] = useState(false);
  const [sabbed, setSabbed] = useState(false);

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
      setTransitionOut(true);
      const timer = setTimeout(() => {
        clearTimeout(timer);
        transitionToGamePhase("responses");
      }, 1000);
    });

    return () => {
      socket?.off("timer_expired");
      socket?.off("get_prompt");
    };
  }, [socket]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTransition(false); // For end of transition
    }, animDuration * 1000);

    const timer2 = setTimeout(() => {
      if (isHost) {
        socket?.emit("start_timer", { roomId: joinCode, phase: gamePhase });
      }
    }, animDuration * 1000 + 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  const togglePowerPanel = () => {
    if (sabotageCount <= 0) {
      alert("out of sabs");
    } else if (sabbed) {
      alert("already sabbed");
    } else {
      setPowerUpsVisible(!powerUpsVisible);
    }
  };

  const handleSabotage = (index) => {
    socket.emit("sabotage_player", {
      roomId: joinCode,
      username: players[index].username,
    });
    setSabbed(true);
    updateSabotageCount(sabotageCount - 1);
    setPowerUpsVisible(false);
  };

  return (
    <div>
      {transition && <TransitionToPrompts />}
      <div className="h-screen w-screen items-center flex-col flex">
        {role === "Traitor" && (
          <>
            <button
              className="min-w-14 overflow-hidden absolute left-4 mt-2 top-1/3 text-center w-[10%] bg-red-400 hover:bg-red-600 font-bold py-2 px-4 rounded-lg border-b-4 border-l-2 border-red-700 shadow-md transform transition-all hover:scale-105 active:border-red-600 nowrap"
              style={{ zIndex: 1 }}
              onClick={togglePowerPanel}
            >
              <p>Sabotage</p>
            </button>
            <PowerUps visible={powerUpsVisible} onSabotage={handleSabotage} />
          </>
        )}
        <PromptBanner time={animDuration} animate={true} />
        <div className="h-[30%] w-full flex flex-col justify-center "></div>{" "}
        {/*Dummy div*/}
        <div className="w-screen flex-grow flex flex-col items-center overflow-hidden">
          <AnimatePresence>
            {!transitionOut && (
              <motion.div
                className="w-screen flex-grow flex flex-col items-center"
                key={0}
                animate={{ y: "0" }}
                exit={{ y: "100vh" }}
                transition={{
                  duration: 1,
                  bounce: 0.2,
                  delay: 0,
                  type: "spring",
                }}
              >
                {role === "Innocent" && (
                  <span className="mt-2">
                    Answer honestly! The {selectedChar} will translate for you.
                  </span>
                )}

                {role === "Traitor" && (
                  <span className="mt-2">
                    Try to deceive the others into thinking you're an AI!
                  </span>
                )}

                <ResponseBox time={animDuration} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default AnswerPrompts;

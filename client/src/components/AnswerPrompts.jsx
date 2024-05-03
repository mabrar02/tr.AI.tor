import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";
import { AnimatePresence, motion } from "framer-motion";
import PromptBanner from "./PromptBanner";
import ResponseBox from "./ResponseBox";
import TransitionToPrompts from "./TransitionToPrompts";
import PowerUps from "./PowerUps";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import useSound from "use-sound";

import wooshSoundFile from "../assets/sfx/wooshSFX.mp3";
import soundFile from "../assets/sfx/clickSFX.wav";
import hoverSoundFile from "../assets/sfx/hoverSFX.wav";
import errorSoundFile from "../assets/sfx/errorSFX.mp3";
import popSoundFile from "../assets/sfx/popSFX.wav";

function AnswerPrompts() {
  const [playWooshSound] = useSound(wooshSoundFile, { volume: 0.02 });
  const [play] = useSound(soundFile, { volume: 0.1 });
  const [playHoverSound] = useSound(hoverSoundFile, { volume: 0.05 });
  const [playErrorSound] = useSound(errorSoundFile, { volume: 0.1 });
  const [playPopSound] = useSound(popSoundFile, { volume: 0.1 });

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
      const timer = setTimeout(() => {
        socket?.emit("request_prompt", joinCode);
        clearTimeout(timer);
      }, 300);
    }
  }, []);

  useEffect(() => {
    socket?.on("get_prompt", (prompt) => {
      setPrompt(prompt);
    });

    socket?.on("update_round", (round) => {
      setRoundValue(round);
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
      notify("You're out of sabotages!", "error");
    } else if (sabbed) {
      notify("You've already sabotaged this round!", "error");
    } else {
      playWooshSound();
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
    notify("Successful Sabotage", "successful");
  };

  const notify = (msg, type) => {
    const existingToastId = toast.isActive("notification");

    if (existingToastId) {
      toast.update(existingToastId, {
        render: msg,
        type: type === "error" ? toast.TYPE.ERROR : toast.TYPE.SUCCESS,
      });
    } else {
      if (type === "error") {
        playErrorSound();
        toast.error(msg, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
          toastId: "notification", // Set a specific toastId
        });
      } else {
        playPopSound();
        toast.success(msg, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
          toastId: "notification", // Set a specific toastId
        });
      }
    }
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
              onMouseEnter={() => playHoverSound()}
              onClick={togglePowerPanel}
            >
              <p>Sabotage x{sabotageCount}</p>
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

      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="colored"
        transition={Bounce}
      />
    </div>
  );
}

export default AnswerPrompts;

import React, { useEffect, useState } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";
import PromptBanner from "./PromptBanner";
import { AnimatePresence, motion } from "framer-motion";
import useSound from "use-sound";

import wooshSoundFile from "../assets/sfx/wooshSFX.mp3";

function SeeResponses() {
  const [playWooshSound] = useSound(wooshSoundFile, { volume: 0.02 });

  const {
    gamePhase,
    transitionToGamePhase,
    isHost,
    setHostStatus,
    players,
    updatePlayers,
    joinCode,
    setJoinCodeValue,
    userName,
    setUserNameValue,
    socket,
  } = useGameRoom();

  const [currentResIndex, setCurrentResIndex] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  const [showBottomText, setShowBottomText] = useState(true);

  useEffect(() => {
    if (isHost) {
      const timer = setTimeout(() => {
        socket?.emit("start_showing_responses", joinCode);
        clearTimeout(timer);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    socket?.on("show_response_index", (index) => {
      setCurrentResIndex(index);
      setShowResponse(true);
    });

    return () => {
      socket?.off("show_response_index");
    };
  }, [socket]);

  useEffect(() => {
    if (currentResIndex === players.length) {
      setShowResponse(false);
      setShowBottomText(false);
      const timer = setTimeout(() => {
        clearTimeout(timer);
        transitionToGamePhase("voting");
      }, 2000);
    }
  }, [currentResIndex]);

  return (
    <div>
      <div className="h-screen w-screen items-center flex-col flex">
        <PromptBanner animate={false} />

        <div className="relative w-screen flex-grow justify-center flex-col overflow-hidden">
          <AnimatePresence>
            {showBottomText && (
              <motion.div
                className="flex justify-center mt-5"
                key={999}
                initial={{ y: "-100vh" }}
                animate={{ y: "0" }}
                exit={{ y: "-100vh" }}
                transition={{
                  duration: 0.5,
                  bounce: 0.2,
                  delay: 0,
                  type: "spring",
                }}
              >
                <h1>Time's up! Let's take a look at these responses...</h1>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-screen h-full justify-center flex flex-grow overflow-hidden pt-5">
            <AnimatePresence>
              {showResponse &&
                currentResIndex < players.length &&
                (playWooshSound(),
                (
                  <motion.div
                    className="flex-1 p-4 text-black absolute w-[65%]"
                    key={currentResIndex}
                    initial={{ x: "-100vw" }}
                    animate={{ x: "0" }}
                    exit={{ x: "100vw" }}
                    transition={{
                      duration: 1,
                      bounce: 0.2,
                      delay: 0,
                      type: "spring",
                    }}
                  >
                    <div
                      className="font-bold py-2 px-5 border border-black shadow shadow-lg mb-4 mx-1 wx-5 rounded-tr-xl rounded-br-xl rounded-tl-md w-[100%] relative"
                      style={{ backgroundColor: "white" }}
                    >
                      <p className="mb-5">
                        {players[currentResIndex]?.username}:
                      </p>
                      <p>
                        {players[currentResIndex]?.sab
                          ? players[currentResIndex]?.answers
                          : players[currentResIndex]?.filteredAnswer}
                      </p>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeeResponses;

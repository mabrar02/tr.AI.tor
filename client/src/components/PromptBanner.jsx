import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";
import { AnimatePresence, motion } from "framer-motion";
import useSound from "use-sound";

import promptSoundFile from "../assets/sfx/promptSFX.wav";

function PromptBanner(props) {
  const [playPromptSound] = useSound(promptSoundFile, { volume: 0.2 });

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
    timerMax,
  } = useGameRoom();

  return (
    <motion.div
      className={`w-full h-[30vh] flex flex-col justify-center ${
        props.animate ? "absolute" : "relative"
      }`}
      style={{ zIndex: 3 }}
      initial={{ y: "30vh", height: "50vh" }}
      animate={{ y: 0, height: "30vh" }}
      transition={
        props.animate
          ? {
              duration: 0.25,
              bounce: 0.5,
              delay: props.time + 2,
              type: "spring",
            }
          : { duration: 0 }
      } //Banner move up
    >
      <div
        className="bg-black text-white h-5/6 flex justify-center items-center"
        style={{ zIndex: 2 }}
      >
        <motion.div
          className="sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl line-clamp-2 text-wrap w-[60%] h-fit flex items-center font-bold p-1 justify-center overflow-visible"
          initial={{ rotate: 0 }}
          animate={{ rotate: 0 }}
          transition={
            props.animate
              ? {
                  duration: 0.1,
                  bounce: 1,
                  delay: props.time + 2.1,
                  type: "spring",
                }
              : { duration: 0 }
          } // Text rotate
        >
          <AnimatePresence>
            <motion.span
              className="absolute w-[60%] text-center"
              key={prompt}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={
                props.animate || props.animateprompt
                  ? {
                      duration: 0.5,
                      bounce: 0.5,
                      delay: props.time + 0.5,
                      type: "spring",
                    }
                  : { duration: 0 }
              } // Text Pop up
            >
              {prompt}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      <motion.div
        className="w-full h-1/6 bg-yellow-600 shadow-md relative"
        style={{ zIndex: 1 }}
        initial={{ y: "-16.6vh" }}
        animate={{ y: 0 }}
        transition={
          props.animate
            ? {
                duration: 0.25,
                bounce: 0.5,
                delay: props.time + 2,
                type: "spring",
              }
            : { duration: 0 }
        } // Timer pop down
      >
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: `${(timer / timerMax) * 100}%` }}
          className="h-full bg-yellow-300 animate-timer border-b-4 border-l-2 border-yellow-500 absolute top-0 left-0"
          transition={
            props.animate || props.timeranimate
              ? { ease: "linear", duration: 1 }
              : { duration: 0 }
          }
        ></motion.div>

        <div className="flex justify-center items-center h-full relative z-1 ">
          {timer > 0 && (
            <span className="text-white font-bold text-2xl ">
              {timer}s remaining!
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default PromptBanner;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGameRoom } from "../contexts/GameRoomContext";

function PromptBanner() {
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

  return (
    <motion.div className="w-full flex flex-col justify-center absolute" style={{zIndex:3}} 
        initial={{ y: '30vh', height: '50vh'}} 
        animate={{ y: 0, height: '30vh' }} 
        transition={{ duration: 0.25, bounce: 0.5, delay: 10, type: 'spring' }} //Banner move up 
      >

      <div className="bg-black text-white h-5/6 flex justify-center items-center" style={{zIndex:2}}>
        <motion.div className="sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl line-clamp-2 text-wrap w-[80%] h-fit flex items-center font-bold p-1 justify-center overflow-visible"
        initial={{ rotate: 0 }} 
        animate={{ rotate: 0 }}
        transition={{ duration: 0.1, bounce: 1, delay: 10.1, type: 'spring' }} // Text rotate
        >

              <motion.span className=""
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ duration: 0.5, bounce: 0.5, delay: 8.5, type: 'spring' }} // Text Pop up
              >{prompt}</motion.span>

          </motion.div> 
        </div>

      <motion.div className="w-full h-1/6 bg-yellow-600 shadow-md relative" style={{zIndex:1}}
        initial={{ y: '-16.6vh' }} 
        animate={{ y: 0 }} 
        transition={{ duration: 0.25, bounce: 0.5, delay: 10, type: 'spring' }} // Timer pop down
      >
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: `${(timer / 90) * 100}%` }}
          className="h-full bg-yellow-300 animate-timer border-b-4 border-l-2 border-yellow-500 absolute top-0 left-0"
          transition={{ease: "linear", duration: 1}}
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

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
    <div className="h-[30%] w-full flex flex-col justify-center">
      <div className="bg-black text-white h-5/6 flex justify-center items-center">
        <div className="sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl line-clamp-2 text-wrap w-[80%] h-fit flex items-center font-bold p-1">
          <span className="">{prompt}</span>
        </div>
      </div>
      <div className="w-full h-1/6 bg-yellow-600 shadow-md relative">
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: `${(timer / 90) * 100}%` }}
          className="h-full bg-yellow-300 animate-timer border-b-4 border-l-2 border-yellow-500 absolute top-0 left-0"
          style={{ width: `${timer}%` }}
        ></motion.div>
        <div className="flex justify-center items-center h-full relative z-10">
          {timer > 0 && (
            <span className="text-white font-bold text-2xl ">
              {timer}s remaining!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default PromptBanner;

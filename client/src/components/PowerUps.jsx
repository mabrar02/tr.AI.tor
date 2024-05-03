import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";
import { motion, AnimatePresence } from "framer-motion";

function PowerUps({ visible, onSabotage }) {
  const {
    isHost,
    players,
    updatePlayers,
    joinCode,
    transitionToGamePhase,
    userName,
    prompt,
    socket,
    gameOver,
    setRoundValue,
  } = useGameRoom();

  const sabotage = (index) => {
    onSabotage(index);
  };

  return (
    <div className="rounded-xl absolute w-[10%] h-[50%] left-4 mt-16 top-1/3 min-w-14 ">
      <motion.div
        className="w-full h-full flex-col flex"
        initial={visible ? { x: "-100%", opacity: 0 } : { x: 0, opacity: 1 }}
        animate={visible ? { x: 0, opacity: 1 } : { x: "-100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, duration: 0.5 }}
      >
        {players.map(
          (player, index) =>
            player.username !== userName && (
              <div key={index} className="flex w-full">
                <button
                  className="active:scale-95 text-center font-bold rounded-lg border-b-4 border-l-2 border border-black shadow-lg my-1 h-[10%] min-h-10 w-full transition-all hover:scale-105 overflow-hidden"
                  style={{
                    backgroundColor: player ? player.color : "#636363",
                    zIndex: 1,
                  }}
                  onClick={() => sabotage(index)}
                >
                  <p>{player.username}</p>
                </button>
              </div>
            )
        )}
      </motion.div>
    </div>
  );
}

export default PowerUps;

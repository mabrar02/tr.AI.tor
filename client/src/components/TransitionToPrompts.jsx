import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGameRoom } from "../contexts/GameRoomContext";
import './css/styles.css';

function TransitionToPrompts() {
  const {
    isHost,
    players,
    updatePlayers,
    joinCode,
    transitionToGamePhase,
    userName,
    prompt,
    socket,
    roundNum,
    setRoundValue,
    setGameOver,
  } = useGameRoom();

  return (
    <div className="overflow-hidden" style={{width: '100%', height: '100%', position: 'absolute', left: '0', top: '0', zIndex: 5}}>
    <div className="slider-container transition-container">
      <div className="sliding-word">
        <p><i>Round {roundNum}!</i></p>
        {roundNum == 1 && (
          <p>Try and get a feel for who's the traitor... 🕵️</p>
        )}
        {roundNum == 2 && (
          <p>The traitor is stil at large! Try and narrow down the suspects...</p>
        )}
        {roundNum == 3 && (
          <p>Last chance! If you don't catch the traitor this round, they will win!</p>
        )}
      </div>
    </div>
    </div>
  );
}

export default TransitionToPrompts;

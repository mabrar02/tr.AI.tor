import React, { createContext, useState, useContext } from "react";

const GamePhaseContext = createContext();

export const useGamePhase = () => useContext(GamePhaseContext);

export const GamePhaseProvider = ({ children }) => {
  const [gamePhase, setGamePhase] = useState("lobby");

  const transitionToGamePhase = (phase) => {
    setGamePhase(phase);
  };

  return (
    <GamePhaseContext.Provider value={{ gamePhase, transitionToGamePhase }}>
      {children}
    </GamePhaseContext.Provider>
  );
};

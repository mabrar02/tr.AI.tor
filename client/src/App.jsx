import React from "react";
import { useGamePhase } from "./contexts/GamePhaseContext";
import Lobby from "./components/Lobby";

const App = () => {
  const { gamePhase, transitionToGamePhase } = useGamePhase();

  const handleStartGame = () => {
    transitionToGamePhase("game");
  };
  console.log(gamePhase);
  return (
    <div>
      {gamePhase === "lobby" && <Lobby onStartGame={handleStartGame} />}
    </div>
  );
};

export default App;

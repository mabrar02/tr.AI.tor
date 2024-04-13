import React from "react";
import { useGamePhase } from "./contexts/GamePhaseContext";
import Lobby from "./components/Lobby";
import AnswerPrompts from "./components/AnswerPrompts";

const App = () => {
  const { gamePhase, transitionToGamePhase } = useGamePhase();

  const handleStartGame = () => {
    transitionToGamePhase("prompts");
  };

  console.log(gamePhase);
  return (
    <div>
      {gamePhase === "lobby" && <Lobby onStartGame={handleStartGame} />}
      {gamePhase === "prompts" && <AnswerPrompts />}
    </div>
  );
};

export default App;

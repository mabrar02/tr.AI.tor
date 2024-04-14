import React from "react";
import { useGameRoom } from "./contexts/GameRoomContext";
import Lobby from "./components/Lobby";
import AnswerPrompts from "./components/AnswerPrompts";

const App = () => {
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
  } = useGameRoom();

  return (
    <div>
      {gamePhase === "lobby" && <Lobby onStartGame={transitionToGamePhase} />}
      {gamePhase === "prompts" && <AnswerPrompts />}
    </div>
  );
};

export default App;

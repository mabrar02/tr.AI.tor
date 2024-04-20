import React from "react";
import { useGameRoom } from "./contexts/GameRoomContext";
import Lobby from "./components/Lobby";
import AnswerPrompts from "./components/AnswerPrompts";
import SeeResponses from "./components/SeeResponses";

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
    promptInput,
    setPromptInputValue,
    socket
  } = useGameRoom();

  return (
    <div>
      {gamePhase === "lobby" && <Lobby onStartGame={transitionToGamePhase} />}
      {gamePhase === "prompts" && <AnswerPrompts />}
      {gamePhase === "responses" && <SeeResponses />}
    </div>
  );
};

export default App;

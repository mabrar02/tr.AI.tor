import React from "react";
import { useGameRoom } from "./contexts/GameRoomContext";
import Lobby from "./components/Lobby";
import AnswerPrompts from "./components/AnswerPrompts";
import Voting from "./components/Voting";
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
      {gamePhase === "lobby" && <Lobby socket={socket} />}
      {gamePhase === "prompts" && <AnswerPrompts socket={socket} />}
      {gamePhase === "voting" && <Voting socket={socket} />}
    </div>
  );
};

export default App;

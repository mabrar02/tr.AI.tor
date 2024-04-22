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
    socket,
    index,
    setIndex
  } = useGameRoom();

  return (
    <div>
      {gamePhase === "lobby" && <Lobby socket={socket} />}
      {gamePhase === "responses" && <SeeResponses />}
      {gamePhase === "prompts" && <AnswerPrompts socket={socket} />}
      {gamePhase === "voting" && <Voting socket={socket} />}
    </div>
  );
};

export default App;

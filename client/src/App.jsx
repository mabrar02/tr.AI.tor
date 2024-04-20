import React from "react";
import { useGameRoom } from "./contexts/GameRoomContext";
import Lobby from "./components/Lobby";
import AnswerPrompts from "./components/AnswerPrompts";
import io from "socket.io-client";
import Voting from "./components/Voting";

const socket = io("http://localhost:4000");

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
      {gamePhase === "lobby" && <Lobby socket={socket} />}
      {gamePhase === "prompts" && <AnswerPrompts socket={socket} />}

      {gamePhase === "voting" && <Voting socket={socket} />}
    </div>
  );
};

export default App;

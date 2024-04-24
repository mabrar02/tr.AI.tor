import React from "react";
import { useGameRoom } from "./contexts/GameRoomContext";
import Lobby from "./components/Lobby";
import CharacterSelect from "./components/CharacterSelect";
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
    setIndex,
  } = useGameRoom();

  return (
    <div>
      {gamePhase === "lobby" && <Lobby />}
      {gamePhase === "characters" && <CharacterSelect />}
      {gamePhase === "responses" && <SeeResponses />}
      {gamePhase === "prompts" && <AnswerPrompts />}
      {gamePhase === "voting" && <Voting />}
    </div>
  );
};

export default App;

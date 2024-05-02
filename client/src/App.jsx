import React from "react";
import { useGameRoom } from "./contexts/GameRoomContext";
import Lobby from "./components/Lobby";
import CharacterSelect from "./components/CharacterSelect";
import AnswerPrompts from "./components/AnswerPrompts";
import Voting from "./components/Voting";
import SeeResponses from "./components/SeeResponses";
import Ending from "./components/Ending";

const App = () => {
  const { gamePhase } = useGameRoom();

  return (
    <div>
      {gamePhase === "lobby" && <Lobby />}
      {gamePhase === "characters" && <CharacterSelect />}
      {gamePhase === "prompts" && <AnswerPrompts />}
      {gamePhase === "responses" && <SeeResponses />}
      {gamePhase === "voting" && <Voting />}
      {gamePhase === "ending" && <Ending />}
    </div>
  );
};

export default App;

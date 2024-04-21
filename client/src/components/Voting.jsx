import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";

function Voting({ socket }) {
  const { isHost, players, updatePlayers, joinCode, userName } = useGameRoom();

  const [playerAnswers, setPlayerAnswers] = useState({});
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    if (isHost) {
      socket.emit("request_answers", joinCode);
    }
  }, []);

  useEffect(() => {
    socket.on("update_players", (players) => {
      updatePlayers(players);
    });

    socket.on("get_answers", (answersRes) => {
      setPlayerAnswers(answersRes.answers);
      setPrompt(answersRes.prompt);
    });

    return () => {
      socket.off("update_players");
      socket.off("get_answers");
    };
  }, []);

  return (
    <div>
      <h1>PROMPT: {prompt}</h1>
      <div className="flex-row justify-center">
        {Object.keys(playerAnswers).map((playerId) => (
          <div key={playerId} className="bg-slate-300 w-[20rem] m-4">
            <p>Player: {playerAnswers[playerId].username}</p>
            <p>Answer: {playerAnswers[playerId].answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Voting;

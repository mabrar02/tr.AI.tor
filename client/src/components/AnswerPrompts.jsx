import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";

function AnswerPrompts({ socket }) {
  const { isHost, players, updatePlayers, joinCode, userName } = useGameRoom();

  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    if (isHost) {
      socket.emit("request_prompt", joinCode);
    }
  }, []);

  useEffect(() => {
    socket.on("update_players", (players) => {
      updatePlayers(players);
    });

    socket.on("get_prompt", (promptRes) => {
      setPrompt(promptRes.prompt);
    });

    return () => {
      socket.off("update_players");
      socket.off("get_prompt");
    };
  }, []);

  return (
    <div className="flex justify-center">
      <div className="bg-lime-400 w-[15rem] h-[10rem] text-center">
        {isHost && <h1>HOST</h1>}
        <h1>PROMPT: {prompt}</h1>
        <h1></h1>
        <input></input>
      </div>
    </div>
  );
}

export default AnswerPrompts;

import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";

function CharacterSelect() {
  const {
    isHost,
    players,
    updatePlayers,
    joinCode,
    userName,
    socket,
    transitionToGamePhase,
  } = useGameRoom();
  const [charOptions, setCharOptions] = useState([]);
  const [role, setRole] = useState([]);

  useEffect(() => {
    socket?.on("update_char_options", (res) => {
      setRole(res.role);
      setCharOptions(res.characters);
    });

    return () => {
      socket?.off("update_char_options");
    };
  }, [socket]);

  useEffect(() => {
    if (isHost) {
      console.log(joinCode);
      socket?.emit("get_char_options", { roomId: joinCode });
    }
    const timer = setTimeout(() => {
      transitionToGamePhase("prompts");
    }, 8000);
    return () => {
      socket?.off("get_char_options");
      clearTimeout(timer);
    };
  }, []);

  const selectChar = (character) => {
    socket.emit("select_char", { character: character, roomId: joinCode });
  };

  return (
    <div>
      {role === "Traitor" ? (
        <p>You are the traitor! Try to blend in</p>
      ) : (
        <ul className="-mx-2 my-10">
          {charOptions.map((character, index) => (
            <li
              key={index}
              className="font-bold rounded-lg py-2 px-5 inline-block border border-black shadow shadow-lg mb-4 mx-1"
              style={{ backgroundColor: "white" }}
              onClick={() => selectChar(charOptions[index])}
            >
              {charOptions[index]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CharacterSelect;

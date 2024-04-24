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
  const [charOptions, updateCharOptions] = useState([]);

  useEffect(() => {
    if (isHost) {
      console.log(joinCode);
      socket?.emit("get_char_options", { roomId: joinCode });
    }

    socket?.on("update_char_options", (characters) => {
      updateCharOptions(characters);
    });

    return () => {
      socket?.off("get_char_options");
      socket?.off("update_char_options");
    };
  }, [socket]);

  useEffect(() => {
    const timer = setTimeout(() => {
      transitionToGamePhase("prompts");
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const selectChar = (character) => {
    socket.emit("select_char", { character: character, roomId: joinCode });
  };

  return (
    <div>
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
    </div>
  );
}

export default CharacterSelect;

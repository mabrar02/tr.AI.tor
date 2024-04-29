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
    gamePhase,
    role,
    timer,
    setRoleValue,
  } = useGameRoom();
  const [charOptions, setCharOptions] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [transition, setTransition] = useState(false);

  useEffect(() => {
    socket?.on("update_char_options", (res) => {
      setRoleValue(res.role);
      setCharOptions(res.characters);
    });

    socket?.on("timer_expired", () => {
      if (selectedChar !== null) {
        selectChar(selectedChar);
      }
      setTransition(true);
      const timer = setTimeout(() => {
        transitionToGamePhase("prompts")
      }, 2000);
    });

    return () => {
      socket?.off("update_char_options");
      socket?.off("timer_expired");
      clearTimeout(timer);
    };
  }, [socket]);

  useEffect(() => {
    if (isHost) {
      console.log(joinCode);
      socket?.emit("get_char_options", { roomId: joinCode });
      socket?.emit("start_timer", { roomId: joinCode, phase: gamePhase });
    }

    return () => {
      socket?.off("get_char_options");
      socket?.off("start_timer");
    };
  }, []);

  const selectChar = (character) => {
    socket?.emit("select_char", { character: character, roomId: joinCode });
  };

  return (
    <div>
      {transition === true && (
        <div className="transition-container closing-container"></div>
      )}

      {role === "Traitor" ? (
        <p>You are the traitor! Try to blend in.</p>
      ) : submitted ? (
        <p>
          You've chosen to be a {selectedChar}, waiting for other players...
        </p>
      ) : (
        <div>
          <ul className="-mx-2 my-10">
            {charOptions.map((character, index) => (
              <li
                key={index}
                className={`font-bold rounded-lg py-2 px-5 inline-block border border-black shadow shadow-lg mb-4 mx-1 ${
                  charOptions[index] === selectedChar
                    ? "bg-red-300"
                    : "bg-white"
                }`}
                onClick={() => setSelectedChar(charOptions[index])}
              >
                {charOptions[index]}
              </li>
            ))}
          </ul>
          <button
            className="bg-red-300"
            onClick={() => {
              if (selectedChar !== null) {
                setSubmitted(true);
                selectChar(selectedChar);
              } else {
                alert("Select a char before submit");
              }
            }}
          >
            Submit
          </button>
        </div>
      )}
      <p>{timer}</p>
    </div>
  );
}

export default CharacterSelect;

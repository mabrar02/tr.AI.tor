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

  useEffect(() => {
    socket?.on("update_char_options", (res) => {
      setRoleValue(res.role);
      setCharOptions(res.characters);
    });

    socket?.on("timer_expired", () => {
      if (selectedChar !== null) {
        selectChar(selectedChar);
      }
      transitionToGamePhase("prompts");
    });

    return () => {
      socket?.off("update_char_options");
      socket?.off("timer_expired");
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
      {role === "Traitor" ? (
        <p className="font-bold text-5xl text-white bg-gray-800 py-20 px-20 border-2 border-red-700 outline outline-red-500 rounded-lg bg-gradient-to-b from-black to-red-950 w-full">
          You are the traitor! Try to blend in.
        </p> //
      ) : submitted ? (
        <p>
          You've chosen to be a {selectedChar}, waiting for other players...
        </p>
      ) : (
        <div className="bg-gray-800 p-10 rounded-lg border-b-8 border-l-8 border-gray-900 border-black flex flex-col justify-center items-center">
          <p className="text-white font-semibold text-2xl">
            Choose your AI Character.
          </p>
          <div className="-mx-2 my-10">
            {charOptions.map((character, index) => (
              <div className="flex w-full bg-red-400">
                <button
                  key={index}
                  className={`mx-1.5 w-full font-bold rounded-lg py-2 px-5 inline-block border-4 border-blue-300 shadow-lg mb-4 mx-1 transform transition-all hover:scale-105 hover:border-blue-500 ${
                    charOptions[index] === selectedChar
                      ? "bg-blue-200 border-blue-500"
                      : "bg-white"
                  } hover:shadow-lg active:border-blue-400`}
                  onClick={() => setSelectedChar(charOptions[index])}
                >
                  <div className="flex items-center justify-center">
                    <div className="my-10 w-10 h-10 border border-black mb-20 bg-pink-600 rounded-lg"></div>
                  </div>
                  <span className="px-20">{charOptions[index]}</span>
                </button>
              </div>
            ))}
          </div>

          <button
            className="bg-yellow-400 hover:bg-yellow-600 font-bold py-2 px-12 rounded-lg shadow-md border border-black transform transition-all hover:scale-105"
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
      <p className="font-medium">{"Game starts in: " + timer}</p>
    </div>
  );
}

export default CharacterSelect;

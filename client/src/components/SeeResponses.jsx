import React, { useEffect, useState } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";

function SeeResponses() {
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
  } = useGameRoom();

  const [currentResIndex, setCurrentResIndex] = useState(0);

  useEffect(() => {
    if (isHost) {
      socket?.emit("start_showing_responses", joinCode);
    }
  }, []);

  useEffect(() => {
    socket?.on("show_response_index", (index) => {
      setCurrentResIndex(index);
    });

    return () => {
      socket?.off("show_response_index");
    };
  }, [socket]);

  useEffect(() => {
    if (currentResIndex === players.length) {
      transitionToGamePhase("voting");
    }
  }, [currentResIndex]);

  return (
    <div>
      <div className="flex justify-center">
        <div className="bg-red-500 w-[15rem] h-[5rem] text-center">
          <h1>PLAYER RESPONSES: </h1>
        </div>
      </div>
      <div>
        <div className="flex-1 bg-green-500 p-4 text-black">
          <div
            className="font-bold rounded-lg py-2 px-5 border border-black shadow shadow-lg mb-4 mx-1 wx-5"
            style={{ backgroundColor: "white" }}
          >
            {players[currentResIndex]?.filteredAnswer}
          </div>
          <p>Written by: {players[currentResIndex]?.username}</p>
        </div>
      </div>
    </div>
  );
}

export default SeeResponses;

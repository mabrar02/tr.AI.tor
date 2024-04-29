import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";

function Ending() {
  const {
    isHost,
    players,
    updatePlayers,
    joinCode,
    transitionToGamePhase,
    userName,
    prompt,
    socket,
    gameOver,
    setRoundValue,
  } = useGameRoom();

  useEffect(() => {
    socket?.on("players_return_to_lobby", () => {
      setRoundValue(0);
      transitionToGamePhase("lobby");
    });

    return () => {
      socket?.off("players_return_to_lobby");
    };
  }, [socket]);


  const returnToLobby = () => {
    socket.emit("return_to_lobby", joinCode);
  };

  return (
    <div className="text-center">
    {gameOver.innowin  && (
      <div className="flex-row justify-center">
        The Innocents have won!<br></br>
        {players.map((player, index) => (
          <div
            key={index}
            className="font-bold rounded-lg py-2 px-5 inline-block border border-black shadow shadow-lg mb-4 mx-1 bg-white"
          >
            <p>{player.username}</p>
            {player.role == "Traitor" ? (
              <p>The Traitor</p>
            ) :
              <p>The {player.character}</p>
            }
          </div>
        ))}
      </div>
    )}     


    {!gameOver.innowin && (
      <div className="flex-row justify-center">
        The Traitor has won!<br></br>
        {players.map((player, index) => (
          <div
            key={index}
            className="font-bold rounded-lg py-2 px-5 inline-block border border-black shadow shadow-lg mb-4 mx-1 bg-white text-center"
          >
            <p>{player.username}</p>
            {player.role == "Traitor" ? (
              <p>The Traitor</p>
            ) :
              <p>The {player.character}</p>
            }
          </div>
        ))}
      </div>
    )}      

      {isHost && (
        <button
          className="bg-yellow-500 hover:bg-yellow-600 font-bold py-2 px-4 rounded-lg shadow-md transform transition-all hover:scale-105"
          onClick={() => returnToLobby()}
        >
          Return to Lobby
        </button>
      )}

    </div>
  );
}

export default Ending;

import React, { useContext , useEffect, useState} from "react";
import { GameRoomProvider, useGameRoom } from "../contexts/GameRoomContext";

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
    promptInput,
    setPromptInputValue,
    socket
  } = useGameRoom();

  useEffect(() => {
    socket?.on("update_players", (players) => {
      updatePlayers(players);
    });

    return () => {
      socket?.off("update_players");
    };
  }, [socket]);

  return (
    <div>
      <div className="flex justify-center">
        <div className="bg-red-500 w-[15rem] h-[5rem] text-center">
          <h1>PLAYER RESPONSES: {gamePhase} </h1>
        </div>
      </div>
      <div>
            <p className="font-bold mb-2">Players:</p>


            <div class="flex">
              <div class="flex-2 bg-orange-500 p-4 text-black">Players
              
                <ul className="mx-5 ">
                  {players.map((player, index) => (
                    //Need players to consistently show distinctive colors, right now it shows diff colors for diff people
                    <li key={index} className="font-bold rounded-lg py-2 px-5 border border-black shadow shadow-lg mb-4 mx-1 wx-5" style={{ backgroundColor: "white" /*getRandomColor()*/ }}>
                      {player.username} {player.host && <span className="font-bold">(HOST)</span>}
                    </li>
                  ))}
                </ul>
              
              
              </div>
              <div class="flex-1 bg-green-500 p-4 text-black">Responses
               {players.map((player, index) => (
                    <li key={index} className="font-bold rounded-lg py-2 px-5 border border-black shadow shadow-lg mb-4 mx-1 wx-5" style={{ backgroundColor: "white" /*getRandomColor()*/, listStyleType:'none'}}>
                      {player.filteredAnswer}
                    </li>
                  ))}
              
              </div>
            </div>


      </div>
    </div>
  );
}

export default SeeResponses;

import React, { useContext , useEffect, useState} from "react";
import { GameRoomProvider, useGameRoom } from "../contexts/GameRoomContext";

function SeeResponses() {
  const {
    gamePhase,
    transitionToGamePhase,
    isHost,
    setHostStatus,
 //   players,
 //   updatePlayers,
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

    socket?.on("fetch_response", (username, responses) => {
      updateResponses(username, responses);
    });

    return () => {
      socket?.off("update_players");
      socket?.off("fetch_response");
    };
  }, [socket]);

  const send_response = () => {
      socket?.emit("send_prompt", 'tim', promptInput, "wizard");

  }
  
  const updateResponses = (username, responses) => {
    const updatedPlayers = players.map(player =>
      player.username == username ? {...player, response : responses } : player
    );
    console.log(players);
    setPlayers(updatedPlayers);
  }


  const [players, setPlayers] = useState([{username: "tim", host: false, response: "hi"}]);
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
              <div class="flex-3 bg-blue-500 p-4 text-black">Inputs (Temp)
              
                  {players.map((player, index) => (
                    <li key={index} className="font-bold rounded-lg py-2 px-5 border border-black shadow shadow-lg mb-4 mx-1 wx-5" style={{ backgroundColor: "white" /*getRandomColor()*/, listStyleType:'none'}}>
                      <textarea
                        placeholder="Enter your response"
                        className="w-64 py-2 px-4 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-300 mb-4"
                        value={promptInput}
                        onChange={(e) => setPromptInputValue(e.target.value)}
                      />
                      <button className="bg-yellow-500 hover:bg-yellow-600 font-bold py-2 px-4 rounded-lg shadow-md transform transition-all hover:scale-105" onClick={send_response}>
                        Send
                      </button>
                    </li>
                  ))}

              
              </div>
              <div class="flex-1 bg-green-500 p-4 text-black">Responses
               {players.map((player, index) => (
                    <li key={index} className="font-bold rounded-lg py-2 px-5 border border-black shadow shadow-lg mb-4 mx-1 wx-5" style={{ backgroundColor: "white" /*getRandomColor()*/, listStyleType:'none'}}>
                      {player.response}
                    </li>
                  ))}
              
              </div>
            </div>


      </div>
    </div>
  );
}

export default SeeResponses;

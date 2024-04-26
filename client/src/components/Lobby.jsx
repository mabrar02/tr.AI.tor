import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";
import { motion, AnimatePresence } from "framer-motion";

function Lobby() {
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

  const [inLobby, setInLobby] = useState(false);
  const [joinGame, setJoinGame] = useState(false);

  useEffect(() => {
    socket?.on("game_started", () => {
      transitionToGamePhase("characters");
    });

    return () => {
      socket?.off("game_started");
    };
  }, [socket]);

  function getRandomColor() {
    //Generates random color for lobby players (bkg of text)
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  }

  const handleHostRoom = () => {
    if (userName.length != 0) {
      setHostStatus(true);
      setInLobby(true);
      const code = generateRoomCode();
      setJoinCodeValue(code);
      socket?.emit("host_room", { roomId: code, username: userName });
    } else {
      alert("Please enter a username");
    }
  };

  const handleJoinRoom = () => {
    if (joinCode.length !== 4) {
      alert("Please enter a 4-letter code to join the room.");
      return;
    }
    socket?.emit(
      "join_room",
      { roomId: joinCode, username: userName },
      (roomExists) => {
        if (roomExists) {
          setInLobby(true);
        } else {
          alert("Room doesn't exist!");
        }
      }
    );
  };

  const generateRoomCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  const tryJoinGame = () => {
    if (userName.length != 0) {
      setJoinGame(true);
    } else {
      alert("Please enter a username");
    }
  };

  const handleStartGame = () => {
    socket?.emit("start_game", joinCode);
  };

  return (
    <div className="flex flex-col items-center w-100% h-screen bg-red-500 pt-32">
      <div className="mb-6">
        <h1 className="text-6xl">
          <b>TR.AI.TOR</b>
        </h1>
      </div>

      {!joinGame && !inLobby && (
        <div className="flex flex-col gap-y-2 text-center mb-60">
          <h2 className="font-bold">Username</h2>
          <input
            type="text"
            placeholder="Enter your username"
            className="w-64 py-2 px-4 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-300 mb-4"
            value={userName}
            onChange={(e) => setUserNameValue(e.target.value)}
          ></input>

          <button
            className="bg-yellow-400 hover:bg-yellow-600 font-bold py-2 px-4 rounded-lg border-b-4 border-l-2 border-yellow-700 shadow-md transform transition-all hover:scale-105 active:border-yellow-600"
            onClick={tryJoinGame}
          >
            Join Game
          </button>
          <button
            className="bg-yellow-400 hover:bg-yellow-600 font-bold py-2 px-4 rounded-lg border-b-4 border-l-2 border-yellow-700 shadow-md transform transition-all hover:scale-105 active:border-yellow-600"
            onClick={handleHostRoom}
          >
            Host Game
          </button>
        </div>
      )}

      {joinGame && !inLobby && (
        <div className="flex flex-col text-center gap-y-2 mb-60">
          <h2 className="font-bold">Room Code</h2>
          <input
            type="text"
            placeholder="Enter room code"
            className="w-64 py-2 px-4 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-300 mb-4"
            value={joinCode}
            onChange={(e) => setJoinCodeValue(e.target.value.toUpperCase())}
          ></input>

          <button
            className="bg-yellow-400 hover:bg-yellow-600 font-bold py-2 px-4 rounded-lg border-b-4 border-l-2 border-yellow-700 shadow-md transform transition-all hover:scale-105 active:border-yellow-600"
            onClick={handleJoinRoom}
          >
            Join
          </button>

          <button
            className="bg-yellow-400 hover:bg-yellow-600 font-bold py-2 px-4 rounded-lg border-b-4 border-l-2 border-yellow-700 shadow-md transform transition-all hover:scale-105 active:border-yellow-600"
            onClick={() => setJoinGame(false)}
          >
            Back
          </button>
        </div>
      )}

      {inLobby && (
        <div>
          <p className="font-bold text-xl mb-2">Players:</p>
          <ul className="-mx-2">
            <AnimatePresence>
              {players.map((player, index) => (
                //Need players to consistently show distinctive colors, right now it shows diff colors for diff people
                <motion.li
                  key={index}
                  initial={{ opacity: 0.5, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ease: "easeOut", duration: 0.2 }}
                  className="text-center font-bold rounded-lg py-2 px-10 border-b-4 border-l-2 border border-black shadow shadow-lg mb-2 mx-1"
                  style={{ backgroundColor: getRandomColor() }}
                >
                  {player.username}{" "}
                  {player.host && <span className="font-bold">(HOST)</span>}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {isHost && (
            <div className="flex justify-center pt-20">
              <button
                onClick={handleStartGame}
                className="bg-yellow-400 hover:bg-yellow-600 font-bold py-2 px-12 rounded-lg border-b-4 border-l-2 border-yellow-700 shadow-md transform transition-all hover:scale-105 active:border-yellow-600 mb-2"
              >
                Start Game
              </button>
            </div>
          )}

          <h2 className="text-xl font-bold flex justify-center">ROOM CODE:</h2>
          <h1 className="text-xl font-bold flex justify-center mb-6">
            <span
              className="ml-1 text-white text-6xl"
              style={{ WebkitTextStroke: "2px black" }}
            >
              {joinCode}
            </span>
          </h1>
        </div>
      )}
    </div>
  );
}

export default Lobby;

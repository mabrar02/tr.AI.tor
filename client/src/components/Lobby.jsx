import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

function Lobby({ onStartGame }) {
  const [isHost, setIsHost] = useState(false);
  const [inLobby, setInLobby] = useState(false);
  const [joinGame, setJoinGame] = useState(false);

  const [players, setPlayers] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    socket.on("update_players", (players) => {
      setPlayers(players);
    });

    return () => {
      socket.off("update_players");
    };
  }, []);

  const handleHostRoom = () => {
    if (userName.length != 0) {
      setIsHost(true);
      setInLobby(true);
      const code = generateRoomCode();
      setJoinCode(code);
      socket.emit("host_room", { roomId: code, username: userName });
    } else {
      alert("Please enter a username");
    }
  };

  const handleJoinRoom = () => {
    if (joinCode.length !== 4) {
      alert("Please enter a 4-letter code to join the room.");
      return;
    }
    socket.emit(
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

  const backBtnOnClick = () => {
    setIsHost(false);
    setInLobby(false);
    setJoinGame(false);
  };

  const handleStartGame = () => {
    onStartGame();
  };

  return (
    <div className="flex flex-col items-center w-100% bg-red-300">
      <div className="mb-6">
        <h1>TR.AI.TOR</h1>
      </div>

      {!joinGame && !inLobby && (
        <div className="flex flex-col gap-y-2 text-center">
          <h2>Username</h2>
          <input
            type="text"
            className="bg-slate-300"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          ></input>
          <button className="bg-blue-200" onClick={tryJoinGame}>
            Join Game
          </button>
          <button className="bg-blue-200" onClick={handleHostRoom}>
            Host Game
          </button>
        </div>
      )}

      {joinGame && !inLobby && (
        <div className="flex flex-col text-center gap-y-2">
          <h2>Room Code</h2>
          <input
            type="text"
            className="bg-slate-300"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          ></input>

          <button className="bg-blue-200" onClick={handleJoinRoom}>
            Join
          </button>

          <button className="bg-blue-200" onClick={() => setJoinGame(false)}>
            Back
          </button>
        </div>
      )}

      {inLobby && (
        <div>
          <h2>Room Code: {joinCode}</h2>
          <p>Players:</p>
          <ul>
            {players.map((player, index) => (
              <li key={index}>
                {player.username} {player.host && <span>(HOST)</span>}
              </li>
            ))}
          </ul>
          {isHost && (
            <button onClick={handleStartGame} className="bg-amber-400">
              Start Game
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Lobby;

import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

function Lobby() {
  const [isHost, setIsHost] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    socket.on("update_players", (players) => {
      setPlayers(players);
    });

    return () => {
      socket.off("update_players");
    };
  }, []);

  const handleHostRoom = () => {
    setIsHost(true);
    const code = generateRoomCode();
    setRoomCode(code);
    socket.emit("host_room", code);
  };

  const handleJoinRoom = () => {
    if (joinCode.length !== 4) {
      alert("Please enter a 4-letter code to join the room.");
      return;
    }
    socket.emit("join_room", joinCode);
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

  return (
    <div>
      <h1>Lobby</h1>
      {isHost ? (
        <div>
          <p>Room Code: {roomCode}</p>
          <p>Players:</p>
          <ul>
            {players.map((player, index) => (
              <li key={index}>{player}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <p>Join Code:</p>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          />
          <button onClick={handleJoinRoom}>Join Room</button>
        </div>
      )}
      <button onClick={handleHostRoom}>Host Room</button>
    </div>
  );
}

export default Lobby;

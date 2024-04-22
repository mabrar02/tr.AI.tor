import React, { createContext, useState, useContext, useEffect } from "react";
import io from "socket.io-client";

const GameRoomContext = createContext();

export const useGameRoom = () => useContext(GameRoomContext);

export const GameRoomProvider = ({ children }) => {
//const [gamePhase, setGamePhase] = useState("responses");
  const [gamePhase, setGamePhase] = useState("lobby");
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [userName, setUserName] = useState("");
  const [socket, setSocket] = useState(null);
  const [index, setIndex] = useState(0);
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);

    return () => newSocket.close();

  }, []);

  useEffect(() => {
    socket?.on("update_players", (players) => {
      updatePlayers(players);
    });
   
    socket?.on("update_index", (idx) => {
      setIndex(idx);
    });
    
    return () => {
      socket?.off("update_players");
      socket?.off("update_index");
    };
  }, [socket]);

  const transitionToGamePhase = (phase) => {
    setGamePhase(phase);
  };

  const setHostStatus = (status) => {
    setIsHost(status);
  };

  const updatePlayers = (updatedPlayers) => {
    setPlayers(updatedPlayers);
  };

  const setJoinCodeValue = (code) => {
    setJoinCode(code);
  };

  const setUserNameValue = (name) => {
    setUserName(name);
  };
  
  return (
    <GameRoomContext.Provider
      value={{
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
        index,
        setIndex,
        prompt,
        setPrompt
      }}
    >
      {children}
    </GameRoomContext.Provider>
  );
};

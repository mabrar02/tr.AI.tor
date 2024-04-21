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
  const [promptInput, setPromptInput] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);

    return () => newSocket.close();

  }, []);

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
  
  const setPromptInputValue = (input) => {
    setPromptInput(input);
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
        promptInput,
        setPromptInputValue,
        socket
      }}
    >
      {children}
    </GameRoomContext.Provider>
  );
};

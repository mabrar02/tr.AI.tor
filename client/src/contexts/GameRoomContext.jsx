import { useInstantLayoutTransition } from "framer-motion";
import React, { createContext, useState, useContext, useEffect } from "react";
import io from "socket.io-client";

const GameRoomContext = createContext();

export const useGameRoom = () => useContext(GameRoomContext);

export const GameRoomProvider = ({ children }) => {
  const [gamePhase, setGamePhase] = useState("lobby");
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [userName, setUserName] = useState("");
  const [socket, setSocket] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [role, setRole] = useState("Innocent");
  const [roundNum, setRoundNum] = useState(0);
  const [gameOver, setGameOver] = useState({});
  const [inLobby, setInLobby] = useState(false);

  useEffect(() => {
    //const newSocket = io("http://localhost:4000");
    const newSocket = io("https://ace-memento-418917.nn.r.appspot.com",
      {transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    socket?.on("update_players", (players) => {
      updatePlayers(players);
    });

    return () => {
      socket?.off("update_players");
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

  const setRoleValue = (gameRole) => {
    setRole(gameRole);
  };

  const setRoundValue = (roundNum) => {
    setRoundNum(roundNum);
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
        prompt,
        setPrompt,
        role,
        setRoleValue,
        roundNum,
        setRoundValue,
        gameOver,
        setGameOver,
        inLobby,
        setInLobby,
      }}
    >
      {children}
    </GameRoomContext.Provider>
  );
};

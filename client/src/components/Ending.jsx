import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";
import { motion, AnimatePresence } from "framer-motion";
import useSound from "use-sound";

import soundFile from "../assets/sfx/clickSFX.wav";
import hoverSoundFile from "../assets/sfx/hoverSFX.wav";
import innoWinSoundFile from "../assets/sfx/innocentWinSFX.wav";
import traitorWinSoundFile from "../assets/sfx/traitorWinSFX.wav";

function Ending() {
  // Hook for playing sound
  const [play] = useSound(soundFile, { volume: 0.3 });
  const [playHoverSound] = useSound(hoverSoundFile, { volume: 0.1 });
  const [playInnoWin] = useSound(innoWinSoundFile, { volume: 0.2 });
  const [playTraitorWin] = useSound(traitorWinSoundFile, { volume: 0.2 });

  // Function to play sound effect
  const soundFX = () => {
    play();
  };

  const playHoverSoundFX = () => {
    playHoverSound();
  };

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

  const [transition, setTransition] = useState(true);
  const [playEndSound, setPlayEndSound] = useState(false);

  useEffect(() => {
    socket?.on("players_return_to_lobby", () => {
      setRoundValue(0);
      transitionToGamePhase("lobby");
    });

    return () => {
      socket?.off("players_return_to_lobby");
    };
  }, [socket]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTransition(false);
      clearTimeout(timer);
      setPlayEndSound(true);
    }, 2000);
  }, []);

  useEffect(() => {
    if (playEndSound) {
      if (gameOver.innowin) {
        playInnoWin();
      } else {
        playTraitorWin();
      }
    }
  }, [playEndSound]);

  const returnToLobby = () => {
    socket.emit("reset", joinCode);

    socket.emit("return_to_lobby", joinCode);
  };

  return (
    <div className="text-center flex-col flex w-screen h-screen items-center">
      {transition === true && (
        <div className="transition-container opening-container"></div>
      )}

      {gameOver.innowin ? (
        <div className="w-[40%]">
          <motion.div
            className="w-full justify-center flex "
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              ease: "easeOut",
              duration: 0.4,
              type: "spring",
              stiffness: "200",
              damping: "5",
              delay: 2,
            }}
          >
            <div className="mt-24 border-8 border-blue-950 outline outline-blue-900 rounded-lg bg-blue-800 min-h-[12rem] min-w-96  p-4 flex flex-col justify-center items-center w-full">
              <h1
                className="text-yellow-400 xl:text-8xl lg:text-7xl text-6xl font-bold flex"
                style={{ textShadow: "-3px 3px 0px black" }}
              >
                Innocents Win!
              </h1>
            </div>
          </motion.div>
          {isHost && (
            <motion.button
              className="text-sm sm:text-md xl:text-lg overflow-hidden min-w-36 mt-10 w-[50%] h-[10%] bg-yellow-500 hover:bg-yellow-600 font-bold rounded-lg shadow-md transform transition-all hover:scale-105"
              onClick={() => returnToLobby()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                ease: "easeOut",
                duration: 0.6,
                delay: 2.3,
              }}
            >
              Return to Lobby
            </motion.button>
          )}
        </div>
      ) : (
        <div className="w-[40%]">
          <motion.div
            className="w-full justify-center flex "
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              ease: "easeOut",
              duration: 0.4,
              type: "spring",
              stiffness: "200",
              damping: "5",
              delay: 2,
            }}
          >
            <div className="mt-24 border-red-700 outline outline-red-500 rounded-lg bg-gradient-to-b from-black to-red-950 bg-gray-800rounded-lg  min-h-[12rem] min-w-96  p-4 flex flex-col justify-center items-center w-full">
              <h1
                className="text-white xl:text-8xl lg:text-7xl text-6xl font-bold flex"
                style={{ textShadow: "-3px 3px 0px black" }}
              >
                Traitor Wins!
              </h1>
            </div>
          </motion.div>
          {isHost && (
            <motion.button
              className="text-sm sm:text-md xl:text-lg overflow-hidden min-w-36 mt-10 w-[50%] h-[10%] bg-yellow-500 hover:bg-yellow-600 font-bold rounded-lg shadow-md transform transition-all hover:scale-105"
              onClick={() => returnToLobby()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                ease: "easeOut",
                duration: 0.6,
                delay: 2.3,
              }}
            >
              Return to Lobby
            </motion.button>
          )}
        </div>
      )}
      <div className="mt-10  w-[40%] h-full overflow-hidden">
        <ul className="w-full h-full ">
          <AnimatePresence>
            {players.map((player, index) => {
              return (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    ease: "easeOut",
                    duration: 0.2,
                    type: "spring",
                    stiffness: "200",
                    damping: "10",
                    delay: index * 0.1 + 2,
                  }}
                  className="text-center font-bold rounded-lg border-b-4 border-l-2 border border-black shadow-lg mb-2 h-[10%] min-h-10 mx-6"
                  style={{
                    backgroundColor: player ? player.color : "#636363",
                  }}
                >
                  <div className="flex justify-center">
                    <p>{player.username} - </p>
                    &nbsp;
                    {player.role == "Traitor" ? (
                      <p>The Traitor</p>
                    ) : (
                      <p>The {player.character}</p>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}

export default Ending;

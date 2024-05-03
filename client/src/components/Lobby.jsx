import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaInfoCircle } from "react-icons/fa";
import { Bounce, ToastContainer, toast } from "react-toastify";
import useSound from "use-sound";

import countdownFile from "../assets/sfx/countdownSFX.wav";
import soundFile from "../assets/sfx/clickSFX.wav";
import hoverSoundFile from "../assets/sfx/hoverSFX.wav";
import errorSoundFile from "../assets/sfx/errorSFX.mp3";
import popSoundFile from "../assets/sfx/popSFX.wav";

import "react-toastify/dist/ReactToastify.css";

function Lobby() {
  // Hook for playing sound
  const [play] = useSound(soundFile, { volume: 0.1 });
  const [playHoverSound] = useSound(hoverSoundFile, { volume: 0.05 });
  const [playErrorSound] = useSound(errorSoundFile, { volume: 0.1 });
  const [playPopSound] = useSound(popSoundFile, { volume: 0.1 });
  const [playcountdownSound] = useSound(countdownFile, { volume: 0.1 });

  // Function to play sound effect
  const soundFX = () => {
    play();
  };

  const playHoverSoundFX = () => {
    playHoverSound();
  };

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
    inLobby,
    setInLobby,
    timer,
  } = useGameRoom();

  const [joinGame, setJoinGame] = useState(false);
  const [enableBtns, setEnableBtns] = useState(true);

  useEffect(() => {
    socket?.on("game_started", () => {
      transitionToGamePhase("characters");
    });

    socket?.on("timer_expired", () => {
      if (isHost) {
        socket?.emit("start_game", joinCode);
      }
    });

    return () => {
      socket?.off("game_started");
      socket?.off("timer_expired");
    };
  }, [socket, isHost]);

  useEffect(() => {
    if (enableBtns && timer > 0) {
      playcountdownSound();
      setEnableBtns(false);
    }
  }, [timer]);

  const handleHostRoom = () => {
    if (userName.length != 0) {
      setHostStatus(true);
      setInLobby(true);
      const code = generateRoomCode();
      setJoinCodeValue(code);
      socket?.emit("host_room", { roomId: code, username: userName });
    } else {
      notify("Please enter a display name!", "error");
      playErrorSound();
    }
  };

  const handleJoinRoom = () => {
    if (joinCode.length !== 4) {
      notify("Please enter a 4-letter code to join the room!", "error");
      playErrorSound();
      return;
    }

    socket?.emit(
      "join_room",
      { roomId: joinCode, username: userName },
      (res) => {
        if (res == "success") {
          setInLobby(true);
        } else {
          notify(res, "error");
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
      notify("Please enter a display name!", "error");
      playErrorSound();
    }
  };

  const handleStartGame = () => {
    if (players.length < 4) {
      notify("Require at least 4 players!", "error");
      playErrorSound();
    } else {
      socket?.emit("start_timer", { roomId: joinCode, phase: gamePhase });
    }
  };

  const copyJoinCode = () => {
    notify("Join code copied to clipboard.", "success");
    playPopSound();
    navigator.clipboard.writeText(joinCode);
  };

  const handleLeaveRoom = () => {
    if (isHost) {
      setHostStatus(false);
    }
    socket?.emit("leave_room", { roomId: joinCode });
    setInLobby(false);
    setJoinGame(false);
    setJoinCodeValue("");
  };

  const notify = (msg, type) => {
    const existingToastId = toast.isActive("notification");

    if (existingToastId) {
      toast.update(existingToastId, {
        render: msg,
        type: type === "error" ? toast.TYPE.ERROR : toast.TYPE.SUCCESS,
      });
    } else {
      if (type === "error") {
        toast.error(msg, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
          toastId: "notification", // Set a specific toastId
        });
      } else {
        toast.success(msg, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
          toastId: "notification", // Set a specific toastId
        });
      }
    }
  };

  return (
    <div>
      {timer > 0 && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50">
          <motion.h1
            key={timer}
            className="text-white font-bold text-9xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.4 }}
          >
            {timer}
          </motion.h1>
        </div>
      )}
      {inLobby && (
        <div className="flex flex-row w-screen h-screen">
          <div className="w-1/4 ">
            <div className="w-full flex-col flex items-center justify-center h-full ">
              <div className="w-full h-[80%]  overflow-clip">
                <p className="font-gameFont font-bold text-center text-white  text-xl mb-2">
                  PLAYERS
                </p>
                <ul className="w-full h-full ">
                  <AnimatePresence>
                    {[...Array(8)].map((_, index) => {
                      const player = players[index];
                      return (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0.5, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ ease: "easeOut", duration: 0.2 }}
                          className="text-center font-bold rounded-lg border-b-4 border-l-2 border border-black shadow-lg mb-2 h-[10%] mx-2"
                          style={{
                            backgroundColor: player ? player.color : "#636363",
                          }}
                        >
                          {player ? (
                            <div className="">
                              <span>{player.username}</span>{" "}
                              {player.host && (
                                <span className="font-gameFont font-bold">
                                  (HOST)
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="font-gameFont">
                              Player is offline
                            </div>
                          )}
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              </div>
            </div>
          </div>

          <div className="w-1/2 overflow-hidden">
            <div className="flex flex-col h-full items-center justify-center">
              <div className="flex flex-col justify-center items-center min-w-72 w-[60%] h-[25%] p-16 border-8 border-blue-950 outline outline-blue-900 rounded-lg bg-blue-800 overflow-clip">
                <div>
                  <h1
                    className="xl:text-8xl lg:text-7xl md:text-6xl text-5xl  font-title font-thin"
                    style={{ textShadow: "-3px 3px 0px black" }}
                  >
                    <b className="text-gray-100">TR.</b>
                    <b className="text-red-600">AI</b>
                    <b className="text-gray-100">.TOR</b>
                  </h1>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {isHost && (
                  <div className="flex">
                    <button
                      disabled={!enableBtns}
                      onClick={() => {
                        handleStartGame();
                        soundFX();
                      }}
                      onMouseEnter={playHoverSoundFX}
                      className="font-gameFont w-full text-2xl bg-yellow-400 hover:bg-yellow-600 font-bold py-6 px-16  rounded-lg border-b-4 border-l-2 border-yellow-700 shadow-md transform transition-all hover:scale-105 active:border-yellow-600 mb-2"
                    >
                      Start Game
                    </button>
                  </div>
                )}

                <div className="flex">
                  <button
                    disabled={!enableBtns}
                    onClick={() => {
                      handleLeaveRoom();
                      soundFX();
                    }}
                    onMouseEnter={playHoverSoundFX}
                    className="font-gameFont w-full text-2xl bg-yellow-400 hover:bg-yellow-600 font-bold py-6 px-16 max-w-72 rounded-lg border-b-4 border-l-2 border-yellow-700 shadow-md transform transition-all hover:scale-105 active:border-yellow-600 mb-2"
                  >
                    Leave Game
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className=" w-1/4">
            <div className="w-full flex-col flex items-center  h-[20%] justify-center ">
              <p className="font-gameFont font-bold text-white">Join Code</p>
              <button
                className="bg-red-600 border-2 border border-black hover:scale-105 p-1 text-white w-[60%] rounded-md flex flex-row justify-center items-center transition-all"
                onClick={copyJoinCode}
              >
                <h2 className="text-4xl font-bold">{joinCode}</h2>
              </button>
            </div>
          </div>
        </div>
      )}

      {!inLobby && (
        <div className="flex flex-col text-center justify-center items-center  w-screen h-screen">
          <div className="flex flex-col  items-center min-w-72 w-[35%] h-[60%] p-16 pt-10 border-8 border-blue-950 outline outline-blue-900 rounded-lg bg-blue-800 overflow-clip">
            <div className="mb-6 ">
              <h1
                className="lg:text-7xl md:text-6xl text-5xl  font-title font-thin"
                style={{ textShadow: "-3px 3px 0px black" }}
              >
                <b className="text-gray-100">TR.</b>
                <b className="text-red-600">AI</b>
                <b className="text-gray-100">.TOR</b>
              </h1>
            </div>

            {!joinGame ? (
              <div className="w-full">
                <div className="w-full">
                  <h2 className="font-gameFont font-medium text-white mb-2">
                    Display Name
                  </h2>
                  <input
                    type="text"
                    placeholder="Enter a display name"
                    className="font-gameFont w-full py-2 px-4 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-300 text-center mb-24"
                    value={userName}
                    onChange={(e) =>
                      setUserNameValue(e.target.value.slice(0, 14))
                    }
                  ></input>
                </div>

                <div className="w-full">
                  <button
                    className="font-gameFont overflow-hidden bg-yellow-400 w-full hover:bg-yellow-600 font-bold py-2 mb-3 px-4 rounded-lg border-b-4 border-l-2 border-yellow-700 shadow-md transform transition-all hover:scale-105 active:border-yellow-600"
                    onMouseEnter={playHoverSoundFX}
                    onClick={() => {
                      tryJoinGame();
                      soundFX();
                    }}
                  >
                    Join Game
                  </button>
                  <button
                    className="font-gameFont overflow-hidden bg-yellow-400  w-full hover:bg-yellow-600 font-bold py-2 px-4 rounded-lg border-b-4 border-l-2 border-yellow-700 shadow-md transform transition-all hover:scale-105 active:border-yellow-600"
                    onMouseEnter={playHoverSoundFX}
                    onClick={() => {
                      handleHostRoom();
                      soundFX();
                    }}
                  >
                    Host Game
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <div className="w-full">
                  <h2 className="font-gameFont font-medium text-white mb-2">
                    Room Code
                  </h2>
                  <input
                    type="text"
                    placeholder="Enter a room code"
                    className="w-full py-2 px-4 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-300 text-center mb-24"
                    value={joinCode}
                    onChange={(e) =>
                      setJoinCodeValue(e.target.value.toUpperCase().slice(0, 4))
                    }
                  ></input>
                </div>

                <div className="w-full">
                  <button
                    className="font-gameFont overflow-hidden bg-yellow-400 w-full hover:bg-yellow-600 font-bold py-2 mb-3 px-4 rounded-lg border-b-4 border-l-2 border-yellow-700 shadow-md transform transition-all hover:scale-105 active:border-yellow-600"
                    onClick={() => {
                      handleJoinRoom();
                      soundFX();
                    }}
                    onMouseEnter={playHoverSoundFX}
                  >
                    Join Room
                  </button>
                  <button
                    className="font-gameFont overflow-hidden bg-yellow-400  w-full hover:bg-yellow-600 font-bold py-2 px-4 rounded-lg border-b-4 border-l-2 border-yellow-700 shadow-md transform transition-all hover:scale-105 active:border-yellow-600"
                    onClick={() => {
                      setJoinGame(false);
                      soundFX();
                    }}
                    onMouseEnter={playHoverSoundFX}
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8">
              <button
                className="rounded-full"
                onMouseEnter={() => playHoverSoundFX()}
                onClick={() => {
                  window.open(
                    "https://www.youtube.com/watch?v=9ipUW5M91sE",
                    "_blank"
                  );
                }}
              >
                <FaInfoCircle
                  size={55}
                  color="#facc15"
                  className="hover:scale-110 transition-all"
                />
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="colored"
        transition={Bounce}
      />
    </div>
  );
}

export default Lobby;

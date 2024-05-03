import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";
import { motion } from "framer-motion";
import { Bounce, ToastContainer, toast } from "react-toastify";
import useSound from "use-sound";

import soundFile from "../assets/sfx/clickSFX.wav";
import hoverSoundFile from "../assets/sfx/hoverSFX.wav";
import errorSoundFile from "../assets/sfx/errorSFX.mp3";
import selectSoundFile from "../assets/sfx/selectSFX.wav";
import traitorSoundFile from "../assets/sfx/traitorSFX.wav";

import "react-toastify/dist/ReactToastify.css";

function CharacterSelect() {
  // Hook for playing sound
  const [play] = useSound(soundFile, { volume: 0.1 });
  const [playHoverSound] = useSound(hoverSoundFile, { volume: 0.05 });
  const [playErrorSound] = useSound(errorSoundFile, { volume: 0.1 });
  const [playSelectSound] = useSound(selectSoundFile, { volume: 0.1 });
  const [playTraitorSound] = useSound(traitorSoundFile, { volume: 0.2 });

  // Function to play sound effect
  const soundFX = () => {
    play();
  };

  const playHoverSoundFX = () => {
    playHoverSound();
  };

  const playTraitorSoundFX = () => {
    playTraitorSound();
  };

  const {
    isHost,
    players,
    updatePlayers,
    joinCode,
    userName,
    socket,
    transitionToGamePhase,
    gamePhase,
    role,
    timer,
    timerMax,
    setRoleValue,
    selectedChar,
    setSelectedChar,
  } = useGameRoom();
  const [charOptions, setCharOptions] = useState();
  const [submitted, setSubmitted] = useState(false);
  const [transition, setTransition] = useState(false);

  useEffect(() => {
    if (timer == 1 && selectedChar === null && role === "Innocent") {
      setSelectedChar(charOptions[0]);
    }
  }, [timer, selectedChar, charOptions]);

  useEffect(() => {
    socket?.on("update_char_options", (res) => {
      setRoleValue(res.role);
      setCharOptions(res.characters);
    });

    socket?.on("timer_expired", () => {
      if (selectedChar !== null) {
        selectChar(selectedChar);
      }
      setTransition(true);
      const timer = setTimeout(() => {
        transitionToGamePhase("prompts");
        clearTimeout(timer);
      }, 2000);
    });

    return () => {
      socket?.off("update_char_options");
      socket?.off("timer_expired");
    };
  }, [socket]);

  useEffect(() => {
    if (isHost) {
      console.log(joinCode);
      socket?.emit("get_char_options", { roomId: joinCode });
      socket?.emit("start_timer", { roomId: joinCode, phase: gamePhase });
    }

    return () => {
      socket?.off("get_char_options");
      socket?.off("start_timer");
    };
  }, []);

  useEffect(() => {
    if (role === "Traitor") {
      playTraitorSoundFX();
    }
  }, [role]);

  const selectChar = (character) => {
    socket?.emit("select_char", { character: character, roomId: joinCode });
  };

  const notify = (msg) => {
    const existingToastId = toast.isActive("notification");

    if (existingToastId) {
      toast.update(existingToastId, {
        render: msg,
        type: toast.TYPE.ERROR,
      });
    } else {
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
        toastId: "notification",
      });
    }
  };

  return (
    <div>
      {transition === true && (
        <div className="transition-container closing-container"></div>
      )}

      {role === "Traitor" && (
        <div className="overflow-hidden">
          <motion.div
            className="w-screen h-screen justify-center items-center flex "
            initial={{ opacity: 0.5, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              ease: "easeOut",
              duration: 0.4,
              type: "spring",
              stiffness: "200",
              damping: "15",
            }}
          >
            <div className=" border-red-700 outline outline-red-500 rounded-lg bg-gradient-to-b from-black to-red-950 min-h-[22rem] min-w-96 bg-gray-800 p-4 flex flex-col justify-between items-center w-[70%] h-[60%]">
              <div className=" flex flex-col items-center mt-10 p-2">
                <div className="rounded-full overflow-hidden w-28 h-28 lg:w-40 lg:h-40 flex hover:scale-105 transition-all">
                  <img
                    className="w-full h-full object-cover "
                    src={`/charIcons/` + `${role}.jpg`.toLowerCase()}
                    alt={"AI Icons"}
                  />
                </div>
                <p className="font-gameFont font-bold  text-3xl xl:text-5xl text-white text-center mt-6 transition-all">
                  You are the Traitor! Try to blend in...
                </p>
                <p className="font-gameFont text-white text-center italic">
                  You don't get an AI character, so... Pretend!
                </p>
              </div>

              <motion.div
                className="w-full h-[12%] bg-yellow-600 shadow-md relative mb-4 mt-4"
                style={{ zIndex: 1 }}
                animate={{ opacity: transition ? 0 : 1 }}
              >
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{
                    width: `${(timer / timerMax) * 100}%`,
                  }}
                  className="h-full bg-yellow-300 animate-timer border-b-4 border-l-2 border-yellow-500 absolute top-0 left-0"
                  transition={{ ease: "linear", duration: 1 }}
                ></motion.div>

                <div className="flex justify-center items-center h-full relative z-1 ">
                  <span className="text-white font-bold text-2xl ">
                    {timer}s remaining!
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}

      {role === "Innocent" && (
        <div className="overflow-hidden">
          <motion.div
            className="w-screen h-screen justify-center items-center flex"
            initial={{ opacity: 0.5, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              ease: "easeOut",
              duration: 0.4,
              type: "spring",
              stiffness: "200",
              damping: "15",
            }}
          >
            <div className="min-h-72 min-w-96 bg-gray-800 p-4 rounded-lg border-b-8 border-l-8 border-gray-900  flex flex-col justify-center items-center w-[70%] h-[60%]">
              <p className="font-gameFont text-white font-semibold lg:text-xl xl:text-2xl text-center my-2">
                {submitted
                  ? `You've chosen to be a`
                  : "Choose your AI Character. This will be how your answers are translated!"}
              </p>

              {!submitted ? (
                <div className="-mx-2 my-2 flex w-[90%] h-[50%]">
                  {charOptions.map((character, index) => (
                    <div key={index} className="flex w-full">
                      <button
                        className={`overflow-hidden w-full min-h-32 font-bold rounded-lg flex-col items-center justify-center border-4 border-blue-300 shadow-lg mx-1 transition-all hover:scale-105 hover:border-blue-500 ${
                          charOptions[index] === selectedChar
                            ? "bg-blue-200 border-blue-500 scale-105"
                            : "bg-white"
                        } hover:shadow-lg active:border-blue-400`}
                        onClick={() => {
                          playSelectSound();
                          setSelectedChar(charOptions[index]);
                        }}
                      >
                        <div className="justify-center h-full">
                          <div className="flex flex-col items-center justify-center py-10 space-y-6">
                            <div className="rounded-full overflow-hidden w-14 h-14 lg:w-20 lg:h-20 transition-all flex">
                              <img
                                className="w-full h-full object-cover"
                                src={
                                  `/charIcons/` +
                                  `${charOptions[index]}.jpg`.toLowerCase()
                                }
                                alt={"AI Icons"}
                              />
                            </div>
                            <span className="lg:text-2xl text-center transition-all text-wrap line-clamp-1">
                              {charOptions[index]}
                            </span>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <motion.div
                  className="w-full h-full justify-center items-center flex flex-col"
                  initial={{ opacity: 0.5, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    ease: "easeOut",
                    duration: 0.4,
                    type: "spring",
                    stiffness: "200",
                    damping: "15",
                  }}
                >
                  <div className="overflow-hidden w-[90%] min-h-24 h-full font-bold rounded-lg border-4 shadow-lg mx-1 transition-all bg-blue-200 border-blue-500">
                    <div className="justify-center h-full flex">
                      <div className="flex flex-col items-center justify-center py-2 space-y-2 ">
                        <div className="rounded-full overflow-hidden w-24 h-24 lg:w-32 lg:h-32 transition-all flex">
                          <img
                            className="w-full h-full object-cover"
                            src={
                              `/charIcons/` +
                              `${selectedChar}.jpg`.toLowerCase()
                            }
                            alt={"AI Icons"}
                          />
                        </div>
                        <span className="font-gameFont lg:text-2xl text-center transition-all text-wrap line-clamp-1">
                          {selectedChar}
                        </span>
                        <span>Waiting for others...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {!submitted && (
                <button
                  className="font-gameFont bg-yellow-400 hover:bg-yellow-600 font-bold py-2 px-12 my-2 rounded-lg shadow-md border border-black transform transition-all hover:scale-105"
                  onClick={() => {
                    if (selectedChar !== null) {
                      setSubmitted(true);
                      selectChar(selectedChar);
                      soundFX();
                    } else {
                      playErrorSound();
                      notify("Select a character before submitting!");
                    }
                  }}
                  onMouseEnter={playHoverSoundFX}
                >
                  Submit
                </button>
              )}

              <motion.div
                className="w-full h-[12%] bg-yellow-600 shadow-md relative mt-4"
                style={{ zIndex: 1 }}
                animate={{ opacity: transition ? 0 : 1 }}
              >
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{
                    width: `${(timer / timerMax) * 100}%`,
                  }}
                  className="h-full bg-yellow-300 animate-timer border-b-4 border-l-2 border-yellow-500 absolute top-0 left-0"
                  transition={{ ease: "linear", duration: 1 }}
                ></motion.div>

                <div className="flex justify-center items-center h-full relative z-1 ">
                  <span className="text-white font-bold text-2xl ">
                    {timer}s remaining!
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
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

export default CharacterSelect;

import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";
import AIImage from "../assets/image.png";
import { motion } from "framer-motion";

function CharacterSelect() {
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
    setRoleValue,
  } = useGameRoom();
  const [charOptions, setCharOptions] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [transition, setTransition] = useState(false);

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
      }, 2000);
    });

    return () => {
      socket?.off("update_char_options");
      socket?.off("timer_expired");
      clearTimeout(timer);
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

  const selectChar = (character) => {
    socket?.emit("select_char", { character: character, roomId: joinCode });
  };

  return (
    <div>
      {transition === true && (
        <div className="transition-container closing-container"></div>
      )}

      {role === "Traitor" ? (
        <p className="font-bold text-5xl text-white bg-gray-800 py-20 px-20 border-2 border-red-700 outline outline-red-500 rounded-lg bg-gradient-to-b from-black to-red-950 w-full">
          You are the traitor! Try to blend in.
        </p> //
      ) : submitted ? (
        <p>
          You've chosen to be a {selectedChar}, waiting for other players...
        </p>
      ) : (
        <div className="w-screen h-screen justify-center items-center flex">
          <div className="min-h-72 min-w-96 bg-gray-800 p-4 rounded-lg border-b-8 border-l-8 border-gray-900  flex flex-col justify-center items-center w-[70%] h-[60%]">
            <p className="text-white font-semibold lg:text-xl xl:text-2xl text-center my-2">
              Choose your AI Character. This will be how your answers are
              translated!
            </p>
            <div className="-mx-2 my-2 flex w-[90%] h-[50%]">
              {charOptions.map((character, index) => (
                <div className="flex w-full">
                  <button
                    key={index}
                    className={`overflow-hidden min-h-32 flex-1 font-bold rounded-lg flex-col items-center justify-center border-4 border-blue-300 shadow-lg  mx-1 transition-all hover:scale-105 hover:border-blue-500 ${
                      charOptions[index] === selectedChar
                        ? "bg-blue-200 border-blue-500"
                        : "bg-white"
                    } hover:shadow-lg active:border-blue-400`}
                    onClick={() => setSelectedChar(charOptions[index])}
                  >
                    <div className="justify-center h-full ">
                      <div className="flex flex-col items-center justify-center py-10 space-y-6">
                        <div className="rounded-full overflow-hidden w-14 h-14 lg:w-20 lg:h-20 transition-all flex">
                          <img
                            className="w-full h-full object-cover"
                            src={AIImage}
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

            <button
              className="bg-yellow-400 hover:bg-yellow-600 font-bold py-2 px-12 my-2 rounded-lg shadow-md border border-black transform transition-all hover:scale-105"
              onClick={() => {
                if (selectedChar !== null) {
                  setSubmitted(true);
                  selectChar(selectedChar);
                } else {
                  alert("Select a char before submit");
                }
              }}
            >
              Submit
            </button>

            <motion.div
              className="w-full h-[12%] bg-yellow-600 shadow-md relative mt-4"
              style={{ zIndex: 1 }}
              initial={{ y: "-16.6vh" }}
              animate={{ y: 0 }}
            >
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: `${(timer / 5000) * 100}%` }}
                className="h-full bg-yellow-300 animate-timer border-b-4 border-l-2 border-yellow-500 absolute top-0 left-0"
                transition={{ ease: "linear", duration: 1 }}
              ></motion.div>

              <div className="flex justify-center items-center h-full relative z-1 ">
                {timer > 0 && (
                  <span className="text-white font-bold text-2xl ">
                    {timer}s remaining!
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CharacterSelect;

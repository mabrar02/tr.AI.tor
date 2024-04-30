import React, { useEffect, useState } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";
import PromptBanner from "./PromptBanner";
import { AnimatePresence, motion } from "framer-motion";

function SeeResponses() {
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

  const [currentResIndex, setCurrentResIndex] = useState(0);
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    if (isHost) {
      socket?.emit("start_showing_responses", joinCode);
    }
  }, []);

  useEffect(() => {
    socket?.on("show_response_index", (index) => {
      setCurrentResIndex(index);
      setShowResponse(true);
    });

    return () => {
      socket?.off("show_response_index");
    };
  }, [socket]);

  useEffect(() => {
    if (currentResIndex === players.length) {
      transitionToGamePhase("voting");
    }
  }, [currentResIndex]);

  //useEffect(() => {
  //  const interval = setInterval(() => {
  //    setCurrentResIndex(key => key+1);
  //    console.log(currentResIndex);
  //  }, 4000);
  //  return () => clearInterval(interval);
  //}, []);

  return (
    <div>

      <div className="h-screen w-screen items-center flex-col flex">

        <PromptBanner animate={false} />


        <div className="relative w-screen h-screen justify-center flex-col overflow-hidden">
          <motion.div className="flex justify-center"
                key={0}
                initial={{ y: '-100vh' }} 
                animate={{ y: '0' }} 
                exit={{x: '-100vh' }}
                transition={{ duration: 1, bounce: 0.2, delay: 0, type: 'spring' }} 
                >
            <h1>Time's up! Let's take a look at these responses...</h1>
          </motion.div>

        {showResponse && (
          <div className="relative w-screen justify-center flex flex-grow overflow-hidden pt-10">
            <AnimatePresence>
              <motion.div className="flex-1 p-4 text-black absolute w-[45%] h-[40%]"
                  key={currentResIndex}
                  initial={{ x: '-100vw' }} 
                  animate={{ x: '0' }} 
                  exit={{x: '100vw' }}
                  transition={{ duration: 1, bounce: 0.2, delay: 0, type: 'spring' }} 
                  >
                <div className="font-bold py-2 px-5 border border-black shadow shadow-lg mb-4 mx-1 wx-5 rounded-tr-xl rounded-br-xl rounded-tl-md w-[100%] h-[100%] relative"
                  style={{ backgroundColor: "white" }}>
                  <p className="mb-5">{players[currentResIndex]?.username}:</p>
                  <p>{players[currentResIndex]?.filteredAnswer}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>


        )}


        </div>
      </div>
    </div>
  );
}

export default SeeResponses;

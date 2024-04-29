import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";
import { motion } from "framer-motion";
import './css/styles.css';

function ResponseBox(props) {
  const {
    isHost,
    players,
    updatePlayers,
    joinCode,
    userName,
    transitionToGamePhase,
    index,
    prompt,
    socket,
    setPrompt,
    role,
    roundNum,
    setRoundValue,
    timer,
    gamePhase,
  } = useGameRoom();
  const [filteredAnswer, setFilteredAnswer] = useState("");
  const [filteredAnswerText, setFilteredAnswerText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [regenCount, setRegenCount] = useState(3);
  const [updatingResponse, setUpdatingResponse] = useState(false);
  const [split, setSplit] = useState(false);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    socket?.on("answer_regenerated", (content) => {
      setFilteredAnswer(content);
      setUpdatingResponse(false);
    });

    socket?.on("answer_submitted", (content) => {
      setFilteredAnswer(content);
    });

    return () => {
      socket?.off("answer_regenerated");
      socket?.off("answer_submitted");
    };
  }, [socket]);

  const submitAnswer = () => {
    console.log(answer);
    setSplit(true);
    socket?.emit("submit_answer", { roomId: joinCode, answer });
    setSubmitted(true);
  };

  const regenerateAnswer = () => {
    if (regenCount > 0) {
      socket?.emit("regenerate_answer", { roomId: joinCode });
      setRegenCount(regenCount - 1);
      setUpdatingResponse(true);
    }
  };


  useEffect(() => {
    if(filteredAnswerText.length < filteredAnswer.length) {
      const timeout = setTimeout(() => {
        setFilteredAnswerText(filteredAnswer.substring(0, filteredAnswerText.length+1))
      }, 25);
      return () => clearTimeout(timeout);
    }
  }, [filteredAnswer, filteredAnswerText]);

  return (
    <div className="w-[75%] h-[50%] mt-10">
    <motion.div className="bg-green-400 h-[100%] flex-col flex items-center rounded-3xl"
        initial={{ height: '10%' }} 
        animate={{ height: '100%' }} 
        transition={{ duration: 1, bounce: 0.5, delay: props.time + 2, type: 'spring' }} 
    >

       <div className="w-[90%] h-[80%] mb-2 flex-col flex">
          <span className="pt-2">Enter your response:</span>


          <div className="flex flex-row h-[100%] justify-between relative items-center">

            {!split && (
            <textarea
              className="px-4 py-2 border border-gray-300 rounded-2xl resize-none w-[100%] h-[100%] focus:outline-none mt-2"
              placeholder="Enter your answer..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            )}

            {split && (
            <>
              <textarea
                className="px-4 py-2 border border-gray-300 rounded-2xl resize-none w-[100%] h-[100%] focus:outline-none mt-2 animate-left"
                placeholder="Enter your answer..."
                value={answer}
                readOnly
              />

              <textarea
                className="px-4 py-2 border border-gray-300 rounded-2xl resize-none w-[100%] h-[100%] focus:outline-none mt-2 animate-right"
                placeholder=""
                value={filteredAnswerText}
                readOnly
              />
            </>
            )}

          </div>

        </div>

      <div className="w-[90%] h-[20%] flex-col flex items-center justify-center ">      
        <button
          onClick={submitAnswer}
          className="bg-yellow-400 hover:bg-yellow-600 font-bold py-2 px-4 rounded-lg border-b-4 border-l-2 border-yellow-700 shadow-md transform transition-all hover:scale-105 active:border-yellow-600 "
        >
          Submit Answer
        </button>
      </div>

      </motion.div>



      {submitted && (
        <div className="flex flex-col items-center w-[40rem] justify-center bg-black text-white">
              <div className="text-center">
                {timer > 5 && (
                  <button
                    className={`${
                      regenCount == 0 || updatingResponse
                        ? "bg-yellow-800"
                        : "bg-yellow-200"
                    } px-10 py-2 text-black my-2`}
                    onClick={regenerateAnswer}
                  >
                    {updatingResponse ? "..." : "Regenerate Answer"} (x
                    {regenCount})
                  </button>
                )}
              </div>
        </div>
      )}
    </div>
  );
}

export default ResponseBox;

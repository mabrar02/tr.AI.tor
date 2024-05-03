import React, { useState, useEffect } from "react";
import { useGameRoom } from "../contexts/GameRoomContext";
import PromptBanner from "./PromptBanner";
import { AnimatePresence, easeIn, motion } from "framer-motion";
import useSound from "use-sound";

import selectSoundFile from "../assets/sfx/selectSFX.wav";
import soundFile from "../assets/sfx/clickSFX.wav";
import hoverSoundFile from "../assets/sfx/hoverSFX.wav";

function Voting() {
  const [playSelectSound] = useSound(selectSoundFile, { volume: 0.2 });
  const [play] = useSound(soundFile, { volume: 0.1 });
  const [playHoverSound] = useSound(hoverSoundFile, { volume: 0.05 });

  const {
    isHost,
    players,
    updatePlayers,
    joinCode,
    transitionToGamePhase,
    userName,
    prompt,
    socket,
    roundNum,
    setRoundValue,
    setGameOver,
    setPrompt,
    timer,
  } = useGameRoom();

  const [phase, setPhase] = useState("voting");
  const [nextPhase, setNextPhase] = useState("");
  const [selected, selectSelect] = useState("");
  const [tallyVotes, updateTallyVotes] = useState();
  const [transition, setTransition] = useState(false);
  const [decision, setDecision] = useState({});
  const [filteredPlayers, setFilteredPlayers] = useState(players);
  const [tallyVotesUpdated, setTallyVotesUpdated] = useState(false);
  const [submittedVote, setSubmittedVote] = useState(false);

  useEffect(() => {
    if (tallyVotes != null) {
      setFilteredPlayers((current) =>
        current.filter((item) =>
          Object.keys(tallyVotes).includes(item.username)
        )
      );
      setTallyVotesUpdated(true);
    }
  }, [tallyVotes]);

  useEffect(() => {
    console.log(phase);
    if (isHost && phase !== "post-votes") {
      socket?.emit("start_timer", { roomId: joinCode, phase: phase });
    }

    switch (phase) {
      case "voting":
        setPrompt("Who is the Traitor?");
        break;
      case "post-votes":
        if (decision.decision) {
          setPrompt(`${decision.player} has been found as the Traitor!`);
          setGameOver({ innowin: true });
          setNextPhase("ending");
        } else {
          if (roundNum == 3) {
            setPrompt("The Traitor was not found... game over.");
            setGameOver({ innowin: false });
            setNextPhase("ending");
          } else {
            setPrompt(
              `No conclusive Traitor was found. ${
                tallyVotes.size >= 2 ? "You must vote unanimously!" : ""
              }`
            );
            setNextPhase("resetting");
          }
        }
        if (isHost) {
          socket.emit("reset_round", joinCode);
        }

        const newPlayers = players.map((player) => ({
          ...player,
          filteredAnswer: "",
          vote: "",
        }));
        updatePlayers(newPlayers);
        break;
      case "inter-votes":
        setPrompt("And the results conclude...");
    }
  }, [phase, decision]);

  useEffect(() => {
    const timer2 = setTimeout(() => {
      if (nextPhase === "ending") {
        transitionToGamePhase("ending");
      } else if (nextPhase === "resetting") {
        transitionToGamePhase("prompts");
      }
      clearTimeout(timer2);
    }, 10000);
  }, [nextPhase]);

  useEffect(() => {
    socket?.on("get_tally_votes", (votee_dict) => {
      updateTallyVotes(votee_dict);
      setPhase("post-votes");

      const timer1 = setTimeout(() => {
        setTransition(true);
        clearTimeout(timer1);
      }, 8000);
    });

    socket?.on("vote_decision", (decision) => {
      setDecision(decision);
    });

    socket?.on("timer_expired", () => {
      switch (phase) {
        case "voting":
          if (isHost) {
            socket?.emit("tally_votes", joinCode);
          }
          break;
      }
    });

    return () => {
      socket?.off("get_tally_votes");
      socket?.off("vote_decision");
      socket?.off("timer_expired");
    };
  }, [socket]);

  const selectResponse = (index) => {
    playSelectSound();
    selectSelect(index);
  };

  const sendVote = () => {
    play();
    if (selected.length > 0) {
      setSubmittedVote(true);

      socket?.emit("send_vote", { roomId: joinCode, vote: selected });
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1, // Delay in seconds between each child animation
      },
    },
  };
  const itemVariants1 = {
    hidden: { x: -4000 }, // Start off-screen to the left
    visible: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 4,
        damping: 1,
        mass: 0.1,
        ease: "easeIn",
      },
    },
    exit: {
      rotateX: 270,
      rotate: -20,
      y: "100vh",
      transition: {
        duration: 3,
      },
    },
  };
  const itemVariants2 = {
    hidden: { x: 4000 }, // Start off-screen to the right
    visible: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 4,
        damping: 1,
        mass: 0.1,
        ease: "easeIn",
      },
    },
    exit: {
      rotate: 20,
      rotateY: 270,
      y: "100vh",
      transition: {
        duration: 3,
      },
    },
  };

  return (
    <>
      {/* For transitioning out*/}
      {transition && (
        <div className="transition-container closing-container "></div>
      )}

      <div className="w-screen h-screen items-center flex-col flex ">
        <PromptBanner
          animate={false}
          animateprompt={true}
          timeranimate={true}
        />

        <div className="overflow-hidden flex-col w-[100%] flex-grow flex items-center">
          {
            <AnimatePresence>
              {phase == "voting" &&
                (!submittedVote ? (
                  <motion.button
                    initial={{ y: "-100vh" }}
                    animate={{ y: "0vh" }}
                    exit={{ y: "-100vh" }}
                    transition={{ duration: 0.35, type: "tween" }}
                    className="bg-yellow-500 hover:bg-yellow-600 font-bold py-2 px-4 rounded-lg shadow-md transform transition-all hover:scale-105 mt-5"
                    onClick={sendVote}
                    onMouseEnter={() => playHoverSound()}
                  >
                    {selected == ""
                      ? "Who is the Traitor?"
                      : `Submit vote for ${selected}?`}
                  </motion.button>
                ) : (
                  <div className="text-center">
                    You've submitted your vote for {selected}! Waiting for other
                    players...
                  </div>
                ))}
            </AnimatePresence>
          }

          <motion.div
            className="flex-row w-[70%] justify-center flex-col justify-center items-center grid grid-cols-2 gap-4 grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <AnimatePresence>
              {filteredPlayers.map((player, index) => (
                <motion.div
                  key={player.index}
                  className={`${
                    selected == player.username ? "bg-cyan-200" : "bg-slate-200"
                  } m-4 font-bold py-2 px-5 border border-black shadow shadow-lg mb-4 mx-1 wx-5 rounded-tr-xl rounded-br-xl rounded-tl-md w-[100%] relative`}
                  onClick={() => selectResponse(player.username)}
                  variants={
                    player.index % 2 == 1 ? itemVariants1 : itemVariants2
                  }
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  <p className="mb-5">{player.username}</p>
                  <p>{player.sab ? player.answers : player.filteredAnswer}</p>

                  {phase == "post-votes" && tallyVotesUpdated && (
                    <motion.p
                      initial={{ size: 0 }}
                      animate={{ size: 1 }}
                      transition={{
                        stiffness: 2,
                        mass: 1,
                        damping: 5,
                        type: "spring",
                      }}
                      className="mt-2"
                    >
                      Voted by {tallyVotes[player.username]?.voters.join(", ")}
                    </motion.p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default Voting;

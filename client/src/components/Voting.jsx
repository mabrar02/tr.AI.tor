import React from "react";
import { useGameRoom } from "../contexts/GameRoomContext";

function Voting({ socket }) {
  const { isHost, players, updatePlayers, joinCode, userName } = useGameRoom();
  return <div>Voting</div>;

}

export default Voting;

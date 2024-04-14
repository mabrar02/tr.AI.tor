import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { GameRoomProvider } from "./contexts/GameRoomContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GameRoomProvider>
      <App />
    </GameRoomProvider>
  </React.StrictMode>
);

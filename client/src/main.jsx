import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { GamePhaseProvider } from "./contexts/GamePhaseContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GamePhaseProvider>
      <App />
    </GamePhaseProvider>
  </React.StrictMode>
);

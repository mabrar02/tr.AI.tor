import React from "react";

function AnswerPrompts() {
  return (
    <div className="flex flex-col items-center justify-center relative w-screen h-screen bg-red-500 m-0 p-0">
      <div className="justify-center text-center mb-72">
        <h1 className="text-3xl font-bold mb-4">PROMPT:</h1>
        <input className="w-64 py-2 px-4 bg-gray-200 text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-300 mb-4"></input>
      </div>
    </div>
  );
}

export default AnswerPrompts;

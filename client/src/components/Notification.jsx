import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

function Notification({ message, type, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(false);
      onClose(); // Call onClose function after timeout
    }, 3000);

    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <>
      {isVisible && (
        <motion.div
          className={`w-[20%] h-[10%] rounded-xl ${
            type === "error" ? "bg-red-400" : "bg-green-400"
          } absolute top-10 text-center left-0 right-0 ml-auto mr-auto flex items-center justify-center`}
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -100 }}
          exit={{ opacity: 0, y: -100 }}
        >
          <p className="w-full h-full flex justify-center items-center font-bold text-xl">
            {message}
          </p>
        </motion.div>
      )}
    </>
  );
}

export default Notification;

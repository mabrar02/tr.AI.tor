import io from "socket.io-client";
import { useEffect } from "react";
const socket = io.connect("http://localhost:4000");

function App() {
  const sendMessage = () => {
    socket.emit("send_msg", { message: "Hello" });
  };

  useEffect(() => {
    socket.on("r_msg", (data) => {
      alert(data.message);
    });
  }, [socket]);

  return (
    <div>
      <input placeholder="Message.." />
      <button onClick={sendMessage}>Send Message</button>
    </div>
  );
}

export default App;

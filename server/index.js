require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(express.json());
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_DEPLOYMENT,
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("send_msg", (data) => {
    console.log(data);
    socket.broadcast.emit("r_msg", data);
  });
});

httpServer.listen(process.env.PORT, () => {
  console.log("server is running");
});

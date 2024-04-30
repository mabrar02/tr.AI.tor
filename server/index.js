require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(express.json());
app.use(cors());

const httpServer = createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_DEPLOYMENT,
  process.env.FRONTEND_DEPLOYMENT_LOCAL,
];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
  transports: ['websocket', 'polling']
});

require("./socket")(io);

httpServer.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

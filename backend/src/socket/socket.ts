import http from "http";
import { Server } from "socket.io";
import app from "../app";

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

var userSocketMap: any = {};

io.on("connection", (socket) => {
  const userId: any = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }
  socket.on("disconnected", () => {
    console.log("user disconnected", socket.id);
  });
});

export const getReceiverSocketId = (userId: string) => {
  return userSocketMap[userId];
};

export { httpServer, io, app };

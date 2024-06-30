import http from "http";
import { Server } from "socket.io";
import app from "../app";
import { chatModel } from "../dbs/init.mongodb";
import ChatService from "../services/chat.service";
import WebSocket from "ws";

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const ws = new WebSocket("ws://127.0.0.1:8000/api/v1/chat/ws/generate");

var userSocketMap: Record<string, string> = {};

io.on("connection", (frontendSocket) => {
  const userId = frontendSocket.handshake.query.userId as string;
  if (userId) {
    userSocketMap[userId] = frontendSocket.id;
  }

  frontendSocket.on(
    "newMessage",
    async ({
      conversationId,
      msg,
    }: {
      conversationId: string;
      msg: string;
    }) => {
      const conversation = chatModel.getConversationById(conversationId);

      if (conversation) {
        if (conversation.autoMode && userId != "LKM4602") {
          await ChatService.sendMessage({
            senderId: userId,
            conversationId: conversationId,
            messageContent: msg,
          });

          await ChatService.generateChat({
            conversationId: conversationId,
            manualClick: false,
          });
        } else {
          await ChatService.sendMessage({
            senderId: userId,
            conversationId: conversationId,
            messageContent: msg,
          });
        }
      }
    }
  );

  frontendSocket.on(
    "toggleAutoChat",
    ({
      conversationId,
      autoChat,
    }: {
      conversationId: string;
      autoChat: boolean;
    }) => {
      const conversation = chatModel.getConversationById(conversationId);

      if (conversation) {
        conversation.autoMode = autoChat;
      }
    }
  );

  frontendSocket.on("disconnected", () => {
    console.log("user disconnected", frontendSocket.id);
  });

  ws.onclose = () => {
    console.log("WebSocket connection closed");
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
});

export const getReceiverSocketId = (userId: string) => {
  return userSocketMap[userId];
};

export { httpServer, io, app, ws };

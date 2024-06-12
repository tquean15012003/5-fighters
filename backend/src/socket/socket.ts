import http from "http";
import { Server } from "socket.io";
import app from "../app";
import { chatModel } from "../dbs/init.mongodb";
import ChatService from "../services/chat.service";

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

  socket.on(
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
          const generateMessage = await ChatService.generateChat(
            conversationId
          );
          await ChatService.sendMessage({
            senderId: "LKM4602",
            conversationId: conversationId,
            messageContent: generateMessage,
          });
        }
      } else {
        await ChatService.sendMessage({
          senderId: userId,
          conversationId: conversationId,
          messageContent: msg,
        });
        // if (userId != "LKM4602") {
        //   const generateMessage = await ChatService.generateChat(
        //     conversationId
        //   );
        //   socket.to(userSocketMap["LKM4602"]).emit("suggestMessage", {
        //     conversationId,
        //     generateMessage,
        //   });
        // }
      }
    }
  );

  socket.on(
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

  socket.on("disconnected", () => {
    console.log("user disconnected", socket.id);
  });
});

export const getReceiverSocketId = (userId: string) => {
  return userSocketMap[userId];
};

export { httpServer, io, app };

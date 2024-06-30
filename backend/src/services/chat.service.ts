import { BadRequestError } from "../core/error.response";
import { chatModel } from "../dbs/init.mongodb";
import { v4 as uuidv4 } from "uuid";
import { getReceiverSocketId, io, ws } from "../socket/socket";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

interface IConversation {
  id: string;
  name: string;
  participants: string[];
  messages: Message[];
  autoMode: boolean;
}

interface Message {
  senderId: string;
  conversationId: string;
  message: string;
}

class ChatService {
  static async createConversation({ chatMembers }: { chatMembers: string[] }) {
    if (!chatMembers || chatMembers.length <= 1) {
      throw new BadRequestError("Bad Request: Invalid chat members");
    }

    const id = uuidv4();
    const conversation: IConversation = {
      id,
      name: id,
      participants: chatMembers,
      messages: [],
      autoMode: false,
    };

    const newConversation = await chatModel.saveConversation(conversation);

    return newConversation;
  }

  static async allConversation(userId: string) {
    console.log(userId, "userId");
    const allConversations = await chatModel.getConversations();

    const filterConversations: IConversation[] = [];
    await allConversations.forEach((e: IConversation) => {
      if (e.participants.includes(userId)) {
        filterConversations.push(e);
      }
    });

    return filterConversations;
  }

  static async getConversationContent(conversationId: string) {
    console.log(conversationId, "conversationId");
    const selectedConversation = await chatModel.getConversationById(
      conversationId
    );
    if (!selectedConversation)
      throw new BadRequestError("Conversation not exist");

    const conversationContent = {
      messages: selectedConversation.messages ?? [],
      autoMode: selectedConversation.autoMode,
    };
    return conversationContent;
  }

  static async sendMessage({
    senderId,
    conversationId,
    messageContent,
  }: {
    senderId: string;
    conversationId: string;
    messageContent: string;
  }) {
    const conversation = await chatModel.getConversationById(conversationId);
    if (!conversation) throw new BadRequestError("Conversation not exist");

    const newMessage: Message = {
      senderId: senderId === "LKM4602_BOT" ? "LKM4602" : senderId,
      conversationId: conversationId,
      message: messageContent,
    };

    await chatModel.saveMessage(conversationId, newMessage);

    for (let i of conversation.participants) {
      if (senderId !== "LKM4602_BOT" && i == senderId) {
        continue;
      }

      const receiverSocketId = getReceiverSocketId(i);

      io.to(receiverSocketId).emit("newMessage", {
        ...newMessage,
        status: "MANUAL",
      });
    }
    return newMessage;
  }

  static async summaryChat(conversationId: string) {
    const conversation = await chatModel.getConversationById(conversationId);
    if (!conversation || conversation.messages.length < 1)
      throw new BadRequestError("Conversation not exist");

    let messages: any = [];
    await conversation.messages.forEach((chat: Message) => {
      const obj = {
        role: chat.senderId === "LKM4602" ? "assistant" : "user",
        content: chat.message,
      };
      messages.push(obj);
    });

    const summaryContent = await axios.post(
      `${process.env.CHATBOT_BASE_API_URL}/summary`,
      {
        messages: messages,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return summaryContent.data;
  }

  static async generateChat(conversationId: string) {
    const conversation = await chatModel.getConversationById(conversationId);
    if (!conversation) throw new BadRequestError("Conversation not exist");

    let messages: any = [];

    await conversation.messages.forEach((chat: Message) => {
      const obj = {
        role: chat.senderId === "LKM4602" ? "assistant" : "user",
        content: chat.message,
      };
      messages.push(obj);
    });

    let receivedMessages: string[] = [];

    ws.onmessage = async (event: any) => {
      const data = JSON.parse(event.data);
      console.log("Message received from server:", data);

      const { status, content } = data;
      receivedMessages.push(content);

      if (status == "COMPLETE") {
        const finalMessage = receivedMessages.join(" ");

        const newMessage = {
          senderId: "LKM4602",
          conversationId,
          message: finalMessage,
        };

        await chatModel.saveMessage(conversationId, newMessage);
        ChatService.emitNewMessage(
          conversation,
          conversationId,
          "LKM4602_BOT",
          data
        );

        return newMessage;
      }

      ChatService.emitNewMessage(
        conversation,
        conversationId,
        "LKM4602_BOT",
        data
      );
    };

    ws.send(JSON.stringify({ messages: messages }));

    return {
      senderId: "LKM4602",
      conversationId,
      message: "",
    };
  }

  static emitNewMessage = (
    conversation: IConversation,
    conversationId: string,
    senderId: string,
    data: any
  ) => {
    for (let i of conversation.participants) {
      if (senderId !== "LKM4602_BOT" && i == senderId) {
        continue;
      }

      const receiverSocketId = getReceiverSocketId(i);

      io.to(receiverSocketId).emit("newMessage", {
        message: data.content,
        status: data.status,
        conversationId: conversationId,
        senderId: senderId,
      });
    }
  };
}

export default ChatService;

import { BadRequestError } from "../core/error.response";
import { chatModel } from "../dbs/init.mongodb";
import { v4 as uuidv4 } from "uuid";
import { getReceiverSocketId, io } from "../socket/socket";
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
      senderId: senderId,
      conversationId: conversationId,
      message: messageContent,
    };

    await chatModel.saveMessage(conversationId, newMessage);

    for (let i of conversation.participants) {
      if (i == senderId) continue;
      const receiverSocketId = getReceiverSocketId(i);
      io.to(receiverSocketId).emit("newMessage", {
        conversationId,
        newMessage,
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

    // if (!conversation.autoMode)
    //   throw new BadRequestError("AutoChat mode not available for this chat");

    let messages: any = [];
    await conversation.messages.forEach((chat: Message) => {
      const obj = {
        role: chat.senderId === "LKM4602" ? "assistant" : "user",
        content: chat.message,
      };
      messages.push(obj);
    });

    const autoChat = await axios.post(
      `${process.env.CHATBOT_BASE_API_URL}/generate`,
      {
        messages: messages,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return autoChat.data;
  }
}

export default ChatService;

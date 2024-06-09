import { BadRequestError } from "../core/error.response";
import { chatModel } from "../dbs/init.mongodb";
import { v4 as uuidv4 } from "uuid";
import { getReceiverSocketId, io } from "../socket/socket";

interface IConversation {
  id: string;
  name: string;
  participants: string[];
  messages: string[];
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
    return selectedConversation.messages ?? [];
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

    const newMessage = {
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
      console.log(receiverSocketId, "receiverId", newMessage);
    }
    return newMessage;
  }
}

export default ChatService;

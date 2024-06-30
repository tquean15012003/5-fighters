import { BadRequestError } from "../core/error.response";
import { chatModel } from "../dbs/init.mongodb";
import { v4 as uuidv4 } from "uuid";
import { getReceiverSocketId, io, ws } from "../socket/socket";
import axios from "axios";
import dotenv from "dotenv";
import { MessageEvent } from "ws";

import {
  IConversation,
  IMessage,
  IMessageHistory,
  TRole,
} from "../core/entity";

dotenv.config();

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

    const newMessage: IMessage = {
      senderId: senderId === "LKM4602_BOT" ? "LKM4602" : senderId,
      conversationId: conversationId,
      message: messageContent,
    };

    await chatModel.saveMessage(conversationId, newMessage);

    ChatService.emitNewMessage(
      conversation,
      conversationId,
      senderId,
      messageContent,
      "MANUAL"
    );

    return newMessage;
  }

  static async summaryChat(conversationId: string) {
    const conversation = await chatModel.getConversationById(conversationId);
    if (!conversation || conversation.messages.length < 1)
      throw new BadRequestError("Conversation not exist");

    let messages: IMessageHistory[] = [];
    await conversation.messages.forEach((chat: IMessage) => {
      messages.push({
        role: chat.senderId === "LKM4602" ? "assistant" : "user",
        content: chat.message,
      });
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

  static async generateChat({
    conversationId,
    manualClick = true,
  }: {
    conversationId: string;
    manualClick?: boolean;
  }) {
    const conversation = await chatModel.getConversationById(conversationId);
    if (!conversation) throw new BadRequestError("Conversation not exist");

    let messages: IMessageHistory[] = [];

    await conversation.messages.forEach((chat: IMessage) => {
      messages.push({
        role: chat.senderId === "LKM4602" ? "assistant" : "user",
        content: chat.message,
      });
    });

    let response;

    if (manualClick) response = ChatService.HandleManualGenerateChat(messages);
    else
      response = ChatService.HandleAutoGenerateChat(
        conversation,
        messages,
        conversationId
      );

    return response;
  }

  static async HandleManualGenerateChat(messages: IMessageHistory[]) {
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

  static async HandleAutoGenerateChat(
    conversation: IConversation,
    messages: IMessageHistory[],
    conversationId: string
  ) {
    let receivedMessages: string[] = [];

    ws.onmessage = async (event: MessageEvent) => {
      const data = JSON.parse(event.data as string);

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
          data.content,
          data.status
        );

        return newMessage;
      }

      ChatService.emitNewMessage(
        conversation,
        conversationId,
        "LKM4602_BOT",
        data.content,
        data.status
      );
    };

    ws.send(JSON.stringify({ messages: messages }));
  }

  static async emitNewMessage(
    conversation: IConversation,
    conversationId: string,
    senderId: string,
    content: string,
    status: string
  ) {
    for (let i of conversation.participants) {
      if (senderId !== "LKM4602_BOT" && i == senderId) {
        continue;
      }

      const receiverSocketId = getReceiverSocketId(i);

      io.to(receiverSocketId).emit("newMessage", {
        message: content,
        status: status,
        conversationId: conversationId,
        senderId: senderId,
      });
    }
  }
}

export default ChatService;

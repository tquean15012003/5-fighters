export interface IConversation {
  id: string;
  name: string;
  participants: string[];
  messages: IMessage[];
  autoMode: boolean;
}

export interface IMessage {
  senderId: string;
  conversationId: string;
  message: string;
}

export type TRole = "assistant" | "user";

export interface IMessageHistory {
  role: TRole;
  content: string;
}

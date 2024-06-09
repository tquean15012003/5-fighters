export type TConversation = {
  id: string;
};

export interface IUserConversationMessage {
  role: "user";
  content: string;
}

export interface IAIConversationMessage
  extends Omit<IUserConversationMessage, "role"> {
  role: "assistant";

  isPending?: boolean;
}

export type IConversationMessage =
  | IUserConversationMessage
  | IAIConversationMessage;

export type ChatMode = "auto" | "manual";

export type TResponseMessageMetaData = {
  senderId: string;
  conversationId: string;
  message: string;
};
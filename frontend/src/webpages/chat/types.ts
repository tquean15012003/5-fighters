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

export type TResponseStatus = {
  status: "ERROR" | "COMPLETE" | "START" | "IN_PROGRESS" | "MANUAL";
};

export type TResponseMessageMetaData = {
  senderId: string;
  conversationId: string;
  message: string;
};

export type TSummaryResponse = {
  summary: string;
  tasks: string[];
};

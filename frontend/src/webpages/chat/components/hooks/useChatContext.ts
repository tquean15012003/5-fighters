import { ChatMode, IConversationMessage } from "../../types";
import { ButtonProps } from "@chakra-ui/react";

export interface UseChatContextProps {
  shouldUseMarkdownUserBubbles: boolean;
  shouldRenderCodeBlock: boolean;
  isLoading: boolean;
  isReceivingMessages: boolean;
  messages: (IConversationMessage & { isPending?: boolean })[];
  colorScheme: ButtonProps["colorScheme"];
  chatMode: ChatMode;
}

const useChatContext = (options: Partial<UseChatContextProps> = {}) => {
  return options;
};

export default useChatContext;

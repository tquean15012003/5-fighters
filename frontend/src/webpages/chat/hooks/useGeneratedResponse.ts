import { useQuery, useQueryClient } from "@tanstack/react-query";
import {IAIConversationMessage, IConversationMessage} from "../types";
import {useContext} from "react";
import {ChatSubscriptionContext} from "../providers/ChatSubscriptionProvider.tsx";

const useGeneratedResponse = (conversationId?: string) => {
  const queryClient = useQueryClient();
  const socket = useContext(ChatSubscriptionContext);

  const onSentGeneratedResponse = () => {
    const AIResponseMessage: {
      generatedResponseMessage: IAIConversationMessage
    } | undefined = queryClient.getQueryData(
        ["generatedResponseMessage",  conversationId]
    )

    queryClient.setQueryData<{
      conversation: IConversationMessage[];
      autoMode: boolean;
    }>(["conversation", conversationId], (oldData) => {
      return {
        autoMode: oldData?.autoMode ?? false,
        conversation: [
          ...(oldData?.conversation || []),
          {
            role: "assistant",
            content: AIResponseMessage?.generatedResponseMessage.content ?? "",
          },
        ],
      };
    });

    socket.emit("newMessage", {
      conversationId,
      msg: AIResponseMessage?.generatedResponseMessage.content ?? "",
    })

    queryClient.setQueryData<{
      generatedResponseMessage: IAIConversationMessage;
    }> (["generatedResponseMessage", conversationId], () => {
      return {
        generatedResponseMessage: {
          role: "assistant",
          content: "",
          isPending: false,
        }
      };
    });
  };

  return {
    onSentGeneratedResponse,
    generatedResponseQuery: useQuery({
      queryKey: ["generatedResponseMessage", conversationId],
      queryFn: async () => {
        const generatedResponseMessage: IAIConversationMessage = {
          role: "assistant",
          content: "",
          isPending: false,
        };
        return { generatedResponseMessage };
      },
      enabled: !!conversationId,
      staleTime: Infinity,
    }),
  };
};

export default useGeneratedResponse;

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {IAIConversationMessage, IConversationMessage} from "../types";
import {useContext} from "react";
import {ChatSubscriptionContext} from "../providers/ChatSubscriptionProvider.tsx";

const useGeneratedResponse = (conversationId?: string) => {
  const queryClient = useQueryClient();
  const socket = useContext(ChatSubscriptionContext);

  const sentGeneratedResponse = () => {
    const AIResponseMessage: IAIConversationMessage | undefined = queryClient.getQueryData(
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
            role: "user",
            content: AIResponseMessage?.content ?? "",
          },
        ],
      };
    });

    socket.emit("newMessage", {
      conversationId,
      msg: AIResponseMessage?.content ?? "",
    })

    queryClient.setQueryData<
        IConversationMessage
    >(["generatedResponseMessage", conversationId], () => {
      return {
        role: "user",
        content: "",
        isPending: false,
      };
    });
  };

  return {
    sentGeneratedResponse: sentGeneratedResponse,
    generatedResponseQuery: useQuery({
      queryKey: ["generatedResponseMessage", conversationId],
      queryFn: async () => {
        return {
          role: "assistant",
          content: "",
          isPending: false,
        };
      },
      enabled: !!conversationId,
      staleTime: Infinity,
    }),
  };
};

export default useGeneratedResponse;

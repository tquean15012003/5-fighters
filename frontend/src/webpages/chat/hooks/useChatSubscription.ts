import { useToast } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  IConversationMessage,
  TResponseMessageMetaData,
  TSummaryResponse,
} from "../types";
import { ChatSubscriptionContext } from "../providers/ChatSubscriptionProvider";
import { axiosClient } from "../../../lib/axios";

const useChatSubscription = (
  params: { id: string },
  options: {
    onMessageSent?: () => void;
    onMessageEnd?: () => void;
  } = {}
) => {
  const { onMessageSent, onMessageEnd } = options;
  const toast = useToast();
  const queryClient = useQueryClient();
  const socket = useContext(ChatSubscriptionContext);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  useEffect(() => {
    socket?.on(
      "newMessage",
      ({
        conversationId,
        newMessage,
      }: {
        conversationId: string;
        newMessage: TResponseMessageMetaData;
      }) => {
        console.log(newMessage);
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
                content: newMessage.message,
              },
            ],
          };
        });
        onMessageEnd?.();
      }
    );
    return () => {
      socket?.off("newMessage");
    };
  }, [socket, queryClient, onMessageEnd]);

  const sendMessage = useCallback(
    async (message: string) => {
      const conversationId = params.id;
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
              content: message,
            },
          ],
        };
      });
      socket.emit("newMessage", {
        conversationId,
        msg: message,
      });
      onMessageSent?.();
    },
    [onMessageSent, params.id, queryClient, socket]
  );

  const endChat = useCallback(async () => {
    const conversationId = params.id;
    setIsLoadingSummary(true);
    try {
      const { data } = await axiosClient.post(`/summaryChat/${params.id}`);
      const { metadata } = data;
      const { summary, tasks } = metadata;
      queryClient.setQueryData<TSummaryResponse>(
        ["summary", conversationId],
        () => {
          return {
            summary,
            tasks,
          };
        }
      );
      setIsLoadingSummary(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong! Please send again!",
        status: "error",
        isClosable: true,
      });
      setIsLoadingSummary(false);
    }
  }, [params.id, queryClient, toast]);

  return useMemo(
    () => ({
      sendMessage,
      isReceivingMessage: false,
      endChat,
      isLoadingSummary,
    }),
    [endChat, isLoadingSummary, sendMessage]
  );
};

export default useChatSubscription;

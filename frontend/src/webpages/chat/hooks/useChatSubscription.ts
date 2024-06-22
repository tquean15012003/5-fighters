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
        senderId,
        newMessage,
      }: {
        conversationId: string;
        senderId: string;
        newMessage: TResponseMessageMetaData;
      }) => {
        queryClient.setQueryData<{
          conversation: IConversationMessage[];
          autoMode: boolean;
        }>(["conversation", conversationId], (oldData) => {
          return {
            autoMode: oldData?.autoMode ?? false,
            conversation: [
              ...(oldData?.conversation || []),
              {
                role:
                  oldData?.autoMode == true && senderId === "LKM4602_BOT"
                    ? "user"
                    : "assistant",
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

  const toggleAutoChat = useCallback(async () => {
    const conversationId = params.id;
    let autoChat = false;
    queryClient.setQueryData<{
      conversation: IConversationMessage[];
      autoMode: boolean;
    }>(["conversation", conversationId], (oldData) => {
      autoChat = !oldData?.autoMode;
      return {
        conversation: oldData?.conversation ?? [],
        autoMode: autoChat,
      };
    });
    socket.emit("toggleAutoChat", {
      conversationId,
      autoChat,
    });
  }, [params.id, queryClient, socket]);

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
      toggleAutoChat,
    }),
    [endChat, isLoadingSummary, sendMessage, toggleAutoChat]
  );
};

export default useChatSubscription;

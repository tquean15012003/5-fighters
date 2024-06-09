import { useToast } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useContext, useEffect, useMemo } from "react";

import { IConversationMessage, TResponseMessageMetaData } from "../types";
import { ChatSubscriptionContext } from "../providers/ChatSubscriptionProvider";
import { axiosClient } from "../../../lib/axios";
import { useAuthContext } from "../../auth/AuthContext";

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
  const { authUser } = useAuthContext();
  const socket = useContext(ChatSubscriptionContext);

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
        queryClient.setQueryData<IConversationMessage[]>(
          ["conversation", conversationId],
          (oldData) => {
            return [
              ...(oldData || []),
              {
                role: "assistant",
                content: newMessage.message,
              },
            ];
          }
        );
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
      queryClient.setQueryData<IConversationMessage[]>(
        ["conversation", conversationId],
        (oldData) => {
          return [
            ...(oldData || []),
            {
              role: "user",
              content: message,
            },
          ];
        }
      );
      try {
        await axiosClient.post(`/senMessage`, {
          senderId: authUser.id,
          messageContent: message,
          conversationId: conversationId,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Something went wrong! Please send again!",
          status: "error",
          isClosable: true,
        });
      }
      onMessageSent?.();
    },
    [authUser.id, onMessageSent, params.id, queryClient, toast]
  );

  return useMemo(
    () => ({
      sendMessage,
      isReceivingMessage: false,
    }),
    [sendMessage]
  );
};

export default useChatSubscription;

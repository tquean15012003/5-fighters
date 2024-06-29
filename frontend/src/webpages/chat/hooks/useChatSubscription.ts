import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useContext, useEffect, useMemo } from "react";

import { IConversationMessage, TResponseMessageMetaData } from "../types";
import { ChatSubscriptionContext } from "../providers/ChatSubscriptionProvider";

import { useAuthContext } from "../../auth/AuthContext";

const useChatSubscription = (
  params: { id: string },
  options: {
    onMessageSent?: () => void;
    onMessageEnd?: () => void;
  } = {}
) => {
  const { onMessageSent, onMessageEnd } = options;
  const queryClient = useQueryClient();
  const socket = useContext(ChatSubscriptionContext);
  const { authUser } = useAuthContext();

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
                  senderId === "LKM4602_BOT" && authUser.role === "agent"
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
  }, [socket, queryClient, onMessageEnd, authUser.role]);

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

  return useMemo(
    () => ({
      sendMessage,
      isReceivingMessage: false,

      toggleAutoChat,
    }),
    [sendMessage, toggleAutoChat]
  );
};

export default useChatSubscription;

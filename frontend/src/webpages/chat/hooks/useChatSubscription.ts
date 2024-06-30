import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  IConversationMessage,
  TResponseMessageMetaData,
  TResponseStatus,
} from "../types";
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
  const [isReceivingMessage, setIsReceivingMessage] = useState(false);

  useEffect(() => {
    socket?.on(
      "newMessage",
      ({
        conversationId,
        senderId,
        message,
        status,
      }: TResponseMessageMetaData & TResponseStatus) => {
        switch (status) {
          case "MANUAL":
            queryClient.setQueryData<{
              conversation: IConversationMessage[];
              autoMode: boolean;
            }>(["conversation", conversationId], (oldData) => {
              return {
                autoMode: oldData?.autoMode ?? false,
                conversation: [
                  ...(oldData?.conversation || []),
                  {
                    role: senderId === authUser.id ? "user" : "assistant",
                    content: message,
                  },
                ],
              };
            });
            break;
          case "START":
            setIsReceivingMessage(true);
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
                    content: message,
                    isPending: true,
                  },
                ],
              };
            });
            break;
          case "IN_PROGRESS":
            queryClient.setQueryData<{
              conversation: IConversationMessage[];
              autoMode: boolean;
            }>(["conversation", conversationId], (oldData) => {
              const oldDataConversation = oldData?.conversation ?? [];
              const oldConversation =
                oldDataConversation?.slice(0, oldDataConversation.length - 1) ||
                [];
              const lastMsg =
                oldDataConversation?.[oldDataConversation.length - 1];
              const newContent = `${lastMsg.content}${message}`;

              return {
                autoMode: oldData?.autoMode ?? false,
                conversation: [
                  ...oldConversation,
                  {
                    role:
                      senderId === "LKM4602_BOT" && authUser.role === "agent"
                        ? "user"
                        : "assistant",
                    content: newContent,
                  },
                ],
              };
            });
            break;
          case "COMPLETE":
          case "ERROR":
          default:
            setIsReceivingMessage(false);
            onMessageEnd?.();
            break;
        }
      }
    );
    return () => {
      socket?.off("newMessage");
    };
  }, [socket, queryClient, onMessageEnd, authUser.role, authUser.id]);

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
      isReceivingMessage,
      toggleAutoChat,
    }),
    [sendMessage, toggleAutoChat, isReceivingMessage]
  );
};

export default useChatSubscription;

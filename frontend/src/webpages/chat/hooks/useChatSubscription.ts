import { useToast } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { IConversationMessage } from "../types";

type SubscriptionMessage =
  | {
      answer: "START";
      status: "START";
      conversation_id: string;
    }
  | {
      answer: string;
      status: "IN_PROGRESS";
      conversation_id: string;
    }
  | {
      answer: string;
      status: "COMPLETE_REASONING";
      conversation_id: string;
    }
  | {
      answer: string;
      conversation_id: string;
      status: "COMPLETE";
    }
  | {
      answer: string;
      status: "ERROR";
      conversation_id: string;
    };

const useChatSubscription = (
  params: { id: string },
  options: {
    onMessageReceived?: (message: SubscriptionMessage) => void;
    onMessageSent?: (message: string) => void;
    onMessageEnd?: (message: SubscriptionMessage) => void;
  } = {}
) => {
  const { onMessageReceived, onMessageSent, onMessageEnd } = options;
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isReceivingMessage, setReceivingMessage] = useState<
    Record<string, boolean>
  >({});
  const [cummulativeMessage, setCummulativeMessage] = useState<
    Record<string, string>
  >({});

  const sendMessage = useCallback(
    (query: string) => {
      const conversation_id = params.id;
      setReceivingMessage((prev) => {
        prev[conversation_id] = true;
        return { ...prev };
      });

      queryClient.setQueryData<IConversationMessage[]>(
        ["conversation", conversation_id],
        (oldData) => {
          return [
            ...(oldData || []),
            {
              role: "user",
              content: query,
            },
          ];
        }
      );
      onMessageSent?.(query);

      fetch(`${process.env.REACT_API_BASE_URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id,
          query,
        }),
      })
        .then((response) => {
          if (!response.body) {
            console.error("Response body is null");
            return Promise.reject(new Error("Response body is null"));
          }
          const reader = response.body.getReader();
          const processStream = async () => {
            while (true) {
              try {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = new TextDecoder().decode(value);
                const lines = chunk
                  .split("\n")
                  .filter((line) => line.startsWith("data:"));
                for (const line of lines) {
                  // Remove "data: " prefix and parse the JSON
                  try {
                    onReceiveMessage(line.substring(5));
                  } catch (error) {
                    console.error("Error parsing JSON:", error);
                  }
                }

                // Accumulate the text chunks (if applicable)
                // Here, you can also handle each chunk as it arrives,
                // e.g., parsing JSON chunks, updating UI, etc.
              } catch (error) {
                console.error("Error reading the stream", error);
                reader.cancel();
                throw error;
              }
            }
          };

          return processStream();
        })
        .catch((err) => console.error("Fetch error:", err));
    },
    [onMessageSent, params.id, queryClient]
  );

  const onReceiveMessage = useCallback(
    (message: string) => {
      // console.log(message);
      const data = JSON.parse(message || "{}") as SubscriptionMessage;
      const receivingConversationId = data.conversation_id;
      switch (data.status) {
        case "START":
          const converastion = queryClient.getQueryData<IConversationMessage[]>(
            ["conversation", receivingConversationId]
          );
          if (
            !converastion ||
            (converastion &&
              converastion[converastion.length - 1].role === "user")
          ) {
            queryClient.setQueryData<IConversationMessage[]>(
              ["conversation", receivingConversationId],
              (oldData) => [
                ...(oldData || []),
                {
                  content: "",
                  role: "assistant",
                  isPending: true,
                },
              ]
            );
            setReceivingMessage((prev) => {
              prev[receivingConversationId] = true;
              return { ...prev };
            });
          }

          break;
        case "IN_PROGRESS":
          queryClient.setQueryData<IConversationMessage[]>(
            ["conversation", receivingConversationId],
            (oldData = []) => {
              // const [...oldMessages, lastMsg] = oldData || [];
              const oldMessages = oldData?.slice(0, oldData.length - 1) || [];
              const lastMsg = oldData?.[oldData.length - 1];
              const newContent = `${cummulativeMessage[receivingConversationId] ?? ""}${data.answer}`
              console.log(newContent)
              return [
                ...oldMessages,
                {
                  ...lastMsg,
                  content: newContent,
                },
              ];
            }
          );
          setReceivingMessage((prev) => {
            prev[receivingConversationId] = true;
            return { ...prev };
          });
          break;
        case "COMPLETE_REASONING":
          setCummulativeMessage((prev) => {
            prev[receivingConversationId] = `${prev[receivingConversationId] ?? ""}${data.answer}\n`;
            return { ...prev };
          });
          break;
        case "COMPLETE":
          queryClient.setQueryData<IConversationMessage[]>(
            ["conversation", receivingConversationId],
            (oldData = []) => {
              const oldMessages = oldData?.slice(0, oldData.length - 1) || [];
              const lastMsg = oldData?.[oldData.length - 1];

              return [
                ...oldMessages,
                {
                  ...lastMsg,
                  isPending: false,
                },
              ];
            }
          );
          onMessageEnd?.(data);
          setReceivingMessage((prev) => {
            prev[receivingConversationId] = false;
            return { ...prev };
          });
          setCummulativeMessage((prev) => {
            prev[receivingConversationId] = "";
            return { ...prev };
          });
          break;
        case "ERROR":
          queryClient.setQueryData<IConversationMessage[]>(
            ["conversation", receivingConversationId],
            (oldData = []) => {
              const oldMessages = oldData?.slice(0, oldData.length - 1) || [];

              return [...oldMessages];
            }
          );
          setReceivingMessage((prev) => {
            prev[receivingConversationId] = false;
            return { ...prev };
          });
          setCummulativeMessage((prev) => {
            prev[receivingConversationId] = "";
            return { ...prev };
          });
          toast({
            title: "Error",
            description: data.answer,
            status: "error",
            isClosable: true,
          });
          break;
      }

      onMessageReceived?.(data);
    },
    [onMessageEnd, onMessageReceived, queryClient, toast]
  );

  return useMemo(
    () => ({
      sendMessage,
      isReceivingMessage: isReceivingMessage[params.id],
    }),
    [isReceivingMessage, params.id, sendMessage]
  );
};

export default useChatSubscription;

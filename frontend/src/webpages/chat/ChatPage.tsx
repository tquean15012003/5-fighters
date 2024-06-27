import { ReactComponent as HelloBotIcon } from "../../assets/icons/hello-bot.svg";

import {
  Panel,
  PanelContent,
  PanelBody,
  PanelFooter,
} from "../../components/panel";
import { Box, HStack, Stack, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import {
  Chat,
  ChatInput,
  ChatMessages,
  SendChatButton,
} from "./components/Chat";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useConversation from "./hooks/useConversation";
import FallbackPage from "../misc/FallbackPage";
import useChatSubscription from "./hooks/useChatSubscription";
import useInterval from "../../hooks/useInterval";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";
import { AgentActionListSideBar } from "./components/AgentActionListSideBar";
import useSummary from "./hooks/useSummary";
import { AfterEndChatModel } from "./components/AfterEndChatModel.tsx";
import useGeneratedResponse from "./hooks/useGeneratedResponse.ts";
import { GeneratedResponseModel } from "./components/GeneratedResponseModel.tsx";

const ChatPage = () => {
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>();
  const entry = useIntersectionObserver(bottomRef as any, {
    threshold: 0,
    rootMargin: "-80px",
  });
  const {
    data: conversationData,
    isLoading: isLoadingConversation,
    error: conversationError,
  } = useConversation(id);

  const { resetSummary, summaryQuery } = useSummary(id);
  const { data: summaryAndTasks, error: summaryError } = summaryQuery;
  const isSummaryModelOpen =
    summaryAndTasks?.summary.length !== 0 ||
    summaryAndTasks?.tasks.length !== 0;

  const { onSentGeneratedResponse, generatedResponseQuery } = useGeneratedResponse(id)
  const { data: generatedResponseMessage, error: generatedResponseMessageError } = generatedResponseQuery;
  const isGeneratedModelOpen = generatedResponseMessage?.generatedResponseMessage.content.length !== 0;

  const { conversation, autoMode } = conversationData ?? {};
  const {
    sendMessage,
    endChat,
    isReceivingMessage,
    isLoadingSummary,
    isGeneratingAIChat,
    toggleAutoChat,
    generateResponse,
  } = useChatSubscription(
    {
      id: id || "",
    },
    {
      onMessageSent: () => scrollToBottom(),
      onMessageEnd: () => scrollToBottom(),
    }
  );

  const isLoading = isLoadingConversation || isLoadingSummary || isGeneratingAIChat;

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      if (!isLoading) {
        bottomRef.current?.scrollIntoView({ behavior });
      }
    },
    [isLoading]
  );

  useEffect(() => {
    if (isReceivingMessage && !entry?.isIntersecting) {
      scrollToBottom();
    }
  }, [entry?.isIntersecting, isReceivingMessage, scrollToBottom]);

  useEffect(() => {
    if (id && !isLoading) {
      scrollToBottom("instant");
    }
  }, [id, isLoading, scrollToBottom]);

  useInterval(scrollToBottom, isReceivingMessage ? 500 : null);

  const filteredConversations = useMemo(() => {
    if (!conversation) return [];
    return conversation
      .filter((msg) => ["assistant", "user"].includes(msg.role))
      .map((msg, i) => ({
        ...msg,
        key: i,
      }));
  }, [conversation]);

  if (conversationError || summaryError || generatedResponseMessageError) {
    return (
      <FallbackPage
        message={`An error occured while fetching the conversation details. Please try again later or contact support.`}
      />
    );
  }

  return (
    <Panel>
      <PanelContent>
        <Chat
          colorScheme={`brand.purple`}
          messages={filteredConversations}
          isLoading={isLoading}
          isReceivingMessages={isReceivingMessage}
          chatMode={autoMode ? "auto" : "manual"}
        >
          <PanelBody>
            <Stack spacing={4} overflow="auto" flexGrow={1}>
              <HStack
                w="fit-content"
                mx="auto"
                gap={4}
                bg="gray.300"
                px={4}
                py={3}
                borderRadius="md"
              >
                <Box boxSize="52px" minW="52px">
                  <HelloBotIcon width="full" height="full" />
                </Box>
                <Stack gap={0}>
                  <Text fontWeight="bold">Start chatting</Text>
                  <Text>Study with AI Tutor by sending queries below.</Text>
                </Stack>
              </HStack>
              <ChatMessages />

              <Box id="bottom-scroll" ref={bottomRef as any} />
            </Stack>
          </PanelBody>
          <PanelFooter>
            <HStack gap={4}>
              <ChatInput
                flexGrow={1}
                borderColor="gray.200"
                bg="white"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    e.shiftKey === false &&
                    message !== ""
                  ) {
                    e.preventDefault();
                    sendMessage(message);
                    setMessage("");
                  }
                }}
              />
              <SendChatButton
                hasInputMessage={message !== "" && !!message?.length}
                onClick={() => {
                  sendMessage(message);
                  setMessage("");
                }}
              />
              <AgentActionListSideBar
                isLoadingSummary={isLoadingSummary}
                isGeneratingAIChat={isGeneratingAIChat}
                handleEndChat={endChat}
                handleAutoChat={toggleAutoChat}
                handleGenerateResponse={generateResponse}/>
              <GeneratedResponseModel
                generatedResponseMessage={generatedResponseMessage?.generatedResponseMessage?.content ?? ""}
                onCloseModal={onSentGeneratedResponse}
                isOpen={isGeneratedModelOpen}
              />
              <AfterEndChatModel
                summary={summaryAndTasks?.summary ?? ""}
                tasks={summaryAndTasks?.tasks ?? []}
                onCloseModal={resetSummary}
                isOpen={isSummaryModelOpen}
              />
            </HStack>
          </PanelFooter>
        </Chat>
      </PanelContent>
    </Panel>
  );
};

export default ChatPage;

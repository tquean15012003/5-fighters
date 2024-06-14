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
import { AfterChatModel } from "./components/AfterChatModel";

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
  const isOpen =
    summaryAndTasks?.summary.length !== 0 ||
    summaryAndTasks?.tasks.length !== 0;

  const { conversation, autoMode } = conversationData ?? {};
  const {
    sendMessage,
    endChat,
    isReceivingMessage,
    isLoadingSummary,
    toggleAutoChat,
  } = useChatSubscription(
    {
      id: id || "",
    },
    {
      onMessageSent: () => scrollToBottom(),
      onMessageEnd: () => scrollToBottom(),
    }
  );

  const isLoading = isLoadingConversation || isLoadingSummary;

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

  if (conversationError || summaryError) {
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
                isLoading={isLoadingSummary}
                handleEndChat={endChat}
                handleAutoChat={toggleAutoChat}
              />
              <AfterChatModel
                summary={summaryAndTasks?.summary ?? ""}
                tasks={summaryAndTasks?.tasks ?? []}
                onCloseModal={resetSummary}
                isOpen={isOpen}
              />
            </HStack>
          </PanelFooter>
        </Chat>
      </PanelContent>
    </Panel>
  );
};

export default ChatPage;

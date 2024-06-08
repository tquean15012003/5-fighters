import AutoResizeTextarea from "../../../components/AutoResizeTextarea";
import {
  IconButton,
  IconButtonProps,
  SkeletonProps,
  Stack,
  StackProps,
} from "@chakra-ui/react";
import { PaperPlaneRight } from "@phosphor-icons/react";
import "highlight.js/styles/github-dark.css";
import React, { ComponentProps, PropsWithChildren } from "react";

import useChatComponent from "./hooks/useChatComponent";
import { UseChatContextProps } from "./hooks/useChatContext";
import { ChatProvider } from "./providers/ChatProvider";
import { ChatBubble } from "./ChatBubble";
import { ChatBubbleSkeleton } from "./ChatBubble";

export const ChatInput: React.FC<
  ComponentProps<typeof AutoResizeTextarea> & {
    receivingMessagePlaceholder?: string;
  }
> = ({ isDisabled, placeholder, receivingMessagePlaceholder, ...props }) => {
  const { isLoading, isReceivingMessages } = useChatComponent();
  return (
    <AutoResizeTextarea
      isDisabled={isLoading || isReceivingMessages}
      placeholder={
        isReceivingMessages
          ? receivingMessagePlaceholder ?? "Receiving messages..."
          : placeholder ?? "Type a message..."
      }
      {...props}
    />
  );
};

export const SendChatButton: React.FC<
  Omit<IconButtonProps, "aria-label"> & {
    "aria-label"?: string;
    hasInputMessage: boolean;
  }
> = ({ icon, "aria-label": ariaLabel, hasInputMessage, ...props }) => {
  const { isLoading, isReceivingMessages, colorScheme } = useChatComponent();

  return (
    <IconButton
      borderRadius="full"
      icon={icon ?? <PaperPlaneRight />}
      aria-label={ariaLabel ?? "send message"}
      isDisabled={isLoading || isReceivingMessages || !hasInputMessage}
      colorScheme={colorScheme}
      {...props}
    />
  );
};

export const ChatMessagesSkeleton: React.FC<
  StackProps & { messagesCount?: number; skeletonProps?: SkeletonProps }
> = ({ messagesCount = 6, skeletonProps = {}, ...stackProps }) => {
  return (
    <Stack spacing={6} w="full" {...stackProps}>
      {Array.from({ length: messagesCount }).map((_, index) => (
        <ChatBubbleSkeleton
          key={index}
          chatRole={index % 2 === 0 ? "user" : "assistant"}
          {...skeletonProps}
        />
      ))}
    </Stack>
  );
};

export const ChatMessages: React.FC<Omit<StackProps, "children">> = ({
  ...props
}) => {
  const {
    messages,
    colorScheme,
    shouldUseMarkdownUserBubbles,
    shouldRenderCodeBlock,
    // isReceivingMessages,
    isLoading,
  } = useChatComponent();

  return (
    <Stack spacing={4} w="full" {...props}>
      {isLoading ? (
        <ChatMessagesSkeleton />
      ) : (
        messages?.map(({ content, role, isPending }, i) => (
          <ChatBubble
            key={i}
            chatRole={role}
            isPending={isPending}
            shouldRenderCodeBlock={shouldRenderCodeBlock}
            shouldUseMarkdownUserBubbles={shouldUseMarkdownUserBubbles}
            colorScheme={colorScheme}
          >
            {content}
          </ChatBubble>
        ))
      )}
    </Stack>
  );
};

export const Chat: React.FC<
  Partial<UseChatContextProps> & PropsWithChildren
> = ({ children, colorScheme = "blackAlpha", ...options }) => {
  return (
    <ChatProvider colorScheme={colorScheme} {...options}>
      {children}
    </ChatProvider>
  );
};

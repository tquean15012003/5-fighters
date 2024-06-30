import { ReactComponent as Loader } from "../../../assets/horizontal-loader.svg";
import { IConversationMessage } from "../types";
import { Box, BoxProps, useTheme } from "@chakra-ui/react";
import { Skeleton, SkeletonProps } from "@chakra-ui/react";
import React from "react";

import { UseChatContextProps } from "./hooks/useChatContext";
import { getChatBubbleProps } from "../utils";
import { ChatBubbleMarkdown } from "./ChatBubbleMarkdown";

// TODO: Handle children
export const ChatBubble: React.FC<
  Omit<BoxProps, "role"> &
    Partial<
      Pick<
        UseChatContextProps,
        "colorScheme" | "shouldUseMarkdownUserBubbles" | "shouldRenderCodeBlock"
      >
    > & {
      chatRole?: IConversationMessage["role"];
      isPending?: boolean;
    }
> = ({
  colorScheme,
  shouldUseMarkdownUserBubbles,
  chatRole = "user",
  isPending,
  children,
  shouldRenderCodeBlock,
  ...props
}) => {
  const theme = useTheme();

  const renderCode =
    shouldRenderCodeBlock ||
    ((chatRole === "assistant" ||
      (chatRole === "user" && shouldUseMarkdownUserBubbles)) &&
      !isPending);
  const showCursor =
    isPending && (typeof children === "string" ? !!children?.length : false);
  const showLoader =
    isPending && (typeof children === "string" ? !children?.length : !children);

  const chatBubbleProps = getChatBubbleProps(chatRole, colorScheme, theme);

  const shouldUseMarkdown =
    typeof children === "string" &&
    ((chatRole === "user" && shouldUseMarkdownUserBubbles) ||
      chatRole === "assistant");

  return (
    <Box
      __css={
        showCursor
          ? {
              "& > p:last-child, & > *:last-child > li:last-child": {
                display: "inline-block",
                ".bubble-cursor": {
                  display: "inline-block",
                },
              },
            }
          : {}
      }
      {...chatBubbleProps}
      {...props}
    >
      {showLoader ? (
        <Loader height="30px" />
      ) : shouldUseMarkdown ? (
        <ChatBubbleMarkdown
          renderCode={renderCode}
          colorScheme={colorScheme}
          showCursor={showCursor}
        >
          {children}
        </ChatBubbleMarkdown>
      ) : (
        children
      )}
    </Box>
  );
};
export const ChatBubbleSkeleton: React.FC<
  SkeletonProps & { chatRole: IConversationMessage["role"] }
> = ({ chatRole, ...props }) => (
  <Skeleton
    borderRadius={
      chatRole === "user" ? "10px 10px 0px 10px" : "10px 10px 10px 0px"
    }
    alignSelf={chatRole === "user" ? "flex-end" : "flex-start"}
    w="40%"
    h="50px"
    {...props}
  />
);

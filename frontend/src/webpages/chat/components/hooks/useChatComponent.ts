import { IConversationMessage } from "../../types";
import { getValidTextColor } from "../../../../theme/utils";
import { BoxProps, getToken, useTheme } from "@chakra-ui/react";
import { useCallback, useContext, useMemo } from "react";

import { ChatContext } from "../providers/ChatProvider";
import { UseChatContextProps } from "./useChatContext";

const useChatComponent = () => {
  const theme = useTheme();
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChatComponent must be used within a ChatProvider");
  }

  const getChatBubbleProps = useCallback(
    (
      role: IConversationMessage["role"],
      colorScheme: UseChatContextProps["colorScheme"] = context.colorScheme ??
        "gray"
    ): BoxProps => {
      const [light, mid, dark] = getToken("colors", [
        `${colorScheme}.50`,
        `${colorScheme}.500`,
        `${colorScheme}.900`,
      ])(theme);

      const onPrimaryColor = getValidTextColor(mid, dark, light);

      const baseProps: BoxProps = {
        py: 3,
        px: 6,
        maxWidth: { base: "90%", md: "80%" },
      };

      switch (role) {
        case "user":
          return {
            ...baseProps,
            borderRadius: "10px 10px 0px 10px",
            alignSelf: "flex-end",
            background: mid,
            color: onPrimaryColor,
          };
        case "assistant":
          return {
            ...baseProps,
            borderRadius: "10px 10px 10px 0px",
            alignSelf: "flex-start",
            background: "white",
            color: "black",
          };
      }
    },
    [context.colorScheme, theme]
  );

  return useMemo(
    () => ({
      ...context,
      getChatBubbleProps,
    }),
    [context, getChatBubbleProps]
  );
};

export default useChatComponent;

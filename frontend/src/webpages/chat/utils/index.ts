import { IConversationMessage } from "../types";
import { getValidTextColor } from "../../../theme/utils";
import { BoxProps, WithCSSVar, getToken } from "@chakra-ui/react";
import { UseChatContextProps } from "../components/hooks/useChatContext";

export const getChatBubbleProps = (
  role: IConversationMessage["role"],
  colorScheme: UseChatContextProps["colorScheme"] = "gray",
  theme: WithCSSVar<any>
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
    whiteSpace: "pre-wrap",
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
};

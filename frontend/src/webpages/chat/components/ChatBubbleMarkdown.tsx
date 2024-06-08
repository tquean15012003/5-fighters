import {
  Box,
  Link,
  ListItem,
  OrderedList,
  Text,
  UnorderedList,
  keyframes,
  useToken,
} from "@chakra-ui/react";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import React from "react";
import Markdown, { Options as MarkdownOptions } from "react-markdown";
import remarkGfm from "remark-gfm";

import { UseChatContextProps } from "./hooks/useChatContext";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("python", python);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("bash", bash);

const colors = ["purple", "blue", "teal", "orange"];
const opacities = [1, 0];
export const flicker = keyframes(
  Object.fromEntries(
    ["purple", "blue", "teal", "orange"]
      .map((color, i) =>
        opacities.map((opacity, k) => [
          `${
            ((opacities.length * i + k + 1) /
              (opacities.length * colors.length)) *
            100
          }%`,
          {
            opacity,
            backgroundColor: `var(--chakra-colors-brand-${color}-500)`,
          },
        ])
      )
      .flat()
  )
);

export const ChatBubbleMarkdown: React.FC<
  MarkdownOptions & {
    renderCode?: boolean;
    showCursor?: boolean;
    colorScheme?: UseChatContextProps["colorScheme"];
  }
> = ({
  renderCode,
  children,
  components,
  colorScheme = "gray",
  ...options
}) => {
  const linkColor = useToken("colors", `${colorScheme}.700`);

  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        ol: (props) => {
          const { node, ...rest } = props;
          return <OrderedList marginLeft={10} whiteSpace="normal" {...rest} />;
        },
        ul: (props) => {
          const { node, ...rest } = props;
          return <UnorderedList {...rest} />;
        },
        li: (props) => {
          const { node, ...rest } = props;
          return <ListItem {...rest} />;
        },
        p: (props) => {
          const { node, children, ...rest } = props;

          return (
            <Text {...rest}>
              {children}
              <Box
                className="bubble-cursor"
                as="span"
                boxSize="16px"
                borderRadius="full"
                bg="brand.purple.500"
                animation={`${flicker} 3s infinite`}
                mb="-2px"
                ml={1}
                display="none"
              />
            </Text>
          );
        },
        code: (props) => {
          const { children, className, node, ...rest } = props;
          const match = /language-(\w+)/.exec(className || "");
          return match &&
            hljs.listLanguages().includes(match[1]) &&
            renderCode ? (
            <code
              dangerouslySetInnerHTML={{
                __html: hljs.highlight(children as string, {
                  language: match[1],
                }).value,
              }}
            />
          ) : (
            <code {...rest}>{children}</code>
          );
        },
        a: (props) => {
          const { node, ...rest } = props;
          return (
            <Link
              isExternal
              color={linkColor}
              textDecor="underline"
              {...rest}
            />
          );
        },
        td: (props) => {
          const { node, ...rest } = props;
          return (
            <Box
              as="td"
              px={3}
              py={2}
              borderBottom="1px solid"
              borderColor="gray.200"
              {...rest}
            />
          );
        },
        th: (props) => {
          const { node, ...rest } = props;
          return (
            <Box
              as="th"
              px={3}
              py={2}
              borderBottom="1.5px solid"
              borderColor="gray.300"
              textAlign="left"
              {...rest}
            />
          );
        },
        ...components,
      }}
      {...options}
    >
      {children}
    </Markdown>
  );
};

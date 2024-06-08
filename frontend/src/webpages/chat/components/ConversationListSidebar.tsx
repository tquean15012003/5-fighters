import { ReactComponent as HelloBotIcon } from "../../../assets/icons/hello-bot.svg";

import { DarkModeBox } from "../../../components/ColorMode";
import { Center, HStack, Skeleton, Stack, Text } from "@chakra-ui/react";
import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import useConversationList from "../hooks/useConversationList";

const ConversationListSidebar: React.FC = () => {
  const { data, isLoading } = useConversationList();

  const transformedData = useMemo(() => {
    if (!data) {
      return [];
    }
    return data;
  }, [data]);
  if (transformedData.length === 0) {
    return null;
  }

  return (
    <DarkModeBox h="full">
      <Stack
        w="full"
        maxW="300px"
        minW={{ md: "300px", lg: "300px" }}
        h="full"
        p={4}
        justify="space-between"
        overflow="auto"
      >
        <Stack spacing={1} py={1} px={2}>
          <HStack>
            <Center
              height="32px"
              width="32px"
              background="gray.300"
              borderRadius="full"
            >
              <HelloBotIcon />
            </Center>
            <Text
              sx={{
                fontSize: "2xl",
                fontWeight: "bold",
              }}
              mt={0.5}
            >
              Chats
            </Text>
          </HStack>
          {isLoading && (
            <>
              <Skeleton h="40px" w="full" />
              <Skeleton h="40px" w="full" />
              <Skeleton h="40px" w="full" />
            </>
          )}
          {transformedData.map((conversation) => (
            <HStack
              as={NavLink}
              to={`/${conversation.conversationId}`}
              _hover={{
                bg: `gray.700`,
              }}
              sx={{
                "&.active": {
                  bg: "gray.700",
                },
              }}
              key={conversation.conversationId}
              p={2}
              role="group"
              borderRadius="md"
              cursor="pointer"
              transition="background 0.2s ease, color 0.2s ease"
              align="center"
            >
              <Text
                sx={{
                  ".active > &": {
                    color: "white",
                  },
                }}
                mt={0.5}
              >
                {conversation.conversationTitle}
              </Text>
            </HStack>
          ))}
        </Stack>
      </Stack>
    </DarkModeBox>
  );
};

export default ConversationListSidebar;

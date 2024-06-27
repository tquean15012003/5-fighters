import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { useRef } from "react";
import { useAuthContext } from "../../auth/AuthContext";
import useChatComponent from "./hooks/useChatComponent";

type TProps = {
  isLoadingSummary: boolean;
  isGeneratingAIChat: boolean;
  handleGenerateResponse: () => void;
  handleAutoChat: () => void;
  handleEndChat: () => void;
};
export const AgentActionListSideBar = ({
  isLoadingSummary,
  isGeneratingAIChat,
  handleGenerateResponse,
  handleAutoChat,
  handleEndChat,
}: TProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef(null);
  const { chatMode } = useChatComponent();

  const { authUser } = useAuthContext();
  if (authUser.role === "customer") {
    return null;
  }
  console.log(isLoadingSummary);
  return (
    <>
      <Button ref={btnRef} colorScheme="purple" onClick={onOpen}>
        Tools
      </Button>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={() => {
          if (!isLoadingSummary && !isGeneratingAIChat) {
            onClose();
          }
        }}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton disabled={isLoadingSummary || isGeneratingAIChat} />
          <DrawerHeader>Assistant Tools</DrawerHeader>

          <DrawerBody>
            <Flex
              height="full"
              justifyContent="center"
              alignItems="start"
              flexDirection="column"
              gap="10"
            >
              <Button
                colorScheme="green"
                _hover={{
                  bg: "red.500",
                }}
                disabled={isGeneratingAIChat}
                onClick={handleGenerateResponse}
              >
                Generate response
                {isGeneratingAIChat && <Spinner />}
              </Button>
              <Button
                colorScheme="blue"
                _active={{
                  bg: "orange.500",
                }}
                disabled={isLoadingSummary}
                onClick={handleAutoChat}
              >
                {chatMode === "manual" ? "Auto Chat" : "Manual Chat"}
              </Button>
              <Button
                colorScheme="red"
                disabled={isLoadingSummary}
                onClick={handleEndChat}
              >
                End chat
                {isLoadingSummary && <Spinner />}
              </Button>
            </Flex>
          </DrawerBody>

          <DrawerFooter>
            <Button
              colorScheme="red"
              mr={3}
              disabled={isLoadingSummary}
              onClick={onClose}
            >
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

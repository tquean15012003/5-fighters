import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

type TProps = {
  summary: string;
  tasks: string[];
  isOpen: boolean;
  onCloseModal: () => void;
};
export const AfterEndChatModel = ({
  onCloseModal,
  summary,
  tasks,
  isOpen,
}: TProps) => {
  const { onClose } = useDisclosure();

  const handleClose = () => {
    onCloseModal();
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>After Chat WrapUp</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex flexDirection="column" gap={5}>
            <Box>
              <Text fontWeight="bold">Summary</Text>
              <Text>{summary}</Text>
            </Box>
            {tasks.length !== 0 && (
              <Box>
                <Text fontWeight="bold">Tasks</Text>
                {tasks.map((task) => {
                  return (
                    <Text key={task}>
                      <b>*</b> {task}
                    </Text>
                  );
                })}
              </Box>
            )}
          </Flex>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="green" mr={3} onClick={handleClose}>
            Save
          </Button>
          <Button colorScheme="blue" mr={3} onClick={handleClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

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
    generatedResponseMessage: string;
    isOpen: boolean;
    onCloseModal: () => void;
};
export const GeneratedResponseModel = ({
                                           onCloseModal,
                                           generatedResponseMessage,
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
                <ModalHeader>AI Response Message Confirmation</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Flex flexDirection="column" gap={5}>
                        <Box>
                            <Text fontWeight="bold">Generated Response</Text>
                            <Text>{generatedResponseMessage}</Text>
                        </Box>
                    </Flex>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="green" mr={3} onClick={handleClose}>
                        Sent
                    </Button>
                    <Button colorScheme="blue" mr={3} onClick={handleClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

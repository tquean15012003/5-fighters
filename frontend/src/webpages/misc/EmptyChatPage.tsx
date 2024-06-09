import { ReactComponent as HelloBotIcon } from "../../assets/icons/hello-bot.svg";
import { Panel } from "../..//components/panel";
import { Center, Container, Heading, Spinner, Stack } from "@chakra-ui/react";

type TProps = {
  isLoading?: boolean;
};

const EmptyChatPage = ({ isLoading = true }: TProps) => {
  return (
    <Panel>
      <Container centerContent w="full" mt={12}>
        <Stack spacing={8} align="center" justify="center" textAlign="center">
          <HelloBotIcon />
          <Heading fontWeight="bold">Welcome to 5 Fighters</Heading>
          {isLoading && (
            <Center w="full" h="200px">
              <Spinner size="xl" color="brand.purple.500" />
            </Center>
          )}
        </Stack>
      </Container>
    </Panel>
  );
};

export default EmptyChatPage;

import { ReactComponent as ErrorIcon } from "../../assets/icons/wrench-alert.svg";
import { Panel } from "../../components/panel";
import { Button, Container, Heading, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";

const FallbackPage: React.FC<{
  title?: string;
  message?: string;
  redirectUrl?: string;
  redirectButtonText?: string;
}> = ({
  title = "Oops something went wrong",
  message = "An error has occurred. Please try again later or contact support.",
  redirectUrl = "/",
  redirectButtonText = "Back to Home",
}) => {
  return (
    <Panel>
      <Container centerContent w="full" mt={12}>
        <Stack spacing={8} align="center" justify="center" textAlign="center">
          <ErrorIcon />
          <Heading>{title}</Heading>
          <Text maxW="400px">{message} </Text>
          <Link to={redirectUrl} replace>
            <Button colorScheme="brand.purple">{redirectButtonText}</Button>
          </Link>
        </Stack>
      </Container>
    </Panel>
  );
};

export default FallbackPage;

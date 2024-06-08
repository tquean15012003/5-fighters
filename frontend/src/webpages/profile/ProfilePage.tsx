import { TRole } from "./types";
import { Panel, PanelBody, PanelContent } from "../../components/panel";

import {
  Button,
  Center,
  HStack,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";

type TProps = {
  displayName: string;
  role: TRole;
  onClick: () => void;
};

const PROFILES = [
  {
    displayName: "Customer 1",
    role: "customer",
  },
  {
    displayName: "Customer 2",
    role: "customer",
  },
  {
    displayName: "Customer 3",
    role: "customer",
  },
  {
    displayName: "Customer 4",
    role: "customer",
  },
  {
    displayName: "Customer 5",
    role: "customer",
  },
  {
    displayName: "Agent",
    role: "agent",
  },
];

const InfoCard = ({ displayName, role, onClick }: TProps) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      _hover={{ bg: "gray.100" }}
      p={12}
      w="full"
      textAlign="left"
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow="md"
    >
      <VStack align="start">
        <Text fontWeight="bold" color="teal.500">
          Name: {displayName}
        </Text>
        <Text color="gray.600">Role: {role}</Text>
      </VStack>
    </Button>
  );
};

const Profiles = () => {
  const handleCardOnClick = (displayName: string, role: TRole) => {
    localStorage.setItem(
      "user-info",
      JSON.stringify({
        displayName,
        role,
      })
    );
  };
  return (
    <Panel>
      <PanelContent>
        <PanelBody>
          <Center height="full" width="full" flexDirection="column" gap={5}>
            <HStack
              w="fit-content"
              mx="auto"
              gap={4}
              bg="gray.300"
              px={4}
              py={3}
              borderRadius="md"
            >
              <Stack gap={0}>
                <Text fontSize="4xl" fontWeight="bold">Welcome to 5 Fighters</Text>
              </Stack>
            </HStack>
            <SimpleGrid
              alignItems="center"
              justifyItems="center"
              //   width="full"
              //   height="full"
              columns={[1, null, 3]}
              spacing={4}
            >
              {PROFILES.map(({ displayName, role }) => {
                return (
                  <InfoCard
                    displayName={displayName}
                    role={role as TRole}
                    onClick={() => {
                      handleCardOnClick(displayName, role as TRole);
                    }}
                  />
                );
              })}
            </SimpleGrid>
          </Center>
        </PanelBody>
      </PanelContent>
    </Panel>
  );
};

export default Profiles;

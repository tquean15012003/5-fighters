import { TRole, TUser } from "./types";
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
import { useNavigate } from "react-router-dom";
import useSession from "./hooks/useSession";
import EmptyChatPage from "../misc/EmptyChatPage";

type TProps = {
  displayName: string;
  role: TRole;
  onClick: () => void;
};

export const PROFILES: TUser[] = [
  {
    displayName: "Customer 1",
    role: "customer",
    id: "JD1923",
  },
  {
    displayName: "Customer 2",
    role: "customer",
    id: "ASH8675",
  },
  {
    displayName: "Customer 3",
    role: "customer",
    id: "BLU554",
  },
  {
    displayName: "Customer 4",
    role: "customer",
    id: "PRM2310",
  },
  {
    displayName: "Customer 5",
    role: "customer",
    id: "GTW890",
  },
  {
    displayName: "Agent",
    role: "agent",
    id: "LKM4602",
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
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useSession();
  const handleCardOnClick = async (user: TUser) => {
    localStorage.setItem("user-info", JSON.stringify(user));
    if (user.role === "customer") {
      const conversationId = await mutateAsync(user.id);
      navigate(`/chat/${conversationId}`);
    } else {
      navigate("/chat");
    }
  };

  if (isPending) {
    return <EmptyChatPage />;
  }

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
                <Text fontSize="4xl" fontWeight="bold">
                  Welcome to 5 Fighters
                </Text>
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
              {PROFILES.map((user) => {
                const { displayName, role, id } = user;
                return (
                  <InfoCard
                    displayName={displayName}
                    role={role as TRole}
                    onClick={() => {
                      handleCardOnClick(user);
                    }}
                    key={id}
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

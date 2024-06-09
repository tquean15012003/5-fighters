import { Center, Spinner } from "@chakra-ui/react";
import { Panel } from "../../components/panel/components/Panel";

export const FallbackLoader = () => (
  <Panel>
    <Center w="full" h="100dvh">
      <Spinner size="lg" color="brand.purple.500" />
    </Center>
  </Panel>
);

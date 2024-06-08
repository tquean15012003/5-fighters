import useElementSize from "../../../hooks/useElementSize";
import { Box, BoxProps, Container, Flex, FlexProps } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React from "react";

import { DEFAULT_CONTAINER_MAX_WIDTH } from "../constants";
import { usePanel } from "../hooks/usePanel";
import { PanelProvider } from "../providers/PanelProvider";

export const PanelHeader: React.FC<FlexProps> = ({ children, ...props }) => (
  <Flex
    px={6}
    py={4}
    justifyContent="space-between"
    borderBottom="1px solid rgba(0, 0, 0, 0.20)"
    w="full"
    bg="gray.100"
    {...props}
  >
    {children}
  </Flex>
);

export const PanelContent: React.FC<FlexProps> = ({ children, ...props }) => (
  <Flex flexDir="column" h="full" w="full" pos="relative" gap={0} {...props}>
    {children}
  </Flex>
);

export const PanelBody: React.FC<
  BoxProps & { disableFooterPadding?: boolean }
> = ({ children, disableFooterPadding = false, ...props }) => {
  const { footerHeight } = usePanel();

  return (
    <Box overflow="auto" pos="relative" h="full">
      <Container
        py={6}
        maxW={DEFAULT_CONTAINER_MAX_WIDTH}
        flexGrow={1}
        h="full"
        {...props}
      >
        {children}
        {!disableFooterPadding && !!footerHeight && (
          <Box h={`${footerHeight}px`} />
        )}
      </Container>
    </Box>
  );
};

export const PanelFooter: React.FC<FlexProps> = ({ children, ...props }) => {
  const { setFooterHeight } = usePanel();
  const [ref, { height }] = useElementSize();

  React.useEffect(() => {
    setFooterHeight(height);
  }, [height, setFooterHeight]);

  return (
    <Flex
      p={4}
      pt={6}
      pos="absolute"
      bottom={0}
      w="full"
      background="linear-gradient(0deg, var(--chakra-colors-gray-100) 85%, rgba(255, 255, 255, 0) 100%)"
      ref={ref}
      {...props}
    >
      <Container maxW={DEFAULT_CONTAINER_MAX_WIDTH}>{children}</Container>
    </Flex>
  );
};

const PanelChildren: React.FC<FlexProps> = ({ children, ...props }) => {
  const {
    getDrawerDisclosureProps,
    isDrawerOpen,
    isDrawerHidden,
    setDrawerHidden,
  } = usePanel();
  return (
    <>
      <Flex
        h="full"
        w="full"
        borderRadius="xl"
        overflow="hidden"
        pos="relative"
        gap={0}
        bg="gray.100"
        mt={4}
        {...props}
      >
        {children}
        <Box
          as={motion.div}
          hidden={isDrawerHidden}
          initial={false}
          right={0}
          onAnimationStart={() => setDrawerHidden(false)}
          onAnimationComplete={() => setDrawerHidden(!isDrawerOpen)}
          animate={{ width: isDrawerOpen ? 450 : 0 }}
          flexShrink={0}
          {...getDrawerDisclosureProps()}
        />
      </Flex>
    </>
  );
};

export const Panel: React.FC<FlexProps> = ({ children, ...props }) => {
  return (
    <PanelProvider>
      <PanelChildren {...props}>{children}</PanelChildren>
    </PanelProvider>
  );
};

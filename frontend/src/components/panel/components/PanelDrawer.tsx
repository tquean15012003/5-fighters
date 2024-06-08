import { BoxProps, Flex, FlexProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React from 'react';

import { usePanel } from '../hooks/usePanel';
import { PanelBody, PanelHeader } from './Panel';

export const PanelDrawer: React.FC<FlexProps> = ({ children, ...props }) => {
  const {
    getDrawerDisclosureProps,
    isDrawerFullscreen,
    isDrawerOpen,
    isDrawerHidden,
    setDrawerHidden,
  } = usePanel();

  return (
    <Flex
      flexDir="column"
      as={motion.div}
      h="full"
      bg="white"
      borderLeft="1px solid #00000033"
      hidden={isDrawerHidden}
      initial={false}
      pos="absolute"
      right={0}
      whiteSpace="nowrap"
      onAnimationStart={() => setDrawerHidden(false)}
      onAnimationComplete={() => setDrawerHidden(!isDrawerOpen)}
      animate={{ width: isDrawerOpen ? (isDrawerFullscreen ? '100%' : 450) : 0 }}
      overflow="hidden"
      {...getDrawerDisclosureProps()}
      {...props}
    >
      {children}
    </Flex>
  );
};

export const PanelDrawerBody: React.FC<BoxProps> = ({ children, ...props }) => (
  <PanelBody disableFooterPadding px={6} h="100%" {...props}>
    {children}
  </PanelBody>
);

export const PanelDrawerHeader: React.FC<FlexProps> = ({ children, ...props }) => (
  <PanelHeader bg="white" {...props}>
    {children}
  </PanelHeader>
);

import { useDisclosure } from '@chakra-ui/react';
import React, { useState } from 'react';

export const usePanelContext = () => {
  const {
    getButtonProps: getDrawerTriggerProps,
    getDisclosureProps: getDrawerDisclosureProps,
    isOpen: isDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();

  const [isDrawerHidden, setDrawerHidden] = useState(!isDrawerOpen);
  const [isDrawerFullscreen, setDrawerFullscreen] = React.useState(false);

  const [footerHeight, setFooterHeight] = useState(0);

  return {
    getDrawerTriggerProps,
    getDrawerDisclosureProps,
    isDrawerOpen,
    onDrawerClose,
    isDrawerFullscreen,
    setDrawerFullscreen,
    isDrawerHidden,
    setDrawerHidden,
    footerHeight,
    setFooterHeight,
  };
};

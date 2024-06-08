import { IconButton, IconButtonProps } from '@chakra-ui/react';
import { ArrowLineRight, ArrowsIn, ArrowsOut, SlidersHorizontal, X } from '@phosphor-icons/react';
import React from 'react';

import { usePanel } from '../hooks/usePanel';

export const PanelDrawerToggleButton: React.FC<Omit<IconButtonProps, 'aria-label'>> = (props) => {
  const { getDrawerTriggerProps, isDrawerOpen } = usePanel();

  return (
    <IconButton
      size="sm"
      icon={isDrawerOpen ? <ArrowLineRight size={20} /> : <SlidersHorizontal size={20} />}
      {...getDrawerTriggerProps()}
      {...props}
      aria-label={'settings'}
    />
  );
};

export const PanelDrawerCloseButton = () => {
  const { setDrawerHidden, setDrawerFullscreen, onDrawerClose } = usePanel();

  return (
    <IconButton
      size="sm"
      icon={<X size={20} />}
      aria-label={'close'}
      onClick={() => {
        setDrawerHidden(true);
        setDrawerFullscreen(false);
        onDrawerClose();
      }}
      variant="ghost"
      colorScheme="red"
    />
  );
};

export const PanelDrawerFullscreenButton = () => {
  const { isDrawerFullscreen, setDrawerFullscreen } = usePanel();

  return (
    <IconButton
      size="sm"
      icon={isDrawerFullscreen ? <ArrowsIn size={20} /> : <ArrowsOut size={20} />}
      aria-label={'settings'}
      onClick={() => {
        setDrawerFullscreen((prev) => !prev);
      }}
      variant="ghost"
    />
  );
};

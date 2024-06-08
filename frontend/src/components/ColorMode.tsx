import { Box, BoxProps, DarkMode, LightMode } from '@chakra-ui/react';

export const LightModeBox = (props: BoxProps) => (
  <LightMode>
    <Box data-theme="light" color="chakra-body-text" {...props} />
  </LightMode>
);

export const DarkModeBox = (props: BoxProps) => (
  <DarkMode>
    <Box data-theme="dark" color="chakra-body-text" {...props} />
  </DarkMode>
);

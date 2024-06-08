import { defineStyleConfig } from '@chakra-ui/react';

export const buttonTheme = defineStyleConfig({
  baseStyle: {
    borderRadius: '8px',
    py: 4,
    height: 'auto',
  },
  sizes: {
    md: {
      height: 'auto',
    },
  },
});

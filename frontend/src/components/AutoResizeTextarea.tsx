import { Textarea, TextareaProps } from '@chakra-ui/react';
import React, { ComponentProps } from 'react';
import ResizeTextarea from 'react-textarea-autosize';

const AutoResizeTextarea = React.forwardRef<
  any,
  TextareaProps & ComponentProps<typeof ResizeTextarea>
>((props, ref) => {
  return (
    <Textarea
      minH="unset"
      resize="none"
      ref={ref as any}
      minRows={1}
      maxRows={6}
      as={ResizeTextarea}
      {...props}
    />
  );
});

AutoResizeTextarea.displayName = 'AutoResizeTextarea';

export default AutoResizeTextarea;

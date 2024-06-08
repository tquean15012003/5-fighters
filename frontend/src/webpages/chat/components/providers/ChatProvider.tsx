import React, { PropsWithChildren } from 'react';

import useChatContext, { UseChatContextProps } from '../hooks/useChatContext';

export const ChatContext = React.createContext({} as ReturnType<typeof useChatContext>);
export const ChatProvider: React.FC<Partial<UseChatContextProps> & PropsWithChildren> = ({
  children,
  ...options
}) => {
  const chat = useChatContext(options);

  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>;
};

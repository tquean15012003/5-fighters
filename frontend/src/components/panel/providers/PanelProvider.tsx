import React, { PropsWithChildren } from 'react';

import { usePanelContext } from '../hooks/usePanelContext';

export const PanelContext = React.createContext({} as ReturnType<typeof usePanelContext>);

export const PanelProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const panel = usePanelContext();

  return <PanelContext.Provider value={panel}>{children}</PanelContext.Provider>;
};

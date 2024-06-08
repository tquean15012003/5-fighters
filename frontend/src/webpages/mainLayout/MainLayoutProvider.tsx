import React, { PropsWithChildren, createContext, useState } from 'react';

interface MainLayoutContextProps {
  actionsHeight: number;
  setActionsHeight: (height: number) => void;
  navbarHeight: number;
  setNavbarHeight: (height: number) => void;
}

export const MainLayoutContext = createContext<MainLayoutContextProps>({
  setActionsHeight: () => {
    return;
  },
  actionsHeight: 0,
  setNavbarHeight: () => {
    return;
  },
  navbarHeight: 0,
});

export const MainLayoutProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [actionsHeight, setActionsHeight] = useState(0);
  const [navbarHeight, setNavbarHeight] = useState(0);

  return (
    <MainLayoutContext.Provider
      value={{
        actionsHeight,
        setActionsHeight,
        navbarHeight,
        setNavbarHeight,
      }}
    >
      {children}
    </MainLayoutContext.Provider>
  );
};

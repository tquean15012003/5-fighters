import React from 'react';

import { MainLayoutContext } from '../MainLayoutProvider';

const useMainLayout = () => {
  const context = React.useContext(MainLayoutContext);

  if (context === undefined) {
    throw new Error('useMainLayout must be used within a MainLayoutProvider');
  }

  return context;
};

export default useMainLayout;

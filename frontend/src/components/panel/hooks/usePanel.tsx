import React from 'react';

import { PanelContext } from '../providers/PanelProvider';

export const usePanel = () => {
  const panelCtx = React.useContext(PanelContext);

  if (!panelCtx) {
    throw new Error('usePanel must be used within a PanelProvider');
  }

  return panelCtx;
};

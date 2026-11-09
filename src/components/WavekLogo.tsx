import React from 'react';
import { SunLabLogo } from './SunLabLogo';

export const WavekLogo: React.FC<React.ComponentProps<typeof SunLabLogo>> = (props) => {
  return <SunLabLogo {...props} />;
};

export default WavekLogo;

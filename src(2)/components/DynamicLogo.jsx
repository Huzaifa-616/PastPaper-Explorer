import React, { useMemo } from 'react';
import { Atom, Binary, Biohazard, ChevronsLeftRight, Cpu, Database, FlaskConical, Network, Omega, Radiation } from 'lucide-react';

const DYNAMIC_ICONS = [Atom, Database, Network, Binary, Biohazard, ChevronsLeftRight, FlaskConical, Omega, Radiation, Cpu];

const DynamicLogo = ({ size, color, strokeWidth }) => {
  const CurrentIcon = useMemo(() => DYNAMIC_ICONS[Math.floor(Math.random() * DYNAMIC_ICONS.length)], []);
  return <CurrentIcon size={size} color={color} strokeWidth={strokeWidth} />;
};

export default DynamicLogo;

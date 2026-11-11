import React from 'react';

interface SunLabLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'light' | 'dark';
}

export const SunLabLogo: React.FC<SunLabLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24',
  };

  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src="/sunlab-logo.png"
        alt="SunLab — Impressões 3D"
        className={`${sizeMap[size]} w-auto object-contain transition-transform duration-300 hover:scale-105`}
      />
    </div>
  );
};

export default SunLabLogo;

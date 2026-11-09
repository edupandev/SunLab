import React from 'react';

interface SunLabLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'light' | 'dark'; // 'light' means for light backgrounds, 'dark' for dark backgrounds
}

export const SunLabLogo: React.FC<SunLabLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  variant = 'light',
}) => {
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  const isLightBg = variant === 'light';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* SunLab Emblem Icon: Stylized Geometric Sun with 3D Concentric Layers */}
      <div className={`relative ${sizeMap[size]} rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-600 via-blue-500 to-amber-400 p-0.5 shadow-md flex items-center justify-center transition-transform hover:scale-105 shrink-0`}>
        <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center p-1.5">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Outer Solar Precision Ring */}
            <circle cx="20" cy="20" r="17" stroke="url(#sunGradient)" strokeWidth="2" strokeDasharray="3 2" />
            {/* Inner Core */}
            <circle cx="20" cy="20" r="10" fill="url(#sunCoreGradient)" />
            {/* 3D Layer Slices inside core */}
            <path d="M12 18H28" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
            <path d="M14 22H26" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
            {/* Solar Rays */}
            <line x1="20" y1="4" x2="20" y2="7" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="33" x2="20" y2="36" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="4" y1="20" x2="7" y2="20" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="33" y1="20" x2="36" y2="20" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="sunGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f59e0b" />
                <stop offset="1" stopColor="#2563eb" />
              </linearGradient>
              <linearGradient id="sunCoreGradient" x1="10" y1="10" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2563eb" />
                <stop offset="1" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className={`text-xl sm:text-2xl font-black tracking-tight font-display leading-none flex items-center gap-1 ${
            isLightBg ? 'text-zinc-900' : 'text-white'
          }`}>
            <span>SUN</span>
            <span className="text-blue-600">LAB</span>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          </span>
          <span className={`text-[9px] uppercase tracking-widest font-bold mt-1 ${
            isLightBg ? 'text-blue-700' : 'text-blue-400'
          }`}>
            Laboratório de Impressão 3D
          </span>
        </div>
      )}
    </div>
  );
};

export default SunLabLogo;

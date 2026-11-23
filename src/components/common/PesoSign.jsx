// src/components/common/PesoSign.jsx
// Custom Philippine Peso Sign (PHP ) icon — drop-in replacement for Lucide's DollarSign
// Accepts the same className / style props as any Lucide icon.
import React from 'react';

export const PesoSign = ({ className = 'w-5 h-5', style, strokeWidth = 2, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-hidden="true"
    {...props}
  >
    {/* Vertical stem of PHP  */}
    <line x1="9" y1="3" x2="9" y2="21" />
    {/* Top arch — forms the P shape */}
    <path d="M9 3 h5 a4 4 0 0 1 0 8 H9" />
    {/* Two horizontal double-bars — the PHP  marker */}
    <line x1="6" y1="8"  x2="15" y2="8"  />
    <line x1="6" y1="12" x2="15" y2="12" />
  </svg>
);

export default PesoSign;

// src/components/common/Badge.jsx
import React from 'react';

/**
 * Navy & Gold palette — clean, elegant academic badges.
 * Semantic colors (emerald/amber/rose) kept for data meaning.
 */
const VARIANTS = {
  default: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  primary: 'bg-navy-50 text-navy-800 dark:bg-navy-950/50 dark:text-navy-200 border-navy-200 dark:border-navy-800/40',
  navy:    'bg-navy-50 text-navy-800 dark:bg-navy-950/50 dark:text-navy-200 border-navy-200 dark:border-navy-800/40',
  maroon:  'bg-navy-50 text-navy-800 dark:bg-navy-950/50 dark:text-navy-200 border-navy-200 dark:border-navy-800/40',
  gold:    'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
  // Semantic-only
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
  danger:  'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
  // Aliases
  info:    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  purple:  'bg-navy-50 text-navy-700 dark:bg-navy-950/40 dark:text-navy-300 border-navy-100 dark:border-navy-900/40',
  orange:  'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
  pink:    'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
  teal:    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
};

const SIZES = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-0.5',
  lg: 'text-sm px-3 py-1',
};

export const Badge = ({ children, variant = 'default', size = 'md', dot = false, pulse = false, className = '' }) => (
  <span className={`inline-flex items-center rounded-full font-semibold border ${VARIANTS[variant] || VARIANTS.default} ${SIZES[size] || SIZES.md} ${className}`}>
    {dot && <span className={`w-1.5 h-1.5 rounded-full bg-current opacity-80 mr-1.5 shrink-0 ${pulse ? 'animate-pulse' : ''}`} />}
    {children}
  </span>
);

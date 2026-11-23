// src/components/common/Button.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const base = [
    'inline-flex items-center justify-center font-semibold rounded-xl',
    'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]',
  ].join(' ');

  const sizes = {
    xs: 'text-[11px] px-2.5 py-1 gap-1',
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  const variants = {
    // ── Navy primary (default) ───────────────────────────────────────
    primary:
      'bg-gradient-to-r from-navy-800 to-navy-700 hover:from-navy-700 hover:to-navy-600 ' +
      'text-white shadow-md shadow-navy-800/25 focus:ring-navy-700 border border-navy-700/20',

    // ── Gold accent ──────────────────────────────────────────────────
    gold:
      'bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 ' +
      'text-white shadow-md shadow-gold-600/25 focus:ring-gold-500',

    // ── Soft secondary (navy tint) ───────────────────────────────────
    secondary:
      'bg-navy-50 hover:bg-navy-100 dark:bg-navy-950/40 dark:hover:bg-navy-900/50 ' +
      'text-navy-800 dark:text-navy-200 border border-navy-200 dark:border-navy-800/50 focus:ring-navy-400',

    // ── Neutral ghost ────────────────────────────────────────────────
    ghost:
      'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 ' +
      'dark:text-gray-200 border border-gray-200/60 dark:border-gray-700 focus:ring-gray-400',

    // ── Glass ────────────────────────────────────────────────────────
    glass:
      'bg-white/40 hover:bg-white/60 dark:bg-gray-800/40 dark:hover:bg-gray-800/60 ' +
      'backdrop-blur-md text-gray-800 dark:text-gray-100 border border-white/50 dark:border-gray-700/50 ' +
      'shadow-sm focus:ring-navy-400',

    // ── Danger ───────────────────────────────────────────────────────
    danger:
      'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 ' +
      'text-white shadow-md shadow-rose-500/20 focus:ring-rose-500',

    // ── Success ──────────────────────────────────────────────────────
    success:
      'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 ' +
      'text-white shadow-md shadow-emerald-500/20 focus:ring-emerald-500',

    // ── Outline navy ────────────────────────────────────────────────
    outline:
      'bg-transparent border-2 border-navy-700 text-navy-700 hover:bg-navy-50 ' +
      'dark:border-navy-400 dark:text-navy-300 dark:hover:bg-navy-950/40 focus:ring-navy-500',

    // ── Maroon alias (backward compat) ──────────────────────────────
    maroon:
      'bg-gradient-to-r from-navy-800 to-navy-700 hover:from-navy-700 hover:to-navy-600 ' +
      'text-white shadow-md shadow-navy-800/25 focus:ring-navy-700',
  };

  const sizeCls    = sizes[size]        || sizes.md;
  const variantCls = variants[variant]  || variants.primary;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${sizeCls} ${variantCls} ${className}`}
      {...props}
    >
      {loading
        ? <Loader2 className="w-4 h-4 animate-spin text-current" />
        : Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

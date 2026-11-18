// src/components/common/StatCard.jsx
import React from 'react';
import { GlassCard } from './GlassCard';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  gradient = 'from-indigo-500 to-indigo-600',
  iconColor = 'text-indigo-600 dark:text-indigo-400',
  iconBg = 'bg-indigo-50 dark:bg-indigo-950/50',
}) => {
  const isPositive = typeof trend === 'string' ? !trend.startsWith('-') : Boolean(trend);

  return (
    <GlassCard className="p-5 relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg} ${iconColor} shadow-inner group-hover:scale-110 transition-transform duration-300`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>

      {Boolean(trend) && (
        <div className="mt-4 flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <span className={`inline-flex items-center font-bold mr-1.5 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
            {trend}
          </span>
          {trendLabel && <span>{trendLabel}</span>}
        </div>
      )}

      {/* Decorative gradient corner glow */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br ${gradient} opacity-5 dark:opacity-10 rounded-full blur-xl pointer-events-none group-hover:opacity-15 transition-opacity`} />
    </GlassCard>
  );
};

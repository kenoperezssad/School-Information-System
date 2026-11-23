// src/components/common/StatCard.jsx
import React from 'react';
import { GlassCard } from './GlassCard';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({ title, value, icon: Icon, trend, trendLabel, iconBg = 'bg-navy-50', iconColor = 'text-navy-700' }) => {
  const isPositive = typeof trend === 'string' ? !trend.startsWith('-') : Boolean(trend);
  return (
    <GlassCard className="p-5 relative overflow-hidden group stat-card-hover">
      {/* Navy-to-gold gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
           style={{ background: 'linear-gradient(90deg, #0F2258, #D4A817)' }} />

      <div className="flex items-center justify-between pt-1">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 truncate">{title}</p>
          <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1.5 tracking-tight leading-none">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg} ${iconColor} shrink-0 ml-3 group-hover:scale-110 transition-transform duration-200`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>

      {Boolean(trend) && (
        <div className="mt-4 flex items-center text-xs text-gray-400 font-medium pt-3 border-t border-gray-100 dark:border-gray-800">
          <span className={`inline-flex items-center font-bold mr-1.5 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
            {trend}
          </span>
          {trendLabel && <span>{trendLabel}</span>}
        </div>
      )}
    </GlassCard>
  );
};

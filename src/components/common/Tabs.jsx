// src/components/common/Tabs.jsx
import React from 'react';

export const Tabs = ({ tabs = [], activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex items-center space-x-1.5 p-1 rounded-2xl bg-gray-100/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 select-none ${
              isActive
                ? 'bg-white dark:bg-gray-900 shadow-sm border border-gray-200/60 dark:border-gray-800'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-gray-700/40'
            }`}
            style={isActive ? { color: '#132E72' } : {}}
          >
            {Icon && (
              <Icon
                className="w-4 h-4"
                style={isActive ? { color: '#132E72' } : { color: '#9CA3AF' }}
              />
            )}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className="px-1.5 py-0.5 text-[10px] rounded-full font-bold"
                style={isActive
                  ? { background: 'rgba(10,22,40,0.08)', color: '#132E72' }
                  : { background: '#E5E7EB', color: '#6B7280' }
                }
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

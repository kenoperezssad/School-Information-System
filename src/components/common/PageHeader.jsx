// src/components/common/PageHeader.jsx
import React from 'react';

export const PageHeader = ({
  title,
  subtitle,
  badge,
  actions    = null,
  breadcrumbs = [],
}) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div>
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-1.5 text-xs text-gray-400 mb-2 font-medium">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-gray-300 dark:text-gray-600">/</span>}
                <span
                  className={
                    idx === breadcrumbs.length - 1
                      ? 'font-semibold'
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors'
                  }
                  style={idx === breadcrumbs.length - 1 ? { color: '#132E72' } : {}}
                >
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h1>
          {badge && badge}
        </div>

        {/* Navy-to-gold accent bar */}
        <div
          className="w-10 h-1 rounded-full mt-2.5"
          style={{ background: 'linear-gradient(90deg, #132E72, #D4A817)' }}
        />

        {subtitle && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

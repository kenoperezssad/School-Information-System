// src/components/common/DataTable.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { GlassCard } from './GlassCard';

export const DataTable = ({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchField = null, // string or function
  actions = null,
  pageSize = 25,
  paginate = false,
  loading = false,
  emptyMessage = 'No records found',
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Reset to page 1 when data prop changes
  useEffect(() => {
    setPage(1);
  }, [data]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    const list = data || [];
    if (!searchable || !searchTerm.trim()) return list;
    const lower = searchTerm.toLowerCase();

    return list.filter(item => {
      if (!item) return false;
      if (searchField) {
        if (typeof searchField === 'function') {
          return searchField(item, lower);
        }
        return String(item[searchField] ?? '').toLowerCase().includes(lower);
      }
      // Otherwise match against all values
      return Object.values(item).some(val => 
        String(val ?? '').toLowerCase().includes(lower)
      );
    });
  }, [data, searchTerm, searchField, searchable]);

  // Pagination metrics
  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;

  // Sliced page data
  const pageData = useMemo(() => {
    if (!paginate) return filteredData;
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize, paginate]);

  const startEntry = totalEntries === 0 ? 0 : (page - 1) * pageSize + 1;
  const endEntry = Math.min(page * pageSize, totalEntries);

  return (
    <GlassCard className={`overflow-hidden ${className}`}>
      {/* Top Header Bar */}
      {(searchable || actions) && (
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80">
          {searchable ? (
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          ) : <div />}

          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50/80 dark:bg-slate-800/40 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200/70 dark:border-slate-800">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-5 py-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-5 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : pageData.length > 0 ? (
              pageData.map((row, rIdx) => (
                <tr 
                  key={row.id || rIdx} 
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={`px-5 py-3.5 ${col.className || ''}`}>
                      {col.render ? col.render(row) : (row[col.accessor] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500">
                  <Inbox className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2 stroke-[1.5]" />
                  <p className="font-medium text-slate-500 dark:text-slate-400">{emptyMessage}</p>
                  {searchTerm && (
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria</p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && paginate && totalEntries > pageSize && (
        <div className="px-5 py-3.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing {startEntry}-{endEntry} of {totalEntries} entries
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={page >= totalPages}
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

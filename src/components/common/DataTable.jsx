// src/components/common/DataTable.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox, X as XIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';

export const DataTable = ({
  columns            = [],
  data               = [],
  searchable         = true,
  searchPlaceholder  = 'Search records...',
  searchField        = null,
  actions            = null,
  pageSize           = 25,
  paginate           = false,
  loading            = false,
  emptyMessage       = 'No records found',
  className          = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page,       setPage]       = useState(1);

  useEffect(() => { setPage(1); }, [data]);

  const filteredData = useMemo(() => {
    const list = data || [];
    if (!searchable || !searchTerm.trim()) return list;
    const lower = searchTerm.toLowerCase();

    return list.filter(item => {
      if (!item) return false;
      if (searchField) {
        return typeof searchField === 'function'
          ? searchField(item, lower)
          : String(item[searchField] ?? '').toLowerCase().includes(lower);
      }
      return Object.values(item).some(val =>
        String(val ?? '').toLowerCase().includes(lower)
      );
    });
  }, [data, searchTerm, searchField, searchable]);

  const totalEntries = filteredData.length;
  const totalPages   = Math.ceil(totalEntries / pageSize) || 1;

  const pageData = useMemo(() => {
    if (!paginate) return filteredData;
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize, paginate]);

  const startEntry = totalEntries === 0 ? 0 : (page - 1) * pageSize + 1;
  const endEntry   = Math.min(page * pageSize, totalEntries);

  return (
    <GlassCard className={`overflow-hidden ${className}`}>

      {/* Top bar: search + actions */}
      {(searchable || actions) && (
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800/80">
          {searchable ? (
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: '#132E72' }} />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-9 py-2 text-sm rounded-xl
                           bg-gray-50 dark:bg-gray-800/60
                           border border-gray-200 dark:border-gray-700/80
                           text-gray-900 dark:text-white placeholder-gray-400
                           transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => { setSearchTerm(''); setPage(1); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-700 dark:hover:text-navy-300 transition-colors"
                  aria-label="Clear search"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : <div />}

          {actions && (
            <div className="flex items-center gap-2">{actions}</div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50/80 dark:bg-gray-800/40 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200/70 dark:border-gray-800">
            {/* Navy-to-gold header accent */}
            <tr>
              <th colSpan={columns.length} className="p-0 h-0">
                <div className="h-[2px] w-full"
                     style={{ background: 'linear-gradient(90deg, #132E72, #D4A817, transparent)' }} />
              </th>
            </tr>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-5 py-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {loading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-5 py-4">
                      <div className="skeleton h-4 w-3/4 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : pageData.length > 0 ? (
              pageData.map((row, rIdx) => (
                <tr
                  key={row.id || rIdx}
                  className="hover:bg-navy-50/30 dark:hover:bg-navy-950/10 transition-colors"
                  style={{ '--tw-bg-opacity': 1 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(10,22,40,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
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
                <td colSpan={columns.length} className="px-5 py-16 text-center">
                  <Inbox className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-3 stroke-[1.25]" />
                  <p className="font-semibold text-gray-500 dark:text-gray-400 text-sm">{emptyMessage}</p>
                  {searchTerm && (
                    <p className="text-xs text-gray-400 mt-1.5">
                      No results for{' '}
                      <span className="font-medium" style={{ color: '#132E72' }}>"{searchTerm}"</span>
                      {' '}— try adjusting your search
                    </p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {!loading && (
        <div className="px-5 py-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
          <div className="font-medium">
            {totalEntries === 0
              ? 'No records'
              : paginate
                ? `Showing ${startEntry}–${endEntry} of ${totalEntries} record${totalEntries !== 1 ? 's' : ''}`
                : `${totalEntries} record${totalEntries !== 1 ? 's' : ''}`}
            {searchTerm && (
              <span className="ml-1 font-semibold" style={{ color: '#132E72' }}>(filtered)</span>
            )}
          </div>

          {paginate && totalEntries > pageSize && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <span className="px-2 font-medium text-gray-700 dark:text-gray-300">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
};

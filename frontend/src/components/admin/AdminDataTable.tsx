import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '../ui/Button';

export interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}

interface AdminDataTableProps<T> {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  columns: Column<T>[];
  data: T[];
  actionLabel?: string;
  onAction?: () => void;
  keyExtractor: (item: T) => string;
}

export function AdminDataTable<T>({
  title,
  subtitle,
  icon: Icon,
  columns,
  data,
  actionLabel,
  onAction,
  keyExtractor
}: AdminDataTableProps<T>) {
  return (
    <div className="glass-panel rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-xl space-y-0">
      {/* Table Header Strip */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h3>
            {subtitle && <p className="text-[11px] text-slate-500 dark:text-gray-400">{subtitle}</p>}
          </div>
        </div>

        {actionLabel && onAction && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAction}
            className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:text-rose-500"
          >
            {actionLabel} →
          </Button>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-gray-900/90 border-b border-slate-200 dark:border-gray-800 text-slate-500 dark:text-gray-400 uppercase text-[10px] font-bold tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`p-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-gray-800/60 text-slate-700 dark:text-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center text-slate-400 dark:text-gray-500 text-xs">
                  No records available.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={keyExtractor(item)} className="hover:bg-rose-500/10 dark:hover:bg-rose-950/20 transition-colors">
                  {columns.map((col, idx) => (
                    <td key={idx} className={`p-4 ${col.className || ''}`}>
                      {col.accessor(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

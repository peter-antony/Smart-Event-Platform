import React from 'react';
import { ArrowUpRight, LucideIcon } from 'lucide-react';

export interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  subtitle?: string;
  variantColor?: 'purple' | 'emerald' | 'brand' | 'indigo';
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  variantColor = 'purple'
}) => {
  const colorStyles = {
    purple: 'border-purple-500/20 text-purple-600 dark:text-purple-400 bg-purple-500/10',
    emerald: 'border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    brand: 'border-brand-500/20 text-brand-600 dark:text-brand-400 bg-brand-500/10',
    indigo: 'border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10'
  };

  const badgeStyles = {
    purple: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    brand: 'bg-brand-500/20 text-brand-700 dark:text-brand-300 border-brand-500/30',
    indigo: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
  };

  return (
    <div className={`glass-card p-5 rounded-2xl border ${colorStyles[variantColor].split(' ')[0]} bg-white/60 dark:bg-gray-900/60 space-y-3 hover:border-purple-500/40 transition-all shadow-md`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorStyles[variantColor]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</p>
        <div className="flex items-center justify-between">
          {trend && (
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeStyles[variantColor]}`}>
              <ArrowUpRight className="w-3 h-3" /> {trend}
            </span>
          )}
          {subtitle && (
            <span className="text-[11px] text-slate-500 dark:text-gray-400 font-medium">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
};

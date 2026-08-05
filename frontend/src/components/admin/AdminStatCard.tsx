import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  subtitle?: string;
  variantColor?: 'rose' | 'purple' | 'emerald' | 'brand' | 'indigo' | 'amber';
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  variantColor = 'rose'
}) => {
  const colorStyles = {
    rose: {
      border: 'border-rose-500/30',
      iconBg: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30',
      glow: 'hover:border-rose-500/50'
    },
    purple: {
      border: 'border-purple-500/30',
      iconBg: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
      glow: 'hover:border-purple-500/50'
    },
    emerald: {
      border: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      glow: 'hover:border-emerald-500/50'
    },
    brand: {
      border: 'border-brand-500/30',
      iconBg: 'bg-brand-500/20 text-brand-600 dark:text-brand-400 border-brand-500/30',
      glow: 'hover:border-brand-500/50'
    },
    indigo: {
      border: 'border-indigo-500/30',
      iconBg: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      glow: 'hover:border-indigo-500/50'
    },
    amber: {
      border: 'border-amber-500/30',
      iconBg: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
      glow: 'hover:border-amber-500/50'
    }
  };

  const currentTheme = colorStyles[variantColor] || colorStyles.rose;

  return (
    <div className={`glass-panel p-5 rounded-2xl border ${currentTheme.border} ${currentTheme.glow} transition-all duration-300 hover:shadow-xl space-y-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-gray-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${currentTheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <div className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>
        {trend && (
          <div className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>{trend}</span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-slate-400 dark:text-gray-500 truncate pt-1 border-t border-slate-200/60 dark:border-gray-800/60">
          {subtitle}
        </p>
      )}
    </div>
  );
};

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'success' | 'warning' | 'purple' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'brand', className = '' }) => {
  const styles = {
    brand: "bg-brand-500/15 text-brand-600 dark:text-brand-400 border-brand-500/30",
    success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    purple: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    outline: "bg-slate-100 dark:bg-gray-800/40 text-slate-700 dark:text-gray-300 border-slate-300 dark:border-gray-700",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

import React from 'react';
import { NavTab } from '../../types/event';

interface AdminAnalyticsPageProps {
  onNavigate?: (tab: NavTab) => void;
}

export const AdminAnalyticsPage: React.FC<AdminAnalyticsPageProps> = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-900/10 via-purple-900/10 to-brand-900/10 dark:from-rose-950/50 dark:via-purple-950/40 dark:to-brand-950/50">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Platform Financial & System Analytics</h1>
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
            ANALYTICS
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-gray-400">Gross transaction volume, platform ticket sales, and audience growth telemetry</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase">Monthly Platform Sales</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">$184,500.00</div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">↑ +18.5% vs last month</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase">Active Attendee Registrations</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">1,420 Active</div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">↑ +24% user growth</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase">Average Ticket Price</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">$142.50</div>
          <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">High yield inventory</span>
        </div>
      </div>
    </div>
  );
};

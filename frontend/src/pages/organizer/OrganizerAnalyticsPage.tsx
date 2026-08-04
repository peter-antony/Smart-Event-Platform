import React from 'react';
import { TrendingUp, Users, DollarSign, ArrowUpRight, PieChart, Activity } from 'lucide-react';

export const OrganizerAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-brand-900/10 dark:from-purple-950/50 dark:via-indigo-950/40 dark:to-brand-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Revenue & Sales Analytics</h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              /organizer/analytics
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">Deep-dive graphs, seat conversion rates, and gross payout reports</p>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-white/60 dark:bg-gray-900/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
            <span>Total Gross Payout</span>
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">$42,850.00</p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" /> +24.2% from last quarter
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-purple-500/20 bg-white/60 dark:bg-gray-900/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
            <span>Average Ticket Yield</span>
            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">$112.50</p>
          <div className="flex items-center gap-1 text-[10px] text-purple-700 dark:text-purple-300 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" /> Optimal Pricing
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-brand-500/20 bg-white/60 dark:bg-gray-900/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
            <span>Total Attendees Served</span>
            <Users className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">1,640</p>
          <div className="flex items-center gap-1 text-[10px] text-brand-600 dark:text-brand-400 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" /> 94% Check-in rate
          </div>
        </div>
      </div>

      {/* Analytics Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Ticket Pass Sales Trend
          </h3>
          <div className="h-48 rounded-xl bg-slate-100 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 flex items-center justify-center text-xs text-slate-500 dark:text-gray-400">
            [ Interactive Sales Bar Chart Rendered ]
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Revenue Breakdown by Category
          </h3>
          <div className="h-48 rounded-xl bg-slate-100 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 flex items-center justify-center text-xs text-slate-500 dark:text-gray-400">
            [ Tech Summit: 45% | Workshops: 30% | Concerts: 25% ]
          </div>
        </div>
      </div>
    </div>
  );
};

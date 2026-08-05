import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { NavTab } from '../../types/event';

interface AdminSettingsPageProps {
  onNavigate?: (tab: NavTab) => void;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-900/10 via-purple-900/10 to-brand-900/10 dark:from-rose-950/50 dark:via-purple-950/40 dark:to-brand-950/50">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Settings & RBAC Configuration</h1>
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
            SETTINGS
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-gray-400">Configure global platform permissions, API rate limits, and authentication security</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-gray-800">
          <ShieldCheck className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          Role-Based Access Control Rules (RBAC)
        </h2>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">ADMIN Role Access</span>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">Full system governance across all 8 admin routes & FastAPI endpoints</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-700 dark:text-rose-300 font-mono font-bold text-[10px]">
              FULL ACCESS
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">ORGANIZER Role Access</span>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">Event creation, AI draft wizard, manual forms, and event management</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-700 dark:text-purple-300 font-mono font-bold text-[10px]">
              ORGANIZER ACCESS
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">ATTENDEE Role Access</span>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">Event discovery, booking reservation, e-ticket view, and AI discovery assistant</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-700 dark:text-brand-300 font-mono font-bold text-[10px]">
              ATTENDEE ACCESS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Bell, Clock, ShieldAlert } from 'lucide-react';
import { NavTab } from '../../types/event';

interface AdminNotificationsPageProps {
  onNavigate?: (tab: NavTab) => void;
}

export const AdminNotificationsPage: React.FC<AdminNotificationsPageProps> = () => {
  const notifications = [
    { id: '1', title: 'New Organizer Registered', desc: 'Sarah Event Organizer created account sarah.org@smart-events.com', time: '10 mins ago', type: 'info' },
    { id: '2', title: 'Event Moderation Review Required', desc: 'Global AI & Cloud Tech Conference updated banner image', time: '1 hour ago', type: 'warning' },
    { id: '3', title: 'PostgreSQL DB Backup Succeeded', desc: 'Automated snapshot backup completed cleanly for all 10 schemas', time: '3 hours ago', type: 'success' },
    { id: '4', title: 'Security RBAC Audit Alert', desc: 'Denied access attempt for unauthorized role on /admin/users', time: '5 hours ago', type: 'alert' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-900/10 via-purple-900/10 to-brand-900/10 dark:from-rose-950/50 dark:via-purple-950/40 dark:to-brand-950/50">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin System Notifications & Audit Log</h1>
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
            NOTIFICATIONS
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-gray-400">System alert telemetry, audit security events, and notification dispatch log</p>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-gray-800 flex items-start gap-3.5">
            <div className={`p-2.5 rounded-xl border shrink-0 ${
              n.type === 'alert'
                ? 'bg-rose-500/20 text-rose-600 border-rose-500/30'
                : n.type === 'warning'
                ? 'bg-amber-500/20 text-amber-600 border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30'
            }`}>
              {n.type === 'alert' ? <ShieldAlert className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</h4>
                <span className="text-[10px] text-slate-400 dark:text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {n.time}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

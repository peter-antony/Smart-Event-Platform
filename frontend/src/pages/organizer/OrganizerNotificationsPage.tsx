import React, { useState } from 'react';
import { CheckCircle2, Ticket, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const OrganizerNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Ticket Pass Purchased',
      message: 'Alex Rivera reserved 2 passes for Modern UI/UX Design Systems Workshop (Ref: BK-8A2F9C1B).',
      time: '10 mins ago',
      type: 'BOOKING',
      unread: true
    },
    {
      id: 2,
      title: 'High Seat Occupancy Warning',
      message: 'Acoustic Harmony Music Concert has reached 80% capacity (340 seats left).',
      time: '1 hour ago',
      type: 'WARNING',
      unread: true
    },
    {
      id: 3,
      title: 'Payout Disbursement Complete',
      message: 'Gross sales payout of $1,420.00 transferred successfully to bank account.',
      time: '1 day ago',
      type: 'PAYOUT',
      unread: false
    },
    {
      id: 4,
      title: 'System Security Verification',
      message: 'Organizer account credentials and RBAC permission checks verified.',
      time: '2 days ago',
      type: 'SYSTEM',
      unread: false
    }
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-brand-900/10 dark:from-purple-950/50 dark:via-indigo-950/40 dark:to-brand-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Organizer Notifications</h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              /organizer/notifications
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">System alerts, new ticket sales, inventory capacity warnings, and payouts</p>
        </div>

        <Button variant="outline" size="sm" onClick={markAllRead} icon={<CheckCircle2 className="w-4 h-4" />}>
          Mark All as Read
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`glass-card p-4 rounded-2xl border flex items-start gap-4 transition-all ${n.unread
                ? 'border-purple-500/40 bg-purple-500/10 dark:bg-purple-950/20'
                : 'border-slate-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40'
              }`}
          >
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40 shrink-0">
              {n.type === 'BOOKING' ? (
                <Ticket className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              ) : n.type === 'WARNING' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h3>
                <span className="text-[10px] text-slate-400 dark:text-gray-400 font-mono">{n.time}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-gray-300">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

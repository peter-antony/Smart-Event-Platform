import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Ticket, Calendar, AlertTriangle, Clock, Info, X } from 'lucide-react';
import { AppNotification, fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/notificationApi';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    const res = await fetchNotifications('user_default');
    setNotifications(res.notifications);
    setUnreadCount(res.unreadCount);
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 8000); // Polling update interval
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"><Ticket className="w-4 h-4" /></div>;
      case 'EVENT_REMINDER':
        return <div className="p-2 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30"><Clock className="w-4 h-4" /></div>;
      case 'EVENT_UPDATED':
        return <div className="p-2 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30"><Info className="w-4 h-4" /></div>;
      case 'EVENT_CANCELLED':
        return <div className="p-2 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30"><AlertTriangle className="w-4 h-4" /></div>;
      case 'CALENDAR_ADDED':
        return <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"><Calendar className="w-4 h-4" /></div>;
      default:
        return <div className="p-2 rounded-xl bg-slate-200 dark:bg-gray-800 text-slate-500 dark:text-gray-400"><Bell className="w-4 h-4" /></div>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Header Notification Bell Icon with Badge Counter */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl glass-card border border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm flex items-center justify-center"
        aria-label="In-App Notifications"
      >
        <Bell className="w-5 h-5 text-slate-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-red-500 text-[10px] font-bold text-white shadow-glow animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel rounded-2xl p-4 shadow-2xl border border-purple-500/30 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Panel Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">In-App Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto space-y-2.5 pt-3 pr-1 no-scrollbar">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-gray-500 text-xs">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 ${n.is_read
                      ? 'bg-slate-100/60 dark:bg-gray-900/40 border-slate-200 dark:border-gray-800/60 opacity-75'
                      : 'bg-gradient-to-r from-purple-50 dark:from-purple-950/40 to-white dark:to-gray-900 border-purple-500/30 shadow-sm hover:border-purple-500/50'
                    }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {getNotificationIcon(n.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-gray-200 truncate">{n.title}</h4>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                    <span className="block text-[9px] text-slate-400 dark:text-gray-500 font-mono mt-1">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  LogOut,
  Menu,
  Bell,
  Settings,
  ChevronDown,
  Clock
} from 'lucide-react';
import { NavTab } from '../../types/event';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';

interface AdminHeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onToggleSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ setActiveTab, onToggleSidebar }) => {
  const { user, logout } = useAuth();

  // Dropdown States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: '1', title: 'New Organizer Registered', desc: 'Sarah Event Organizer created an account', time: '10m ago', unread: true },
    { id: '2', title: 'Event Moderation Flag', desc: 'Global AI Summit flagged for banner review', time: '1h ago', unread: true },
    { id: '3', title: 'System Seed Successful', desc: 'Database tables seeded across 10 schemas', time: '3h ago', unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="glass-panel sticky top-0 z-40 border-b border-rose-500/20 px-4 lg:px-6 py-3 flex items-center justify-between shadow-md bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
            title="Toggle Sidebar Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Brand Logo with Admin Badge */}
        <div
          onClick={() => setActiveTab('admin-dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-600 via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">Eventora</span>
              <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-gray-500 hidden sm:block">Control Center</p>
          </div>
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Icon & Dropdown Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className="relative p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white dark:border-gray-950 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl border border-rose-500/30 bg-white dark:bg-gray-900 shadow-2xl z-50 p-4 space-y-3 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Admin Notifications</h4>
                </div>
                <button
                  onClick={() => setActiveTab('admin-notifications')}
                  className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      setActiveTab('admin-notifications');
                    }}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      n.unread
                        ? 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20'
                        : 'bg-slate-50 dark:bg-gray-800/50 border-slate-200 dark:border-gray-800 hover:bg-slate-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-white">{n.title}</span>
                      <span className="text-[9px] text-slate-400 dark:text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {n.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-gray-300">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown Menu */}
        {user && (
          <div className="relative border-l border-slate-200 dark:border-gray-800 pl-3" ref={profileRef}>
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-gray-800/80 transition-colors group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-purple-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md">
                {user.full_name.charAt(0).toUpperCase()}
              </div>

              <div className="hidden md:block text-left">
                <span className="block text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  {user.full_name}
                </span>
                <span className="text-[9px] text-rose-600 dark:text-rose-400 font-mono font-extrabold">
                  {user.role}
                </span>
              </div>

              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
            </button>

            {/* Profile Menu Popover */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl border border-rose-500/30 bg-white dark:bg-gray-900 shadow-2xl z-50 p-3 space-y-3 animate-in fade-in zoom-in duration-200">
                <div className="p-2.5 rounded-xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30">
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">{user.full_name}</span>
                  <span className="block text-[11px] text-slate-500 dark:text-gray-400 truncate">{user.email}</span>
                  <span className="mt-1 inline-block px-2 py-0.5 text-[9px] font-mono font-extrabold rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40">
                    System Role: {user.role}
                  </span>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setActiveTab('admin-settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-gray-200 hover:bg-rose-500/10 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-300 font-semibold transition-colors"
                  >
                    <Settings className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Admin Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                      setActiveTab('login');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 font-semibold transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

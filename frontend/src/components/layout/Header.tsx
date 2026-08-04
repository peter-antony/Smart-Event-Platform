import React from 'react';
import { Sparkles, Calendar, Menu, LogOut } from 'lucide-react';
import { NavTab } from '../../types/event';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { NotificationDropdown } from '../notifications/NotificationDropdown';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ setActiveTab, onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    if (!name) return 'US';
    const parts = name.split(' ');
    return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    setActiveTab('login');
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-200 dark:border-gray-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800/60"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => setActiveTab(user?.role === 'ORGANIZER' ? 'organizer-dashboard' : 'discovery')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                Event<span className="text-brand-500">ora</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-md bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/30">
                Smart
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-gray-400 font-medium">AI Event Platform</p>
          </div>
        </div>
      </div>

      {/* Action Buttons, Notification & Theme Toggle */}
      <div className="flex items-center gap-3">
        {/* Notification Bell Dropdown */}
        <NotificationDropdown />

        {/* Theme Switcher Toggle */}
        <ThemeToggle />

        {/* AI Assistant Quick Trigger */}
        <button
          onClick={() => setActiveTab('ai-assistant')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/20 to-brand-600/20 border border-purple-500/30 hover:border-purple-500/60 text-purple-700 dark:text-purple-300 text-xs font-semibold transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        {/* User Role Badge & Logout */}
        {user ? (
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-gray-800">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">{user.full_name}</span>
              <span className={`text-[10px] font-mono font-bold leading-tight ${user.role === 'ORGANIZER' ? 'text-purple-600 dark:text-purple-400' : 'text-brand-600 dark:text-brand-400'
                }`}>
                {user.role}
              </span>
            </div>

            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-md ${user.role === 'ORGANIZER'
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-700'
                  : 'bg-gradient-to-br from-brand-600 to-indigo-600'
                }`}
            >
              {getInitials(user.full_name)}
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-xl text-slate-400 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-gray-800/60 transition-colors"
              title="Logout / Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setActiveTab('login')}
            className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

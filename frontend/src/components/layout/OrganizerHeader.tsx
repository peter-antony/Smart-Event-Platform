import React, { useState } from 'react';
import { Calendar, Bell, Menu, LogOut, ShieldCheck, X } from 'lucide-react';
import { NavTab } from '../../types/event';
import { useAuth } from '../../context/AuthContext';

interface OrganizerHeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onToggleSidebar?: () => void;
}

export const OrganizerHeader: React.FC<OrganizerHeaderProps> = ({ setActiveTab, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const mockNotifications = [
    { id: 1, title: 'New Ticket Booking', message: 'Alex Rivera reserved 2 passes for Music Concert', time: '10m ago', unread: true },
    { id: 2, title: 'Capacity Threshold Met', message: 'UI/UX Workshop has reached 80% seat occupancy', time: '1h ago', unread: true },
    { id: 3, title: 'Payout Processed', message: 'Gross revenue of $1,420.00 transferred to account', time: '1d ago', unread: false },
  ];

  const getInitials = (name: string) => {
    if (!name) return 'ORG';
    const parts = name.split(' ');
    return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    setActiveTab('login');
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-gray-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Responsive Mobile Menu Button */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors"
          title="Open Mobile Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Logo & Portal Badge */}
        <div
          onClick={() => setActiveTab('organizer-dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-brand-600 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white font-sans">
                Event<span className="text-purple-400">ora</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Organizer Portal
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">Event Command & Management Hub</p>
          </div>
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3.5">
        {/* Notification Icon & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors relative"
            title="Organizer Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 absolute top-1.5 right-1.5 ring-2 ring-gray-950 animate-pulse"></span>
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl p-4 border border-purple-500/30 shadow-2xl space-y-3 z-50 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-purple-400" /> Notifications
                </span>
                <button onClick={() => setShowNotificationMenu(false)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {mockNotifications.map((n) => (
                  <div key={n.id} className={`p-2.5 rounded-xl text-xs space-y-1 ${n.unread ? 'bg-purple-950/40 border border-purple-500/20' : 'bg-gray-900/40 border border-gray-800'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px]">{n.title}</span>
                      <span className="text-[9px] text-gray-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-tight">{n.message}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setShowNotificationMenu(false);
                  setActiveTab('organizer-notifications');
                }}
                className="w-full text-center text-[11px] font-bold text-purple-400 hover:text-purple-300 pt-1 block"
              >
                View All Notifications →
              </button>
            </div>
          )}
        </div>

        {/* Organizer Profile Section */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-800">
          <div
            onClick={() => setActiveTab('organizer-settings')}
            className="flex items-center gap-3 cursor-pointer group hover:opacity-90 transition-all"
            title="Go to Organizer Settings"
          >
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-white leading-none group-hover:text-purple-300 transition-colors">{user?.full_name || 'Organizer User'}</span>
              <div className="flex items-center gap-1 justify-end mt-0.5">
                <ShieldCheck className="w-3 h-3 text-purple-400" />
                <span className="text-[10px] font-mono font-extrabold text-purple-300 uppercase tracking-wider">
                  ORGANIZER
                </span>
              </div>
            </div>

            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-glow">
              {getInitials(user?.full_name || 'Organizer User')}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-gray-800/60 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

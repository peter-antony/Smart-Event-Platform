import React from 'react';
import { Calendar, Bot, Ticket, Sparkles, User } from 'lucide-react';
import { NotificationDropdown } from '../notifications/NotificationDropdown';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'discovery', label: 'Discover Events', icon: CompassIcon },
    { id: 'bookings', label: 'My Bookings', icon: Ticket },
    { id: 'assistant', label: 'AI Assistant', icon: Bot, isSpecial: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-gray-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('discovery')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform duration-300">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-white font-display">
                Eventora
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                AI Platform
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium hidden sm:block">
              Smart Event Discovery & Booking
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-gray-900/60 p-1.5 rounded-2xl border border-gray-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? item.isSpecial
                      ? 'bg-gradient-to-r from-purple-600 to-brand-600 text-white shadow-glow'
                      : 'bg-brand-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{item.label}</span>
                {item.isSpecial && !isActive && (
                  <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: In-App Notifications & User Profile */}
        <div className="flex items-center gap-3">
          {/* Notification Bell Badge & Dropdown */}
          <NotificationDropdown />

          <button
            onClick={() => setActiveTab('assistant')}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold shadow-glow"
          >
            <Bot className="w-4 h-4" />
            <span>AI Assistant</span>
          </button>

          {/* User Profile Avatar */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-800">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-gray-800 to-gray-700 text-gray-200 border border-gray-700 flex items-center justify-center text-xs font-bold shadow-sm">
              <User className="w-4 h-4 text-purple-300" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

function CompassIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

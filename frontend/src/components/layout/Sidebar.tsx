import React from 'react';
import { Compass, Ticket, Sparkles, FileText, ChevronRight, LayoutDashboard } from 'lucide-react';
import { NavTab } from '../../types/event';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { user } = useAuth();
  const isOrganizer = user?.role === 'ORGANIZER';

  const attendeeNavItems = [
    {
      id: 'discovery' as NavTab,
      label: 'Event Discovery',
      icon: Compass,
      description: 'Explore upcoming tech & AI events',
    },
    {
      id: 'details' as NavTab,
      label: 'Event Details',
      icon: FileText,
      description: 'Agenda, location & speaker overview',
    },
    {
      id: 'bookings' as NavTab,
      label: 'My Bookings',
      icon: Ticket,
      description: 'Tickets & confirmed registrations',
    },
    {
      id: 'ai-assistant' as NavTab,
      label: 'AI Event Assistant',
      icon: Sparkles,
      description: 'LangGraph agent recommendations',
      badge: 'AI',
    },
  ];

  const organizerNavItems = [
    {
      id: 'organizer-dashboard' as NavTab,
      label: 'Organizer Dashboard',
      icon: LayoutDashboard,
      description: 'Manage events, sales & seat capacity',
      badge: 'Organizer',
    },
    {
      id: 'discovery' as NavTab,
      label: 'Browse All Events',
      icon: Compass,
      description: 'View public event listings',
    },
    {
      id: 'ai-assistant' as NavTab,
      label: 'AI Assistant',
      icon: Sparkles,
      description: 'AI event query agent',
      badge: 'AI',
    },
  ];

  const navItems = isOrganizer ? organizerNavItems : attendeeNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full w-72 shrink-0 glass-panel border-r border-slate-200 dark:border-gray-800/80 py-2 flex flex-col justify-between overflow-y-auto transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="space-y-6">
          <nav className="space-y-1.5 p-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all group ${isActive
                    ? 'bg-gradient-to-r from-brand-600/10 dark:from-brand-600/20 to-indigo-600/10 dark:to-indigo-600/20 border border-brand-500/40 text-slate-900 dark:text-white shadow-glow'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 hover:bg-slate-100 dark:hover:bg-gray-800/50 border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-2 rounded-xl transition-colors ${isActive
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'bg-slate-200 dark:bg-gray-800/80 text-slate-500 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:bg-slate-300 dark:group-hover:bg-gray-700'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tracking-tight">{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-md bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-gray-500 truncate max-w-[150px]">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${isActive ? 'text-brand-500 dark:text-brand-400 translate-x-0.5' : 'text-slate-400 dark:text-gray-600 group-hover:text-slate-600 dark:group-hover:text-gray-400'
                      }`}
                  />
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

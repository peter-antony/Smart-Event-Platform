import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  Ticket,
  ChevronRight
} from 'lucide-react';
import { NavTab } from '../../types/event';

interface OrganizerSidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const OrganizerSidebar: React.FC<OrganizerSidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose
}) => {
  const organizerNavItems = [
    {
      id: 'organizer-dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview, KPIs & event stats',
      path: '/organizer/dashboard'
    },
    {
      id: 'organizer-events' as NavTab,
      label: 'My Events',
      icon: Calendar,
      description: 'View & manage live event listings',
      path: '/organizer/events'
    },
    {
      id: 'organizer-events-create' as NavTab,
      label: 'Create Event',
      icon: PlusCircle,
      description: 'Manual form event creation',
      path: '/organizer/events/create'
    },
    {
      id: 'organizer-bookings' as NavTab,
      label: 'Bookings',
      icon: Ticket,
      description: 'Attendee reservations & ticket passes',
      path: '/organizer/bookings'
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Organizer Sidebar Panel */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full w-72 shrink-0 glass-panel border-r border-slate-200 dark:border-gray-800/80 py-2 flex flex-col justify-between overflow-y-auto transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="space-y-6">
          <nav className="space-y-1 p-2">
            {organizerNavItems.map((item) => {
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
                    ? 'bg-gradient-to-r from-purple-600/20 dark:from-purple-600/30 to-indigo-600/20 dark:to-indigo-600/30 border border-purple-500/50 text-slate-900 dark:text-white shadow-glow'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 hover:bg-slate-100 dark:hover:bg-gray-800/50 border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-2 rounded-xl transition-colors ${isActive
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-200 dark:bg-gray-800/80 text-slate-500 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:bg-slate-300 dark:group-hover:bg-gray-700'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold tracking-tight">{item.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-gray-500 truncate max-w-[140px]">{item.description}</p>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${isActive ? 'text-purple-600 dark:text-purple-400 translate-x-0.5' : 'text-slate-400 dark:text-gray-600 group-hover:text-slate-600 dark:group-hover:text-gray-400'
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

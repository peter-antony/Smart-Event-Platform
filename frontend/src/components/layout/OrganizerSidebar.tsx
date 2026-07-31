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
  // const { user, logout } = useAuth();

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
      description: 'Publish new event & ticket passes',
      path: '/organizer/events/create',
      badge: 'New'
    },
    {
      id: 'organizer-bookings' as NavTab,
      label: 'Bookings',
      icon: Ticket,
      description: 'Attendee reservations & ticket passes',
      path: '/organizer/bookings'
    },
    // {
    //   id: 'organizer-analytics' as NavTab,
    //   label: 'Analytics',
    //   icon: BarChart3,
    //   description: 'Revenue graphs & seat occupancy',
    //   path: '/organizer/analytics'
    // },
    // {
    //   id: 'organizer-notifications' as NavTab,
    //   label: 'Notifications',
    //   icon: Bell,
    //   description: 'Alerts, bookings & inventory updates',
    //   path: '/organizer/notifications'
    // },
    // {
    //   id: 'organizer-settings' as NavTab,
    //   label: 'Settings',
    //   icon: Settings,
    //   description: 'Organizer profile & payouts',
    //   path: '/organizer/settings'
    // }
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
        className={`fixed lg:static top-0 left-0 z-50 h-full w-72 shrink-0 glass-panel border-r border-gray-800/80 py-2 flex flex-col justify-between overflow-y-auto transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="space-y-6">
          {/* Header Badge */}
          {/* <div className="px-2 pt-2 flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-purple-400 uppercase tracking-wider">
              Organizer Menu
            </span>
            <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
              7 ROUTES ACTIVE
            </span>
          </div> */}

          {/* 7 Sidebar Menu Items */}
          <nav className="space-y-1">
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
                    ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/50 text-white shadow-glow'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/50 border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-2 rounded-xl transition-colors ${isActive
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-800/80 text-gray-400 group-hover:text-white group-hover:bg-gray-700'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold tracking-tight">{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate max-w-[140px]">{item.description}</p>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${isActive ? 'text-purple-400 translate-x-0.5' : 'text-gray-600 group-hover:text-gray-400'
                      }`}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Organizer Profile Section Card at Bottom */}
        {/* <div className="glass-card p-4 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-950/20 to-gray-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-purple-600 text-white shadow-md shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-white truncate">{user?.full_name || 'Organizer User'}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email || 'organizer@example.com'}</p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                setActiveTab('login');
              }}
              className="p-1.5 rounded-xl bg-gray-800 hover:bg-red-950/60 text-gray-400 hover:text-red-300 transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[10px]">
            <span className="text-gray-500">Status</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Organizer Verified
            </span>
          </div>
        </div> */}
      </aside>
    </>
  );
};

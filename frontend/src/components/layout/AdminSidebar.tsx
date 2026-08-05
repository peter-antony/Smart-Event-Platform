import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  Ticket,
  BarChart3,
  Bell,
  Settings,
  ChevronRight
} from 'lucide-react';
import { NavTab } from '../../types/event';

interface AdminSidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose
}) => {
  // 8 Admin Sidebar Navigation Items
  const adminNavItems = [
    {
      id: 'admin-dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'System KPIs & health',
      path: '/admin/dashboard'
    },
    {
      id: 'admin-users' as NavTab,
      label: 'Users',
      icon: Users,
      description: 'Platform user accounts',
      path: '/admin/users'
    },
    {
      id: 'admin-organizers' as NavTab,
      label: 'Organizers',
      icon: Building2,
      description: 'Event creator accounts',
      path: '/admin/organizers'
    },
    {
      id: 'admin-events' as NavTab,
      label: 'Events',
      icon: Calendar,
      description: 'Platform event inventory',
      path: '/admin/events'
    },
    {
      id: 'admin-bookings' as NavTab,
      label: 'Bookings',
      icon: Ticket,
      description: 'Global ticket sales & bookings',
      path: '/admin/bookings'
    },
    {
      id: 'admin-analytics' as NavTab,
      label: 'Analytics',
      icon: BarChart3,
      description: 'Platform revenue & metrics',
      path: '/admin/analytics'
    },
    {
      id: 'admin-notifications' as NavTab,
      label: 'Notifications',
      icon: Bell,
      description: 'Dispatch logs & alerts',
      path: '/admin/notifications'
    },
    {
      id: 'admin-settings' as NavTab,
      label: 'Settings',
      icon: Settings,
      description: 'System config & RBAC rules',
      path: '/admin/settings'
    }
  ];

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Admin Sidebar Navigation Panel */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full w-72 shrink-0 glass-panel border-r border-rose-500/20 py-3 flex flex-col justify-between overflow-y-auto transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-4">
          <div className="px-4 py-2 flex items-center justify-between border-b border-slate-200 dark:border-gray-800 lg:hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Admin Navigation</span>
            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
            >
              Close ✕
            </button>
          </div>

          <nav className="space-y-1 p-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-600/20 dark:from-rose-600/30 to-purple-600/20 dark:to-purple-600/30 border border-rose-500/50 text-slate-900 dark:text-white shadow-glow'
                      : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 hover:bg-slate-100 dark:hover:bg-gray-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-2 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-rose-600 text-white shadow-md'
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
                    className={`w-4 h-4 transition-transform ${
                      isActive
                        ? 'text-rose-600 dark:text-rose-400 translate-x-0.5'
                        : 'text-slate-400 dark:text-gray-600 group-hover:text-slate-600 dark:group-hover:text-gray-400'
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

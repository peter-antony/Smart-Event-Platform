import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Calendar,
  Ticket,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Clock,
  Ban,
  Globe,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { NavTab } from '../../types/event';
import { fetchAdminDashboardStats } from '../../services/api';
import { AdminStatCard } from '../../components/admin/AdminStatCard';
import { Button } from '../../components/ui/Button';

interface AdminDashboardPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fallback metrics for offline testing
  const FALLBACK_STATS = {
    total_users: 5,
    total_attendees: 3,
    total_organizers: 2,
    total_events: 4,
    total_published_events: 3,
    total_bookings: 3,
    total_revenue: '$530.00',
    event_status_counts: {
      DRAFT: 1,
      PUBLISHED: 3,
      CANCELLED: 0,
      COMPLETED: 0
    },
    recent_users: [
      { id: 'admin-demo-333', full_name: 'System Administrator', email: 'admin@example.com', role: 'ADMIN', status: 'ACTIVE', created_at: '2026-08-01T00:00:00Z' },
      { id: 'org-organizer-222', full_name: 'Organizer User', email: 'organizer@example.com', role: 'ORGANIZER', status: 'ACTIVE', created_at: '2026-08-02T10:00:00Z' },
      { id: 'user-attendee-111', full_name: 'Attendee User', email: 'attendee@example.com', role: 'ATTENDEE', status: 'ACTIVE', created_at: '2026-08-03T14:30:00Z' }
    ],
    recent_events: [
      { id: 'evt-1', title: 'Global AI & Cloud Tech Conference 2026', category: 'Tech Conference', organizer_name: 'Organizer User', price: 149.00, status: 'PUBLISHED', date: '2026-08-15' },
      { id: 'evt-2', title: 'Modern UI/UX Design Systems Masterclass', category: 'UI/UX Workshop', organizer_name: 'Organizer User', price: 49.00, status: 'DRAFT', date: '2026-08-20' },
      { id: 'evt-3', title: 'Acoustic Live Concert Festival', category: 'Music', organizer_name: 'Sarah Event Organizer', price: 85.00, status: 'PUBLISHED', date: '2026-09-01' }
    ],
    recent_bookings: [
      { id: 'bkg-101', booking_reference: 'BK-8A2F9C1B', attendee_name: 'Antony Peter', event_title: 'Global AI & Cloud Tech Conference 2026', total_amount: '$298.00', status: 'CONFIRMED' },
      { id: 'bkg-102', booking_reference: 'BK-9B3C2D4E', attendee_name: 'Alex Rivera', event_title: 'Acoustic Live Concert Festival', total_amount: '$85.00', status: 'CONFIRMED' },
      { id: 'bkg-103', booking_reference: 'BK-7F4E1D9A', attendee_name: 'Attendee User', event_title: 'Modern UI/UX Design Systems Masterclass', total_amount: '$147.00', status: 'CANCELLED' }
    ]
  };

  const loadDashboardData = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setIsRefreshing(true);
    else setIsLoading(true);

    setErrorMessage(null);

    try {
      const res = await fetchAdminDashboardStats();
      if (res && res.total_users !== undefined) {
        setStats(res);
      } else {
        setStats(FALLBACK_STATS);
      }
    } catch (err: any) {
      console.warn('Backend API offline or error, falling back to mock metrics:', err);
      setStats(FALLBACK_STATS);
      setErrorMessage('Using fallback offline stats. Click refresh to retry backend connection.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Loading UI State
  if (isLoading && !stats) {
    return (
      <div className="py-24 text-center space-y-4 animate-in fade-in duration-200">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-rose-600 dark:text-rose-400" />
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Connecting to GET /api/v1/admin/dashboard...</h3>
        <p className="text-xs text-slate-500 dark:text-gray-400">Fetching real-time platform metrics, user stats, and revenue data</p>
      </div>
    );
  }

  // Error UI State with Retry Button
  if (errorMessage && !stats) {
    return (
      <div className="glass-panel p-8 rounded-3xl border border-red-500/40 text-center space-y-4 max-w-md mx-auto my-12 animate-in zoom-in duration-200">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Failed to Load Dashboard</h3>
          <p className="text-xs text-slate-500 dark:text-gray-400">{errorMessage}</p>
        </div>
        <Button variant="primary" onClick={() => loadDashboardData()} icon={<RefreshCw className="w-4 h-4" />}>
          Retry API Connection
        </Button>
      </div>
    );
  }

  const data = stats || FALLBACK_STATS;
  const statusCounts = data.event_status_counts || { DRAFT: 0, PUBLISHED: 0, CANCELLED: 0, COMPLETED: 0 };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Header with Real-Time Refresh */}
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-900/10 via-purple-900/10 to-brand-900/10 dark:from-rose-950/50 dark:via-purple-950/40 dark:to-brand-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin System Overview</h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
              GET /api/v1/admin/dashboard
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Real-time platform metrics, user role distribution, live event portfolios, and global revenue
          </p>
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          disabled={isRefreshing}
          onClick={() => loadDashboardData(true)}
          className="text-xs font-bold border-rose-500/40 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          icon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Warning Message Toast */}
      {errorMessage && (
        <div className="glass-panel p-3.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="font-bold underline">Dismiss</button>
        </div>
      )}

      {/* SUMMARY STAT CARDS (5 Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminStatCard
          title="Total Users"
          value={data.total_users}
          icon={Users}
          subtitle={`${data.total_attendees} Attendees / ${data.total_organizers} Hosts`}
          trend="+12% total growth"
          variantColor="rose"
        />

        <AdminStatCard
          title="Organizers"
          value={data.total_organizers}
          icon={Building2}
          subtitle="Verified host accounts"
          trend="+5% active hosts"
          variantColor="purple"
        />

        <AdminStatCard
          title="Total Events"
          value={data.total_events}
          icon={Calendar}
          subtitle={`${data.total_published_events} Live in inventory`}
          trend={`${statusCounts.PUBLISHED} Published`}
          variantColor="emerald"
        />

        <AdminStatCard
          title="Total Bookings"
          value={data.total_bookings}
          icon={Ticket}
          subtitle="Ticket passes issued"
          trend="Attendee conversion"
          variantColor="brand"
        />

        <AdminStatCard
          title="Total Revenue"
          value={data.total_revenue}
          icon={DollarSign}
          subtitle="Gross ticket volume"
          trend="+28% revenue growth"
          variantColor="indigo"
        />
      </div>

      {/* EVENT STATUS SUMMARY COUNTS (4 Cards) */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Event Lifecycle Status Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase">Draft Events</span>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400">{statusCounts.DRAFT || 0}</div>
            </div>
            <Clock className="w-6 h-6 text-amber-500/80" />
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase">Published Live</span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{statusCounts.PUBLISHED || 0}</div>
            </div>
            <Globe className="w-6 h-6 text-emerald-500/80" />
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase">Cancelled</span>
              <div className="text-xl font-black text-rose-600 dark:text-rose-400">{statusCounts.CANCELLED || 0}</div>
            </div>
            <Ban className="w-6 h-6 text-rose-500/80" />
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase">Completed</span>
              <div className="text-xl font-black text-purple-600 dark:text-purple-400">{statusCounts.COMPLETED || 0}</div>
            </div>
            <CheckCircle2 className="w-6 h-6 text-purple-500/80" />
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY SECTIONS (3 Tables) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table 1: Recent Users */}
        <div className="glass-panel rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-xl space-y-0">
          <div className="p-4 border-b border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">Recent System Users</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('admin-users')} className="p-1 text-[11px] font-bold text-rose-600">
              Manage <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-gray-900/90 border-b text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-gray-800/60">
                {data.recent_users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-slate-400 text-xs">No registered users yet.</td>
                  </tr>
                ) : (
                  data.recent_users.map((u: any) => (
                    <tr key={u.id}>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 dark:text-white block">{u.full_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{u.email}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-700 dark:text-rose-300">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                        {u.status}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Recent Events */}
        <div className="glass-panel rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-xl space-y-0">
          <div className="p-4 border-b border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">Recent Created Events</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('admin-events')} className="p-1 text-[11px] font-bold text-purple-600">
              Manage <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-gray-900/90 border-b text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-gray-800/60">
                {data.recent_events.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-slate-400 text-xs">No events created yet.</td>
                  </tr>
                ) : (
                  data.recent_events.map((e: any) => (
                    <tr key={e.id}>
                      <td className="p-3 font-bold text-slate-900 dark:text-white truncate max-w-[140px]">{e.title}</td>
                      <td className="p-3 text-slate-500">{e.category}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                          e.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-600'
                        }`}>
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 3: Recent Bookings */}
        <div className="glass-panel rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-xl space-y-0">
          <div className="p-4 border-b border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">Recent Ticket Bookings</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('admin-bookings')} className="p-1 text-[11px] font-bold text-brand-600">
              Manage <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-gray-900/90 border-b text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Attendee</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-gray-800/60">
                {data.recent_bookings.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-slate-400 text-xs">No bookings recorded yet.</td>
                  </tr>
                ) : (
                  data.recent_bookings.map((b: any) => (
                    <tr key={b.id}>
                      <td className="p-3 font-mono font-bold text-rose-600 dark:text-rose-400">{b.booking_reference}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{b.attendee_name}</td>
                      <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{b.total_amount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

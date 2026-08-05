import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Ban,
  Eye,
  Calendar,
  Loader2,
  Building2,
  AlertCircle
} from 'lucide-react';
import { NavTab } from '../../types/event';
import { fetchAdminOrganizers, updateAdminUserStatus } from '../../services/api';
import { Button } from '../../components/ui/Button';

interface AdminOrganizersPageProps {
  onNavigate: (tab: NavTab) => void;
  onSelectOrganizer: (organizerId: string) => void;
}

export interface AdminOrganizerItem {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'BLOCKED';
  total_events: number;
  published_events: number;
  total_bookings: number;
  total_revenue: string;
  created_at: string;
}

export const AdminOrganizersPage: React.FC<AdminOrganizersPageProps> = ({
  onNavigate,
  onSelectOrganizer
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [organizers, setOrganizers] = useState<AdminOrganizerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fallback initial dataset for development offline testing
  const FALLBACK_ORGANIZERS: AdminOrganizerItem[] = [
    {
      id: 'org-organizer-222',
      name: 'Organizer User',
      email: 'organizer@example.com',
      status: 'ACTIVE',
      total_events: 4,
      published_events: 3,
      total_bookings: 45,
      total_revenue: '$149,000.00',
      created_at: '2026-08-02T10:00:00Z'
    },
    {
      id: 'org-222',
      name: 'Sarah Event Organizer',
      email: 'sarah.org@smart-events.com',
      status: 'ACTIVE',
      total_events: 3,
      published_events: 2,
      total_bookings: 30,
      total_revenue: '$85,500.00',
      created_at: '2026-08-04T09:15:00Z'
    },
    {
      id: 'org-333',
      name: 'Tech Global Events LLC',
      email: 'events@techglobal.com',
      status: 'ACTIVE',
      total_events: 1,
      published_events: 1,
      total_bookings: 12,
      total_revenue: '$25,000.00',
      created_at: '2026-07-28T16:00:00Z'
    }
  ];

  const loadOrganizers = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminOrganizers(searchQuery);
      if (res && res.organizers) {
        setOrganizers(res.organizers);
      } else {
        let filtered = [...FALLBACK_ORGANIZERS];
        if (searchQuery) {
          const sq = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (o) => o.name.toLowerCase().includes(sq) || o.email.toLowerCase().includes(sq)
          );
        }
        setOrganizers(filtered);
      }
    } catch (err) {
      console.warn('Failed loading organizers, using fallback data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizers();
  }, [searchQuery]);

  const handleToggleStatus = async (org: AdminOrganizerItem) => {
    const nextStatus = org.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    setActionLoadingId(org.id);
    setMessage(null);

    try {
      await updateAdminUserStatus(org.id, nextStatus);
      setMessage({ type: 'success', text: `Success: Organizer "${org.name}" status updated to ${nextStatus}` });
      setOrganizers((prev) =>
        prev.map((item) => (item.id === org.id ? { ...item, status: nextStatus } : item))
      );
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed updating status' });
      setOrganizers((prev) =>
        prev.map((item) => (item.id === org.id ? { ...item, status: nextStatus } : item))
      );
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-900/10 via-purple-900/10 to-brand-900/10 dark:from-rose-950/50 dark:via-purple-950/40 dark:to-brand-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin Organizer Management</h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
              GET /api/v1/admin/organizers
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Manage verified event organizers, track event portfolios, revenue volume, and account access
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-gray-300 bg-white/50 dark:bg-gray-900/50 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-800">
          <span>Total Organizers:</span>
          <span className="text-purple-600 dark:text-purple-400 font-mono text-sm">{organizers.length} Hosts</span>
        </div>
      </div>

      {/* Notification Toast */}
      {message && (
        <div className={`glass-panel p-3.5 rounded-2xl border flex items-center gap-2 text-xs animate-in zoom-in duration-150 ${
          message.type === 'success'
            ? 'border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
            : 'border-red-500/40 bg-red-500/10 dark:bg-red-950/30 text-red-700 dark:text-red-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
          <span className="font-bold">{message.text}</span>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-gray-800 flex items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search organizers by name or email address..."
            className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-gray-900/90 border-b border-slate-200 dark:border-gray-800 text-slate-500 dark:text-gray-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4">Organizer Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Total Events</th>
                <th className="p-4">Published Events</th>
                <th className="p-4">Total Bookings</th>
                <th className="p-4">Total Revenue</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-800/60 text-slate-700 dark:text-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 dark:text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-rose-600 dark:text-rose-400 mb-2" />
                    <span>Loading organizers directory...</span>
                  </td>
                </tr>
              ) : organizers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 dark:text-gray-500">
                    No organizers matching search query.
                  </td>
                </tr>
              ) : (
                organizers.map((org) => (
                  <tr key={org.id} className="hover:bg-rose-500/10 dark:hover:bg-rose-950/20 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span>{org.name}</span>
                    </td>

                    <td className="p-4 font-mono text-slate-600 dark:text-gray-300">{org.email}</td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                        org.status === 'ACTIVE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {org.status === 'ACTIVE' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        {org.status}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-slate-900 dark:text-white">{org.total_events} Events</td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{org.published_events} Live</td>
                    <td className="p-4 font-bold">{org.total_bookings} Passes</td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{org.total_revenue}</td>
                    <td className="p-4 font-mono text-[11px] text-slate-400 dark:text-gray-500">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Organizer Details Page */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectOrganizer(org.id)}
                          className="p-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-500"
                          title="View Organizer Detail Page"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden xl:inline text-[11px] font-bold ml-1">View</span>
                        </Button>

                        {/* View Organizer Events */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigate('admin-events')}
                          className="p-1.5 text-purple-600 dark:text-purple-400 hover:text-purple-500"
                          title="View Events Portfolio"
                        >
                          <Calendar className="w-4 h-4" />
                          <span className="hidden xl:inline text-[11px] font-bold ml-1">Events</span>
                        </Button>

                        {/* Activate / Block Organizer Status */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoadingId === org.id}
                          onClick={() => handleToggleStatus(org)}
                          className={`text-[11px] font-bold py-1 px-2.5 ${
                            org.status === 'ACTIVE'
                              ? 'border-rose-500/40 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                              : 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }`}
                        >
                          {actionLoadingId === org.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : org.status === 'ACTIVE' ? (
                            'Block'
                          ) : (
                            'Activate'
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

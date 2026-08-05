import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Ticket,
  DollarSign,
  CheckCircle2,
  Ban,
  Loader2,
  Globe
} from 'lucide-react';
import { NavTab } from '../../types/event';
import { fetchAdminOrganizerById } from '../../services/api';
import { Button } from '../../components/ui/Button';

interface AdminOrganizerDetailPageProps {
  organizerId: string;
  onNavigate: (tab: NavTab) => void;
}

export const AdminOrganizerDetailPage: React.FC<AdminOrganizerDetailPageProps> = ({
  organizerId,
  onNavigate
}) => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback Organizer Data for offline testing
  const FALLBACK_DETAIL = {
    organizer: {
      id: organizerId || 'org-organizer-222',
      name: 'Organizer User',
      email: 'organizer@example.com',
      status: 'ACTIVE',
      created_at: '2026-08-02T10:00:00Z'
    },
    statistics: {
      total_events: 4,
      published_events: 3,
      total_tickets_sold: 145,
      total_revenue: '$149,000.00'
    },
    events: [
      { id: 'evt-1', title: 'Global AI & Cloud Tech Conference 2026', category: 'Tech Conference', date: '2026-08-15', price: 149.00, capacity: 300, available_seats: 155, status: 'PUBLISHED' },
      { id: 'evt-2', title: 'Modern UI/UX Design Systems Masterclass', category: 'UI/UX Workshop', date: '2026-08-20', price: 49.00, capacity: 500, available_seats: 215, status: 'DRAFT' },
      { id: 'evt-3', title: 'Acoustic Live Concert Festival', category: 'Music', date: '2026-09-01', price: 85.00, capacity: 1200, available_seats: 340, status: 'PUBLISHED' }
    ],
    booking_summary: [
      { id: 'b1', ref: 'BK-ORG8A2F9', eventTitle: 'Global AI & Cloud Tech Conference 2026', attendee: 'Attendee User (attendee@example.com)', tickets: 2, amount: '$298.00', status: 'CONFIRMED' },
      { id: 'b2', ref: 'BK-ORG9B3C2', eventTitle: 'Acoustic Live Concert Festival', attendee: 'Alex Rivera (alex.rivera@example.com)', tickets: 1, amount: '$85.00', status: 'CONFIRMED' }
    ],
    revenue_summary: {
      gross_revenue: '$149,000.00',
      monthly_projection: '$178,800.00',
      payout_status: 'ACTIVE & VERIFIED'
    }
  };

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      try {
        const res = await fetchAdminOrganizerById(organizerId);
        if (res && res.organizer) {
          setData(res);
        } else {
          setData(FALLBACK_DETAIL);
        }
      } catch (err) {
        console.warn('Failed loading detail from API, using fallback data');
        setData(FALLBACK_DETAIL);
      } finally {
        setIsLoading(false);
      }
    };

    loadDetail();
  }, [organizerId]);

  if (isLoading || !data) {
    return (
      <div className="py-20 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-rose-600 dark:text-rose-400" />
        <p className="text-xs text-slate-500 dark:text-gray-400 font-bold">Loading organizer profile & statistics...</p>
      </div>
    );
  }

  const { organizer, statistics, events, booking_summary, revenue_summary } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Back Button */}
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-900/10 via-purple-900/10 to-brand-900/10 dark:from-rose-950/50 dark:via-purple-950/40 dark:to-brand-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Organizer Profile & Portfolio</h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
              GET /api/v1/admin/organizers/{organizer.id}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Detailed organizer overview, created event portfolio, ticket bookings, and revenue breakdown
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => onNavigate('admin-organizers')}
          icon={<ArrowLeft className="w-4 h-4" />}
          className="text-xs font-bold"
        >
          Back to Organizers List
        </Button>
      </div>

      {/* SECTION 1: ORGANIZER PROFILE CARD */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-rose-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-glow shrink-0">
            {organizer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{organizer.name}</h2>
              <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-md border ${
                organizer.status === 'ACTIVE'
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40'
              }`}>
                {organizer.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                {organizer.status}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-gray-400 mt-0.5">{organizer.email}</p>
            <span className="text-[11px] text-slate-400 dark:text-gray-500">
              Joined Platform: {new Date(organizer.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 text-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase">Payout Verification</span>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{revenue_summary.payout_status}</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: ORGANIZER STATISTICS OVERVIEW (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Total Events</span>
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{statistics.total_events}</div>
          <p className="text-[11px] text-slate-400 dark:text-gray-500">Draft & published portfolio</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Published Live</span>
            <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{statistics.published_events}</div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Live in attendee inventory</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-brand-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Tickets Sold</span>
            <Ticket className="w-5 h-5 text-brand-500 dark:text-brand-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{statistics.total_tickets_sold} Passes</div>
          <p className="text-[11px] text-slate-400 dark:text-gray-500">Across all host events</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase">Gross Revenue</span>
            <DollarSign className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{statistics.total_revenue}</div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Total sales volume</p>
        </div>
      </div>

      {/* SECTION 3: EVENTS CREATED BY THIS ORGANIZER TABLE */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-xl space-y-0">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Events Created by {organizer.name}</h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-gray-400">{events.length} Events Listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-gray-900/90 border-b border-slate-200 dark:border-gray-800 text-slate-500 dark:text-gray-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4">Event Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Schedule Date</th>
                <th className="p-4">Ticket Price</th>
                <th className="p-4">Total Capacity</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-800/60 text-slate-700 dark:text-gray-200">
              {events.map((evt: any) => (
                <tr key={evt.id} className="hover:bg-rose-500/10 dark:hover:bg-rose-950/20 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{evt.title}</td>
                  <td className="p-4 text-slate-600 dark:text-gray-300">{evt.category}</td>
                  <td className="p-4 font-mono">{evt.date || evt.event_date}</td>
                  <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">${evt.price?.toFixed(2)}</td>
                  <td className="p-4 font-bold">{evt.capacity} Seats</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold font-mono border ${
                      evt.status === 'PUBLISHED'
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                    }`}>
                      {evt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: BOOKING & REVENUE SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Booking Summary Table (2 Cols) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">Recent Booking Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-gray-900/90 border-b border-slate-200 dark:border-gray-800 text-slate-500 dark:text-gray-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Event Title</th>
                  <th className="p-3">Attendee</th>
                  <th className="p-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-gray-800/60 text-slate-700 dark:text-gray-200">
                {booking_summary.map((b: any) => (
                  <tr key={b.id}>
                    <td className="p-3 font-mono font-bold text-rose-600 dark:text-rose-400">{b.ref || b.booking_reference}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white line-clamp-1">{b.eventTitle || b.event_title}</td>
                    <td className="p-3 text-slate-500 dark:text-gray-400 truncate max-w-[150px]">{b.attendee || b.attendee_email}</td>
                    <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{b.amount || b.total_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Summary Breakdown Card (1 Col) */}
        <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-gray-800">
            <DollarSign className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">Revenue Metrics Breakdown</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800">
              <span className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase">Gross All-Time Sales</span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{revenue_summary.gross_revenue}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800">
              <span className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase">Monthly Sales Projection</span>
              <div className="text-xl font-black text-purple-600 dark:text-purple-400">{revenue_summary.monthly_projection}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

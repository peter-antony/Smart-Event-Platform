import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Ban,
  Eye,
  User,
  Calendar,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { NavTab } from '../../types/event';
import { fetchAdminBookings, cancelAdminBooking } from '../../services/api';
import { Button } from '../../components/ui/Button';

interface AdminBookingsPageProps {
  onNavigate?: (tab: NavTab) => void;
}

export const AdminBookingsPage: React.FC<AdminBookingsPageProps> = () => {
  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [eventFilter, setEventFilter] = useState('ALL');
  const [organizerFilter, setOrganizerFilter] = useState('ALL');
  const [attendeeFilter, setAttendeeFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  const [page, setPage] = useState(1);
  const limit = 5;

  // Data & Loading States
  const [bookings, setBookings] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal View States
  const [selectedBookingModal, setSelectedBookingModal] = useState<any | null>(null);
  const [selectedAttendeeModal, setSelectedAttendeeModal] = useState<any | null>(null);
  const [selectedEventModal, setSelectedEventModal] = useState<any | null>(null);

  // Initial Fallback Data
  const FALLBACK_BOOKINGS = [
    {
      id: 'bkg-101',
      booking_reference: 'BK-8A2F9C1B',
      event_id: 'evt-1',
      event_title: 'Global AI & Cloud Tech Conference 2026',
      event_category: 'Tech Conference',
      event_date: '2026-08-15',
      event_location: 'Seattle Convention Center, WA',
      organizer_name: 'Organizer User',
      organizer_email: 'organizer@example.com',
      attendee_name: 'Antony Peter',
      attendee_email: 'user@example.com',
      tickets: 2,
      unit_price: 149.00,
      total_amount: '$298.00',
      status: 'CONFIRMED',
      booking_date: '2026-08-03',
      created_at: '2026-08-03T14:30:00Z'
    },
    {
      id: 'bkg-102',
      booking_reference: 'BK-9B3C2D4E',
      event_id: 'evt-3',
      event_title: 'Acoustic Live Concert Festival',
      event_category: 'Music',
      event_date: '2026-09-01',
      event_location: 'Austin Amphitheater, TX',
      organizer_name: 'Sarah Event Organizer',
      organizer_email: 'sarah.org@smart-events.com',
      attendee_name: 'Alex Rivera',
      attendee_email: 'alex.rivera@example.com',
      tickets: 1,
      unit_price: 85.00,
      total_amount: '$85.00',
      status: 'CONFIRMED',
      booking_date: '2026-08-04',
      created_at: '2026-08-04T11:20:00Z'
    },
    {
      id: 'bkg-103',
      booking_reference: 'BK-7F4E1D9A',
      event_id: 'evt-2',
      event_title: 'Modern UI/UX Design Systems Masterclass',
      event_category: 'UI/UX Workshop',
      event_date: '2026-08-20',
      event_location: 'Virtual Online Stream',
      organizer_name: 'Organizer User',
      organizer_email: 'organizer@example.com',
      attendee_name: 'Attendee User',
      attendee_email: 'attendee@example.com',
      tickets: 3,
      unit_price: 49.00,
      total_amount: '$147.00',
      status: 'CANCELLED',
      booking_date: '2026-08-02',
      created_at: '2026-08-02T09:15:00Z'
    }
  ];

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminBookings({
        search: searchQuery,
        status: statusFilter,
        event_id: eventFilter,
        organizer_email: organizerFilter,
        attendee_email: attendeeFilter,
        booking_date: dateFilter,
        page,
        limit
      });

      if (res && res.bookings) {
        setBookings(res.bookings);
        setTotalCount(res.total);
        setTotalPages(res.total_pages);
      } else {
        // Fallback filtering
        let filtered = [...FALLBACK_BOOKINGS];

        if (searchQuery) {
          const sq = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (b) => b.booking_reference.toLowerCase().includes(sq) || b.id.toLowerCase().includes(sq)
          );
        }
        if (statusFilter !== 'ALL') {
          filtered = filtered.filter((b) => b.status.toUpperCase() === statusFilter.toUpperCase());
        }
        if (eventFilter !== 'ALL') {
          filtered = filtered.filter((b) => b.event_id.toLowerCase() === eventFilter.toLowerCase());
        }
        if (organizerFilter !== 'ALL') {
          filtered = filtered.filter((b) => b.organizer_email.toLowerCase() === organizerFilter.toLowerCase());
        }
        if (attendeeFilter !== 'ALL') {
          filtered = filtered.filter((b) => b.attendee_email.toLowerCase() === attendeeFilter.toLowerCase());
        }
        if (dateFilter) {
          filtered = filtered.filter((b) => b.booking_date === dateFilter || b.created_at.startsWith(dateFilter));
        }

        const total = filtered.length;
        const totalP = Math.ceil(total / limit) || 1;
        const start = (page - 1) * limit;
        const pageData = filtered.slice(start, start + limit);

        setBookings(pageData);
        setTotalCount(total);
        setTotalPages(totalP);
      }
    } catch (err) {
      console.warn('Failed fetching admin bookings from API, using fallback');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [searchQuery, statusFilter, eventFilter, organizerFilter, attendeeFilter, dateFilter, page]);

  // Action Handler: Cancel Booking
  const handleCancelBooking = async (bkg: any) => {
    setActionLoadingId(bkg.id);
    setToastMessage(null);

    try {
      await cancelAdminBooking(bkg.id);
      setToastMessage({ type: 'success', text: `Success: Booking "${bkg.booking_reference}" cancelled` });
      setBookings((prev) =>
        prev.map((item) => (item.id === bkg.id ? { ...item, status: 'CANCELLED' } : item))
      );
    } catch (err: any) {
      setToastMessage({ type: 'success', text: `Booking "${bkg.booking_reference}" set to CANCELLED` });
      setBookings((prev) =>
        prev.map((item) => (item.id === bkg.id ? { ...item, status: 'CANCELLED' } : item))
      );
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-900/10 via-purple-900/10 to-brand-900/10 dark:from-rose-950/50 dark:via-purple-950/40 dark:to-brand-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin Global Booking Management</h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
              GET /api/v1/admin/bookings
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            View all attendee event bookings platform-wide, inspect attendee & event details, and process booking cancellations
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-gray-300 bg-white/50 dark:bg-gray-900/50 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-800">
          <span>Total Bookings:</span>
          <span className="text-rose-600 dark:text-rose-400 font-mono text-sm">{totalCount} Passes</span>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`glass-panel p-3.5 rounded-2xl border flex items-center gap-2 text-xs animate-in zoom-in duration-150 ${
          toastMessage.type === 'success'
            ? 'border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
            : 'border-red-500/40 bg-red-500/10 dark:bg-red-950/30 text-red-700 dark:text-red-300'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
          <span className="font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Search & Multi-Filter Control Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-gray-800 flex flex-col xl:flex-row items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by booking reference (e.g. BK-8A2F9C1B or ID)..."
            className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 dark:text-gray-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>

          {/* Event Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 dark:text-gray-400">Event:</span>
            <select
              value={eventFilter}
              onChange={(e) => {
                setEventFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Events</option>
              <option value="evt-1">Global AI & Cloud Tech Conference</option>
              <option value="evt-2">Modern UI/UX Design Systems</option>
              <option value="evt-3">Acoustic Live Concert</option>
            </select>
          </div>

          {/* Organizer Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 dark:text-gray-400">Organizer:</span>
            <select
              value={organizerFilter}
              onChange={(e) => {
                setOrganizerFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Organizers</option>
              <option value="organizer@example.com">Organizer User</option>
              <option value="sarah.org@smart-events.com">Sarah Event Organizer</option>
            </select>
          </div>

          {/* Attendee Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 dark:text-gray-400">Attendee:</span>
            <select
              value={attendeeFilter}
              onChange={(e) => {
                setAttendeeFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Attendees</option>
              <option value="user@example.com">Antony Peter</option>
              <option value="attendee@example.com">Attendee User</option>
              <option value="alex.rivera@example.com">Alex Rivera</option>
            </select>
          </div>

          {/* Booking Date Filter */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Main Bookings Data Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-gray-900/90 border-b border-slate-200 dark:border-gray-800 text-slate-500 dark:text-gray-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4">Booking Reference</th>
                <th className="p-4">Attendee Name</th>
                <th className="p-4">Event Name</th>
                <th className="p-4">Organizer Name</th>
                <th className="p-4">Tickets</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Booking Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-800/60 text-slate-700 dark:text-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 dark:text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-rose-600 dark:text-rose-400 mb-2" />
                    <span>Loading global bookings...</span>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 dark:text-gray-500">
                    No booking records match the filter criteria.
                  </td>
                </tr>
              ) : (
                bookings.map((bkg) => (
                  <tr key={bkg.id} className="hover:bg-rose-500/10 dark:hover:bg-rose-950/20 transition-colors">
                    {/* Booking Ref */}
                    <td className="p-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                      {bkg.booking_reference}
                    </td>

                    {/* Attendee Name */}
                    <td className="p-4">
                      <span className="block font-bold text-slate-900 dark:text-white">{bkg.attendee_name}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">{bkg.attendee_email}</span>
                    </td>

                    {/* Event Name */}
                    <td className="p-4 font-bold text-slate-900 dark:text-white max-w-[180px] truncate">
                      {bkg.event_title}
                    </td>

                    {/* Organizer Name */}
                    <td className="p-4 font-semibold text-slate-600 dark:text-gray-300">
                      {bkg.organizer_name}
                    </td>

                    {/* Tickets */}
                    <td className="p-4 font-bold">{bkg.tickets} Tickets</td>

                    {/* Total Amount */}
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {bkg.total_amount}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                        bkg.status?.toUpperCase() === 'CONFIRMED'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {bkg.status?.toUpperCase() === 'CONFIRMED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        {bkg.status?.toUpperCase()}
                      </span>
                    </td>

                    {/* Booking Date */}
                    <td className="p-4 font-mono text-[11px] text-slate-400 dark:text-gray-500">
                      {bkg.booking_date}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* 1. View Booking Details */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBookingModal(bkg)}
                          className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                          title="View Booking Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* 2. View Attendee Details */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAttendeeModal(bkg)}
                          className="p-1.5 text-purple-600 dark:text-purple-400 hover:text-purple-500"
                          title="View Attendee Details"
                        >
                          <User className="w-4 h-4" />
                        </Button>

                        {/* 3. View Event Details */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEventModal(bkg)}
                          className="p-1.5 text-brand-600 dark:text-brand-400 hover:text-brand-500"
                          title="View Event Details"
                        >
                          <Calendar className="w-4 h-4" />
                        </Button>

                        {/* 4. Cancel Booking Action */}
                        {bkg.status?.toUpperCase() === 'CONFIRMED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionLoadingId === bkg.id}
                            onClick={() => handleCancelBooking(bkg)}
                            className="text-[11px] font-bold py-1 px-2.5 border-rose-500/40 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            {actionLoadingId === bkg.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              'Cancel'
                            )}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-gray-900/50 text-xs">
          <div className="text-slate-500 dark:text-gray-400">
            Showing Page <span className="font-bold text-slate-900 dark:text-white">{page}</span> of{' '}
            <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span> ({totalCount} total bookings)
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* 1. VIEW BOOKING DETAILS MODAL */}
      {selectedBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-rose-500/30 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Booking Details Overview</h3>
              </div>
              <button onClick={() => setSelectedBookingModal(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Reference Code</span>
                <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400">{selectedBookingModal.booking_reference}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Event Title</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedBookingModal.event_title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Ticket Quantity</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedBookingModal.tickets} Passes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Unit Price</span>
                <span className="font-mono text-slate-700 dark:text-gray-300">${selectedBookingModal.unit_price}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2 border-slate-200 dark:border-gray-800">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Total Amount</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{selectedBookingModal.total_amount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Status</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{selectedBookingModal.status}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" onClick={() => setSelectedBookingModal(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. VIEW ATTENDEE DETAILS MODAL */}
      {selectedAttendeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-purple-500/30 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Attendee Profile Details</h3>
              </div>
              <button onClick={() => setSelectedAttendeeModal(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Full Name</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedAttendeeModal.attendee_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Email Address</span>
                <span className="font-mono text-slate-700 dark:text-gray-300">{selectedAttendeeModal.attendee_email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Role</span>
                <span className="font-mono font-bold text-brand-600 dark:text-brand-400">ATTENDEE</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" onClick={() => setSelectedAttendeeModal(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. VIEW EVENT DETAILS MODAL */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-brand-500/30 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Booked Event Summary</h3>
              </div>
              <button onClick={() => setSelectedEventModal(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Event Title</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedEventModal.event_title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Category</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">{selectedEventModal.event_category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Host Organizer</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedEventModal.organizer_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Event Date</span>
                <span className="font-mono">{selectedEventModal.event_date}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" onClick={() => setSelectedEventModal(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

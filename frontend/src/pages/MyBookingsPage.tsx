import React, { useEffect, useState, useMemo } from 'react';
import {
  Ticket,
  Calendar,
  MapPin,
  CheckCircle2,
  Eye,
  QrCode,
  Ban,
  Clock,
  RefreshCw,
  X,
  ShieldCheck,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { Booking } from '../types/event';
import { fetchMyBookings, cancelBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

type TabType = 'upcoming' | 'past' | 'cancelled';

export const MyBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const attendeeEmail = user?.email || 'attendee@example.com';

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Tab State
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  // Modals State
  const [selectedViewBooking, setSelectedViewBooking] = useState<Booking | null>(null);
  const [selectedTicketBooking, setSelectedTicketBooking] = useState<Booking | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyBookings(attendeeEmail);
      setBookings(data || []);
    } catch (err: any) {
      console.error('Error fetching attendee bookings:', err);
      setError('Unable to load your bookings from the server. Please verify your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [attendeeEmail]);

  // Tab Categorization
  const categorizedBookings = useMemo(() => {
    const now = new Date().getTime();

    const upcoming: Booking[] = [];
    const past: Booking[] = [];
    const cancelled: Booking[] = [];

    bookings.forEach((b) => {
      const status = (b.status || 'CONFIRMED').toUpperCase();
      const startTime = b.event?.start_time ? new Date(b.event.start_time).getTime() : now + 86400000;

      if (status === 'CANCELLED') {
        cancelled.push(b);
      } else if (startTime < now) {
        past.push(b);
      } else {
        upcoming.push(b);
      }
    });

    return { upcoming, past, cancelled };
  }, [bookings]);

  const activeList = categorizedBookings[activeTab];

  // Handle Cancel Booking Action
  const handleCancelBookingSubmit = async (bookingIdOrRef: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Tickets will be returned to event capacity.')) {
      return;
    }

    setCancellingId(bookingIdOrRef);
    try {
      await cancelBooking(bookingIdOrRef);
      // Update local status to CANCELLED in real-time
      setBookings((prev) =>
        prev.map((item) =>
          item.id === bookingIdOrRef || item.booking_reference === bookingIdOrRef
            ? { ...item, status: 'CANCELLED' }
            : item
        )
      );

      setToastMessage('🚫 Booking cancelled successfully. Tickets restored to event inventory.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to cancel booking:', err);
      alert(err.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'TBD';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (statusStr: string) => {
    const stat = statusStr.toUpperCase();
    if (stat === 'CONFIRMED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> CONFIRMED
        </span>
      );
    }
    if (stat === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
          <Ban className="w-3 h-3 text-red-400" /> CANCELLED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
        <Clock className="w-3 h-3 text-amber-400" /> PENDING
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-brand-500/30 bg-gradient-to-r from-brand-950/70 via-indigo-950/50 to-purple-950/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Ticket className="w-5 h-5 text-brand-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">My Registered Bookings</h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/30">
              GET /api/v1/bookings/my
            </span>
          </div>
          <p className="text-xs text-gray-300">View your ticket passes, inspect booking details, download QR codes, or manage reservations for <strong className="text-brand-300">{attendeeEmail}</strong></p>
        </div>

        <Badge variant="brand" className="self-start sm:self-center px-3 py-1.5 text-xs font-bold">
          {bookings.length} Total Registered Passes
        </Badge>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="glass-panel p-3.5 rounded-2xl border border-brand-500/40 bg-brand-950/40 flex items-center gap-2 text-xs text-brand-200 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tabs Navigation Toolbar (Upcoming, Past, Cancelled) */}
      <div className="glass-card p-1.5 rounded-2xl border border-gray-800 flex items-center gap-2 bg-gray-900/60 max-w-md">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'upcoming'
              ? 'bg-brand-600 text-white shadow-glow'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Upcoming</span>
          <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-mono">
            {categorizedBookings.upcoming.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'past'
              ? 'bg-brand-600 text-white shadow-glow'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Past</span>
          <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-mono">
            {categorizedBookings.past.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cancelled')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'cancelled'
              ? 'bg-red-600 text-white shadow-glow'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Ban className="w-3.5 h-3.5" />
          <span>Cancelled</span>
          <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-mono">
            {categorizedBookings.cancelled.length}
          </span>
        </button>
      </div>

      {/* Main Bookings List Container */}
      {loading ? (
        /* Loading Skeleton State */
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="glass-card h-44 rounded-3xl animate-pulse p-6 bg-gray-900/40 border border-gray-800" />
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="glass-panel p-10 rounded-3xl border border-red-500/30 text-center space-y-4 bg-red-950/20">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Error Loading Bookings</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">{error}</p>
          </div>
          <Button
            variant="outline"
            onClick={loadBookings}
            icon={<RefreshCw className="w-4 h-4" />}
            className="text-xs py-2 px-4"
          >
            Retry Connection
          </Button>
        </div>
      ) : activeList.length === 0 ? (
        /* Tab Empty State */
        <div className="glass-panel p-12 text-center rounded-3xl border border-gray-800 space-y-3 bg-gradient-to-b from-gray-900/40 to-gray-950/60">
          <Ticket className="w-10 h-10 mx-auto text-gray-600" />
          <h3 className="text-base font-bold text-gray-300">
            {activeTab === 'upcoming'
              ? 'No upcoming bookings found'
              : activeTab === 'past'
              ? 'No past event bookings'
              : 'No cancelled bookings'}
          </h3>
          <p className="text-xs text-gray-500">
            {activeTab === 'upcoming'
              ? 'Explore live published events and register your ticket passes.'
              : 'Your booking history will appear here.'}
          </p>
        </div>
      ) : (
        /* Bookings List Cards */
        <div className="space-y-4">
          {activeList.map((bkg) => {
            const evt = bkg.event || {
              title: 'Smart Event Pass',
              image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
              location: 'Main Hall',
              city: 'San Francisco',
              start_time: bkg.created_at
            };

            const isCancelled = (bkg.status || '').toUpperCase() === 'CANCELLED';

            return (
              <div
                key={bkg.id}
                className="glass-card rounded-3xl p-6 border border-gray-800 hover:border-brand-500/40 transition-all flex flex-col md:flex-row justify-between gap-6 group"
              >
                {/* Left Column: Cover Image & Event Details */}
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <img
                    src={evt.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80'}
                    alt={evt.title}
                    className="w-full sm:w-40 h-32 object-cover rounded-2xl shrink-0 group-hover:scale-[1.02] transition-transform"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(bkg.status)}
                      <span className="text-xs font-mono text-brand-300 font-bold bg-brand-950/40 px-2 py-0.5 rounded-md border border-brand-500/20">
                        Ref: {bkg.booking_reference || bkg.id}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-white tracking-tight leading-snug">
                      {evt.title}
                    </h3>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-300 pt-1">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                        {formatDate(evt.start_time)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                        {evt.city ? `${evt.city} • ${evt.location}` : evt.location}
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-400 pt-1">
                      Booked on: <strong className="text-gray-300">{formatDateTime(bkg.created_at)}</strong>
                    </div>
                  </div>
                </div>

                {/* Right Column: Ticket Summary & Actions */}
                <div className="flex flex-row md:flex-col justify-between items-end border-t md:border-t-0 md:border-l border-gray-800/80 pt-4 md:pt-0 md:pl-6 shrink-0 gap-4">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-gray-400">Tickets ({bkg.number_of_tickets} Pass)</span>
                    <div className="text-2xl font-extrabold text-brand-400">${bkg.total_amount.toFixed(2)}</div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {/* View Booking */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedViewBooking(bkg)}
                      icon={<Eye className="w-3.5 h-3.5" />}
                      className="text-xs border-gray-700 hover:border-brand-500 text-gray-200"
                      title="View Booking Details"
                    >
                      View Booking
                    </Button>

                    {/* View Ticket */}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedTicketBooking(bkg)}
                      icon={<QrCode className="w-3.5 h-3.5" />}
                      className="text-xs bg-brand-600 hover:bg-brand-500 text-white font-bold"
                      title="View E-Ticket & QR Code"
                    >
                      View Ticket
                    </Button>

                    {/* Cancel Booking */}
                    {!isCancelled && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={cancellingId === bkg.id}
                        onClick={() => handleCancelBookingSubmit(bkg.id)}
                        icon={<Ban className="w-3.5 h-3.5" />}
                        className="text-xs text-red-400 hover:bg-red-950/40"
                        title="Cancel Booking"
                      >
                        {cancellingId === bkg.id ? 'Cancelling...' : 'Cancel'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Booking Summary Modal */}
      {selectedViewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-brand-500/30 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-400" />
                <h3 className="text-lg font-bold text-white">Booking Details Overview</h3>
              </div>
              <button onClick={() => setSelectedViewBooking(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Booking Reference</span>
                  <div className="font-mono text-base font-extrabold text-brand-400">{selectedViewBooking.booking_reference}</div>
                </div>
                <div>{getStatusBadge(selectedViewBooking.status)}</div>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-white">{selectedViewBooking.event?.title || 'Smart Event'}</h4>
                <p className="text-gray-400">{selectedViewBooking.event?.city} • {selectedViewBooking.event?.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                  <span className="text-gray-400 block text-[10px]">Ticket Quantity</span>
                  <span className="font-bold text-white text-sm">{selectedViewBooking.number_of_tickets} Pass(es)</span>
                </div>

                <div className="p-3 rounded-xl bg-gray-900 border border-gray-800">
                  <span className="text-gray-400 block text-[10px]">Total Paid</span>
                  <span className="font-bold text-brand-400 text-sm">${selectedViewBooking.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 space-y-1">
                <span className="text-gray-400 block text-[10px]">Registered Attendee</span>
                <div className="font-bold text-white">{selectedViewBooking.user_id}</div>
                <span className="text-[10px] text-gray-500">Booked at {formatDateTime(selectedViewBooking.created_at)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedViewBooking(null)}>
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Ticket E-Pass & QR Code Placeholder Modal */}
      {selectedTicketBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-6 border border-brand-500/40 bg-gradient-to-b from-gray-900 via-gray-950 to-brand-950/60 space-y-5 text-center animate-in fade-in zoom-in duration-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <span className="text-xs font-bold text-brand-400 flex items-center gap-1.5">
                <Ticket className="w-4 h-4" /> OFFICIAL E-TICKET PASS
              </span>
              <button onClick={() => setSelectedTicketBooking(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white">{selectedTicketBooking.event?.title || 'Smart Event'}</h3>
              <p className="text-xs text-gray-400">{formatDate(selectedTicketBooking.event?.start_time)}</p>
            </div>

            {/* QR Code Placeholder SVG */}
            <div className="p-5 rounded-2xl bg-white text-gray-950 inline-block shadow-xl border-4 border-brand-500/30">
              <svg className="w-44 h-44 mx-auto" viewBox="0 0 100 100" fill="currentColor">
                <path d="M0,0 h30 v30 h-30 z M40,0 h20 v10 h-20 z M70,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M80,10 h10 v10 h-10 z M0,40 h10 v20 h-10 z M20,40 h20 v10 h-20 z M50,30 h10 v30 h-10 z M70,40 h20 v20 h-20 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,70 h30 v10 h-30 z M80,70 h20 v30 h-20 z M40,90 h20 v10 h-20 z M70,90 h10 v10 h-10 z" />
              </svg>
              <div className="mt-2 font-mono text-xs font-black tracking-widest text-gray-900">
                {selectedTicketBooking.booking_reference || 'BK-PASS-2026'}
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-300 pt-1">
              <div className="flex items-center justify-center gap-1 font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> Verified Pass • {selectedTicketBooking.number_of_tickets} Ticket(s)
              </div>
              <p className="text-[11px] text-gray-400">Scan at entrance for instant entry confirmation</p>
            </div>

            <Button variant="outline" className="w-full text-xs" onClick={() => setSelectedTicketBooking(null)}>
              Close Ticket Pass
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

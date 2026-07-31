import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Video,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Ticket,
  ShieldCheck,
  Heart,
  Ban,
  Building,
  User,
  Minus,
  Plus
} from 'lucide-react';
import { Event } from '../types/event';
import { fetchEventById } from '../services/api';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

interface EventDetailsPageProps {
  eventId?: string;
  event?: Event;
  onBack: () => void;
  onBook: (event: Event, ticketsCount: number) => void;
}

export const EventDetailsPage: React.FC<EventDetailsPageProps> = ({
  eventId,
  event: initialEvent,
  onBack,
  onBook
}) => {
  const [event, setEvent] = useState<Event | null>(initialEvent || null);
  const [loading, setLoading] = useState<boolean>(!initialEvent && !!eventId);
  const [error, setError] = useState<string | null>(null);

  // Ticket Quantity Selector State
  const [ticketsCount, setTicketsCount] = useState<number>(1);

  // Save Event State
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch Event from GET /api/v1/events/{eventId}
  useEffect(() => {
    const idToFetch = eventId || initialEvent?.id;
    if (idToFetch) {
      setLoading(true);
      fetchEventById(idToFetch)
        .then((data) => {
          if (data) setEvent(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching event details:', err);
          setError('Failed to load event details from server.');
          setLoading(false);
        });
    }
  }, [eventId, initialEvent]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 space-y-6">
        <div className="h-6 w-32 bg-gray-800 animate-pulse rounded-lg" />
        <div className="glass-card h-96 rounded-3xl animate-pulse bg-gray-900/40 border border-gray-800" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center space-y-4">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Discovery
        </button>
        <div className="glass-panel p-10 rounded-3xl border border-red-500/30 bg-red-950/20 text-center space-y-3">
          <h3 className="text-lg font-bold text-white">Event Not Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">{error || 'The requested event could not be found or has been removed.'}</p>
        </div>
      </div>
    );
  }

  // Derive Event Data & Booking Rules
  const availableSeats = event.available_seats !== undefined ? event.available_seats : (event.capacity || 100);
  const eventStatus = ((event as any).status || 'PUBLISHED').toUpperCase();

  // Booking Rule Restrictions
  const isCancelled = eventStatus === 'CANCELLED';
  const isCompleted = eventStatus === 'COMPLETED';
  const isSoldOut = availableSeats <= 0;
  const isBookingDisabled = isCancelled || isCompleted || isSoldOut;

  // Max ticket quantity constraint rule: cannot exceed available tickets
  const maxTicketQuantity = Math.max(1, availableSeats);

  const handleDecrement = () => {
    setTicketsCount((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setTicketsCount((prev) => Math.min(maxTicketQuantity, prev + 1));
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    setToastMessage(!isSaved ? '❤️ Event saved to your favorites!' : 'Event removed from your favorites.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Formatters
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const formatTimeRange = (startStr: string, endStr?: string) => {
    try {
      const startDate = new Date(startStr);
      const startTimeFormatted = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      if (endStr) {
        const endDate = new Date(endStr);
        const endTimeFormatted = endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return `${startTimeFormatted} – ${endTimeFormatted}`;
      }
      return startTimeFormatted;
    } catch {
      return '09:00 AM – 05:00 PM';
    }
  };

  const fullAddressStr = [(event as any).address, event.city, (event as any).state].filter(Boolean).join(', ') || `${event.city}, CA`;
  const venueNameStr = (event as any).venue_name || event.location || 'Main Auditorium';
  const organizerNameStr = event.organizer || (event as any).organizer_id || 'organizer@example.com';
  const totalPrice = event.price * ticketsCount;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Top Header / Back Button Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Event Discovery
        </button>

        {/* Save Event Button */}
        <button
          onClick={handleToggleSave}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            isSaved
              ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-glow'
              : 'bg-gray-900/60 border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-400 text-red-400' : ''}`} />
          {isSaved ? 'Saved to Favorites' : 'Save Event'}
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="glass-panel p-3.5 rounded-2xl border border-brand-500/40 bg-brand-950/40 flex items-center gap-2 text-xs text-brand-200 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-brand-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Details Card */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
        {/* Banner Cover Image */}
        <div className="relative h-72 lg:h-96 w-full overflow-hidden">
          <img
            src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

          {/* Banner Overlays */}
          <div className="absolute bottom-6 left-6 right-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">{event.category}</Badge>
              {event.is_virtual && (
                <Badge variant="purple" className="gap-1">
                  <Video className="w-3.5 h-3.5" /> Virtual Event
                </Badge>
              )}
              {isCancelled && (
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-red-500/30 text-red-300 border border-red-500/40">
                  Event Cancelled
                </span>
              )}
              {isCompleted && (
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                  Event Completed
                </span>
              )}
              {isSoldOut && !isCancelled && !isCompleted && (
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-500/30 text-amber-300 border border-amber-500/40">
                  Sold Out
                </span>
              )}
            </div>

            <h1 className="text-2xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {event.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-gray-300">
              <User className="w-3.5 h-3.5 text-brand-400" />
              <span>Organized by <strong className="text-white font-bold">{organizerNameStr}</strong></span>
            </div>
          </div>
        </div>

        {/* Details Content Layout */}
        <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Details, Venue, Full Address, Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">Event Description</h2>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Date and Time Breakdown */}
            <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-400" /> Date & Time Schedule
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300">
                <div>
                  <span className="text-gray-400 block text-[11px]">Event Date</span>
                  <span className="font-bold text-white text-sm">{formatDate(event.start_time)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Start & End Time</span>
                  <span className="font-bold text-white text-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-400" />
                    {formatTimeRange(event.start_time, event.end_time)}
                  </span>
                </div>
              </div>
            </div>

            {/* Venue & Address Breakdown */}
            <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-brand-400" /> Location & Venue Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300">
                <div>
                  <span className="text-gray-400 block text-[11px]">Venue Name</span>
                  <span className="font-bold text-white text-sm">{venueNameStr}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Full Address</span>
                  <span className="font-bold text-white text-sm flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                    {fullAddressStr}
                  </span>
                </div>
              </div>
            </div>

            {/* Event Highlights */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">Event Features & Pass Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-300">
                <div className="flex items-center gap-2 bg-gray-900/60 p-3 rounded-xl border border-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Full access to live keynotes & sessions
                </div>
                <div className="flex items-center gap-2 bg-gray-900/60 p-3 rounded-xl border border-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Interactive Q&A and networking lounge
                </div>
                <div className="flex items-center gap-2 bg-gray-900/60 p-3 rounded-xl border border-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Digital certificate of attendance
                </div>
                <div className="flex items-center gap-2 bg-gray-900/60 p-3 rounded-xl border border-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> On-demand video session recordings
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Booking Card */}
          <div className="space-y-4">
            <div className="glass-card p-6 rounded-3xl border border-brand-500/30 space-y-5 sticky top-24 shadow-glow">
              {/* Ticket Price & Availability */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                <div>
                  <span className="text-xs text-gray-400">Price per ticket</span>
                  <div className="text-3xl font-extrabold text-white">${event.price.toFixed(2)}</div>
                </div>

                {isSoldOut ? (
                  <Badge variant="warning">Sold Out</Badge>
                ) : (
                  <Badge variant="success">{availableSeats} Seats Left</Badge>
                )}
              </div>

              {/* Ticket Quantity Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <label className="font-bold text-white">Select Ticket Quantity</label>
                  <span className="text-gray-400 text-[11px]">Max: {maxTicketQuantity}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gray-900 border border-gray-800">
                  {/* Minus Button */}
                  <button
                    type="button"
                    disabled={ticketsCount <= 1 || isBookingDisabled}
                    onClick={handleDecrement}
                    className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-white flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="text-base font-extrabold text-white px-3 font-mono">{ticketsCount}</span>

                  {/* Plus Button */}
                  <button
                    type="button"
                    disabled={ticketsCount >= maxTicketQuantity || isBookingDisabled}
                    onClick={handleIncrement}
                    className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-white flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Total Price Calculation */}
              <div className="p-3.5 rounded-2xl bg-brand-950/30 border border-brand-500/20 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-300">Total Amount</span>
                <span className="text-xl font-extrabold text-brand-400">${totalPrice.toFixed(2)}</span>
              </div>

              {/* Book Now Button */}
              {isBookingDisabled ? (
                <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/30 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-400">
                    <Ban className="w-4 h-4" />
                    {isCancelled ? 'Event Cancelled' : isCompleted ? 'Event Completed' : 'Event Sold Out'}
                  </div>
                  <p className="text-[11px] text-gray-400">Booking is not available for this event status.</p>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-glow"
                  onClick={() => onBook(event, ticketsCount)}
                  icon={<Ticket className="w-4 h-4" />}
                >
                  Book Now
                </Button>
              )}

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Instant E-Ticket & Pass Confirmation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

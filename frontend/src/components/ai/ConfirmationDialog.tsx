import React, { useState } from 'react';
import { Ticket, X, Calendar, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Event } from '../../types/event';
import { Button } from '../ui/Button';

interface ConfirmationDialogProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (event: Event, ticketsCount: number, name: string, email: string) => Promise<void>;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  event,
  isOpen,
  onClose,
  onConfirmBooking,
}) => {
  const [userName, setUserName] = useState('Antony Peter');
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [ticketsCount, setTicketsCount] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!isOpen || !event) return null;

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onConfirmBooking(event, ticketsCount, userName, userEmail);
    setIsSubmitting(false);
    setIsConfirmed(true);

    setTimeout(() => {
      setIsConfirmed(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-purple-500/30 space-y-5 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Ticket className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Confirm Event Selection</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isConfirmed ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-xl font-extrabold text-white">Booking Confirmed!</h4>
            <p className="text-xs text-gray-300">
              {ticketsCount} ticket pass(es) issued for <span className="text-brand-400 font-semibold">{event.title}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="space-y-4">
            {/* Event Summary Card */}
            <div className="glass-card p-3.5 rounded-2xl flex items-center gap-3.5 border border-gray-800">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-16 h-16 object-cover rounded-xl shrink-0"
              />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white line-clamp-1">{event.title}</h4>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-purple-400" /> {formatDate(event.start_time)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-500" /> {event.city}
                  </span>
                </div>
                <div className="text-xs font-bold text-brand-400">
                  ${event.price.toFixed(2)} / ticket
                </div>
              </div>
            </div>

            {/* Ticket Quantity & Attendees */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                <span className="font-semibold text-gray-300">Number of Tickets</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTicketsCount(Math.max(1, ticketsCount - 1))}
                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 font-bold text-gray-200"
                  >
                    -
                  </button>
                  <span className="font-bold text-white text-sm">{ticketsCount}</span>
                  <button
                    type="button"
                    onClick={() => setTicketsCount(Math.min(10, ticketsCount + 1))}
                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 font-bold text-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-gray-900/80 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-100 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-gray-900/80 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-100 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Total Price Calculation */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/20 border border-purple-500/20">
              <span className="text-xs text-gray-400 font-medium">Total Amount Due</span>
              <span className="text-lg font-extrabold text-brand-400 font-mono">
                ${(event.price * ticketsCount).toFixed(2)}
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-3">
              <Button type="button" variant="outline" className="w-full" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Confirm Ticket Pass'}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Instant E-Ticket Confirmation
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

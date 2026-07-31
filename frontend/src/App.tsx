import React, { useState } from 'react';
import { NavTab, Event } from './types/event';
import { MOCK_EVENTS, createBooking } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { OrganizerLayout } from './components/layout/OrganizerLayout';

import { EventDiscoveryPage } from './pages/EventDiscoveryPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { AIEventAssistantPage } from './pages/AIEventAssistantPage';
import { LoginPage } from './pages/LoginPage';

// Organizer Routes Components
import { OrganizerDashboardPage } from './pages/organizer/OrganizerDashboardPage';
import { OrganizerEventsPage } from './pages/organizer/OrganizerEventsPage';
import { OrganizerCreateEventPage } from './pages/organizer/OrganizerCreateEventPage';
import { OrganizerBookingsPage } from './pages/organizer/OrganizerBookingsPage';
import { OrganizerAnalyticsPage } from './pages/organizer/OrganizerAnalyticsPage';
import { OrganizerNotificationsPage } from './pages/organizer/OrganizerNotificationsPage';
import { OrganizerSettingsPage } from './pages/organizer/OrganizerSettingsPage';

import { Ticket, X, CheckCircle2 } from 'lucide-react';
import { Button } from './components/ui/Button';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const isOrganizer = user?.role === 'ORGANIZER';

  // Default initial route tab
  const defaultTab: NavTab = isOrganizer ? 'organizer-dashboard' : 'discovery';
  const [activeTab, setActiveTab] = useState<NavTab>(defaultTab);
  const [selectedEvent, setSelectedEvent] = useState<Event>(MOCK_EVENTS[0]);

  // Global Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingEventTarget, setBookingEventTarget] = useState<Event | null>(null);
  const [userName, setUserName] = useState(user?.full_name || 'Attendee User');
  const [userEmail, setUserEmail] = useState(user?.email || 'attendee@example.com');
  const [ticketsCount, setTicketsCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleSelectEvent = (evt: Event) => {
    setSelectedEvent(evt);
    setActiveTab('details');
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', `/events/${evt.id}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBookModal = (evt: Event, count: number = 1) => {
    setBookingEventTarget(evt);
    setTicketsCount(count);
    setUserName(user?.full_name || 'Attendee User');
    setUserEmail(user?.email || 'attendee@example.com');
    setBookingSuccess(false);
    setIsBookingModalOpen(true);
  };

  const [lastCreatedBooking, setLastCreatedBooking] = useState<any>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const handleConfirmBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingEventTarget) return;

    setIsSubmitting(true);
    setBookingError(null);
    try {
      const res = await createBooking(bookingEventTarget.id, userName, userEmail, ticketsCount);
      setLastCreatedBooking(res);
      setBookingSuccess(true);

      setTimeout(() => {
        setIsBookingModalOpen(false);
        setActiveTab('bookings');
      }, 2000);
    } catch (err: any) {
      console.error('Booking creation error:', err);
      setBookingError(err.message || 'Failed to complete booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // ORGANIZER LAYOUT ROUTING (Role: ORGANIZER)
  // -------------------------------------------------------------
  if (isOrganizer && activeTab !== 'login') {
    return (
      <OrganizerLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        <ProtectedRoute allowedRoles={['ORGANIZER']} onNavigate={setActiveTab}>
          {activeTab === 'organizer-dashboard' && <OrganizerDashboardPage onNavigate={setActiveTab} />}
          {activeTab === 'organizer-events' && <OrganizerEventsPage onNavigate={setActiveTab} />}
          {activeTab === 'organizer-events-create' && <OrganizerCreateEventPage onNavigate={setActiveTab} />}
          {activeTab === 'organizer-bookings' && <OrganizerBookingsPage />}
          {activeTab === 'organizer-analytics' && <OrganizerAnalyticsPage />}
          {activeTab === 'organizer-notifications' && <OrganizerNotificationsPage />}
          {activeTab === 'organizer-settings' && <OrganizerSettingsPage />}

          {/* Browse events & AI Assistant accessibility for Organizers */}
          {activeTab === 'discovery' && (
            <EventDiscoveryPage
              onSelectEvent={handleSelectEvent}
              onBookEvent={(evt) => handleOpenBookModal(evt, 1)}
              onOpenAIAssistant={() => setActiveTab('ai-assistant')}
            />
          )}
          {activeTab === 'details' && (
            <EventDetailsPage
              event={selectedEvent}
              onBack={() => setActiveTab('organizer-dashboard')}
              onBook={(evt, count) => handleOpenBookModal(evt, count)}
            />
          )}
          {activeTab === 'ai-assistant' && (
            <AIEventAssistantPage onNavigateToBookings={() => setActiveTab('organizer-bookings')} />
          )}
        </ProtectedRoute>
      </OrganizerLayout>
    );
  }

  // -------------------------------------------------------------
  // ATTENDEE & GUEST LAYOUT ROUTING (Role: ATTENDEE / GUEST)
  // -------------------------------------------------------------
  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'login' && <LoginPage onNavigate={setActiveTab} />}

      {activeTab === 'discovery' && (
        <EventDiscoveryPage
          onSelectEvent={handleSelectEvent}
          onBookEvent={(evt) => handleOpenBookModal(evt, 1)}
          onOpenAIAssistant={() => setActiveTab('ai-assistant')}
        />
      )}

      {activeTab === 'details' && (
        <EventDetailsPage
          eventId={selectedEvent?.id}
          event={selectedEvent}
          onBack={() => setActiveTab('discovery')}
          onBook={(evt, count) => handleOpenBookModal(evt, count)}
        />
      )}

      {activeTab === 'bookings' && (
        <ProtectedRoute allowedRoles={['ATTENDEE', 'ADMIN']} onNavigate={setActiveTab}>
          <MyBookingsPage />
        </ProtectedRoute>
      )}

      {activeTab === 'ai-assistant' && (
        <AIEventAssistantPage
          onNavigateToBookings={() => setActiveTab('bookings')}
        />
      )}

      {/* Organizer route protection boundary when accessed by Attendee */}
      {activeTab.startsWith('organizer-') && (
        <ProtectedRoute allowedRoles={['ORGANIZER']} onNavigate={setActiveTab}>
          <div>Organizer Only Section</div>
        </ProtectedRoute>
      )}

      {/* Global Booking Dialog Modal */}
      {isBookingModalOpen && bookingEventTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-brand-500/30 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-brand-400" />
                <h3 className="text-lg font-bold text-white">Complete Booking</h3>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-xl font-extrabold text-white">Booking Confirmed!</h4>
                {lastCreatedBooking?.booking_reference && (
                  <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 inline-block font-mono text-xs text-brand-400 font-bold">
                    Ref: {lastCreatedBooking.booking_reference}
                  </div>
                )}
                <p className="text-xs text-gray-300">
                  Your reservation for <strong className="text-white">{ticketsCount} ticket pass(es)</strong> is stored. Redirecting to <span className="font-bold text-brand-400">My Bookings</span>...
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBookingSubmit} className="space-y-4">
                {bookingError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300">
                    {bookingError}
                  </div>
                )}
                <div className="glass-card p-3 rounded-xl flex items-center gap-3">
                  <img
                    src={bookingEventTarget.image_url}
                    alt={bookingEventTarget.title}
                    className="w-14 h-14 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{bookingEventTarget.title}</h4>
                    <p className="text-[11px] text-gray-400">{bookingEventTarget.location}</p>
                    <span className="text-xs font-bold text-brand-400">
                      ${(bookingEventTarget.price * ticketsCount).toFixed(2)} total
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Attendee Name</label>
                    <input
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Email Address (for E-Ticket)</label>
                    <input
                      type="email"
                      required
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Number of Tickets</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={ticketsCount}
                      onChange={(e) => setTicketsCount(parseInt(e.target.value) || 1)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsBookingModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Confirm Ticket'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

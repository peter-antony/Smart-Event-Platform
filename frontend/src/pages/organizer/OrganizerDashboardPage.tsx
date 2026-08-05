import React, { useState, useEffect } from 'react';
import { Calendar, Globe, Ticket, DollarSign, Plus, Layers, X, Edit3, Eye, CheckCircle2 } from 'lucide-react';
import { NavTab } from '../../types/event';
import { useAuth } from '../../context/AuthContext';
import { fetchOrganizerEvents, updateEventStatus } from '../../services/api';
import { DashboardCard } from '../../components/organizer/DashboardCard';
import { RecentEventsTable, OrganizerEventItem } from '../../components/organizer/RecentEventsTable';
import { Button } from '../../components/ui/Button';

interface OrganizerDashboardPageProps {
  onNavigate: (tab: NavTab) => void;
}

const DEFAULT_ORGANIZER_EVENTS: OrganizerEventItem[] = [
  {
    id: 'evt-org-001',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
    title: 'Global AI & Cloud Tech Conference 2026',
    category: 'Technology',
    city: 'San Francisco',
    location: 'Moscone Center West',
    date: 'Aug 20, 2026',
    status: 'Published',
    total_bookings: 1750,
    capacity: 3000,
    price: 299.00
  },
  {
    id: 'evt-org-002',
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
    title: 'Acoustic Harmony Music Concert',
    category: 'Music',
    city: 'Los Angeles',
    location: 'Hollywood Bowl Auditorium',
    date: 'Aug 10, 2026',
    status: 'Published',
    total_bookings: 860,
    capacity: 1200,
    price: 85.00
  },
  {
    id: 'evt-org-003',
    image_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80',
    title: 'Modern UI/UX Design Systems Workshop',
    category: 'UI/UX Workshop',
    city: 'Austin',
    location: 'Austin Tech Hub Studio',
    date: 'Aug 05, 2026',
    status: 'Draft',
    total_bookings: 0,
    capacity: 500,
    price: 49.00
  },
  {
    id: 'evt-org-004',
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
    title: 'Founders & VCs Startup Pitch Meetup',
    category: 'Startup Meetup',
    city: 'Boston',
    location: 'Innovation District Lounge',
    date: 'Aug 12, 2026',
    status: 'Draft',
    total_bookings: 200,
    capacity: 200,
    price: 0.00
  },
  {
    id: 'evt-org-005',
    image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80',
    title: 'International Champions Sports Derby',
    category: 'Sports',
    city: 'New York',
    location: 'MetLife Stadium',
    date: 'Sep 01, 2026',
    status: 'Draft',
    total_bookings: 0,
    capacity: 5000,
    price: 120.00
  }
];

export const OrganizerDashboardPage: React.FC<OrganizerDashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const organizerEmail = user?.email || 'organizer@example.com';

  const [events, setEvents] = useState<OrganizerEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedViewEvent, setSelectedViewEvent] = useState<OrganizerEventItem | null>(null);
  const [selectedEditEvent, setSelectedEditEvent] = useState<OrganizerEventItem | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [editCapacity, setEditCapacity] = useState(0);

  // Synchronize dashboard events with backend API
  const loadDashboardEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchOrganizerEvents(organizerEmail);
      const myEvents = data.filter(
        (e: any) => !e.organizer_id || e.organizer_id.toLowerCase() === organizerEmail.toLowerCase()
      );

      if (myEvents.length === 0) {
        setEvents(DEFAULT_ORGANIZER_EVENTS);
      } else {
        const mapped: OrganizerEventItem[] = myEvents.map((e: any) => {
          const cap = e.capacity || 100;
          const avail = e.available_seats !== undefined ? e.available_seats : cap;
          const booked = Math.max(0, cap - avail);
          const isPub = e.status && e.status.toUpperCase() === 'PUBLISHED';

          let formattedDate = 'Aug 20, 2026';
          try {
            if (e.start_time) {
              formattedDate = new Date(e.start_time).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
            }
          } catch {
            formattedDate = 'Aug 20, 2026';
          }

          return {
            id: e.id,
            image_url: e.image_url || e.event_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
            title: e.title || e.name || e.event_name || 'Untitled Event',
            category: e.category || 'Technology',
            city: e.city || 'San Francisco',
            location: e.location || `${e.city || 'San Francisco'} Venue`,
            date: formattedDate,
            status: isPub ? 'Published' : 'Draft',
            total_bookings: booked,
            capacity: cap,
            price: e.price !== undefined ? e.price : (e.ticket_price || 0)
          };
        });

        setEvents(mapped);
      }
    } catch (err) {
      console.warn('Dashboard failed to fetch live events, using default set:', err);
      setEvents(DEFAULT_ORGANIZER_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardEvents();
  }, [organizerEmail]);

  // Calculate summary card metric figures dynamically from synchronized state
  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === 'Published').length;
  const totalBookings = events.reduce((sum, e) => sum + e.total_bookings, 0);
  const totalRevenue = events.reduce((sum, e) => sum + (e.total_bookings * e.price), 0);

  // Action Handler: Publish / Unpublish Toggle
  const handleTogglePublish = async (eventId: string) => {
    const target = events.find((e) => e.id === eventId);
    if (!target) return;

    const newStatus = target.status === 'Published' ? 'DRAFT' : 'PUBLISHED';
    try {
      await updateEventStatus(eventId, newStatus);
    } catch (err) {
      console.warn('Failed backend status sync:', err);
    }

    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, status: newStatus === 'PUBLISHED' ? 'Published' : 'Draft' }
          : e
      )
    );
  };

  // Action Handler: Open View Modal
  const handleView = (event: OrganizerEventItem) => {
    setSelectedViewEvent(event);
  };

  // Action Handler: Open Edit Modal
  const handleEdit = (event: OrganizerEventItem) => {
    setSelectedEditEvent(event);
    setEditTitle(event.title);
    setEditPrice(event.price);
    setEditCapacity(event.capacity);
  };

  // Save Edit Form
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditEvent) return;

    setEvents((prev) =>
      prev.map((item) =>
        item.id === selectedEditEvent.id
          ? { ...item, title: editTitle, price: editPrice, capacity: editCapacity }
          : item
      )
    );
    setSelectedEditEvent(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-brand-900/10 dark:from-purple-950/50 dark:via-indigo-950/40 dark:to-brand-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-brand-600 text-white shadow-glow">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Organizer Dashboard</h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400">Overview metrics, live event status, attendee bookings, and revenue tracking</p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => onNavigate('organizer-events-create')}
          icon={<Plus className="w-4 h-4" />}
          className="bg-purple-600 hover:bg-purple-500 text-white shadow-md text-xs font-bold"
        >
          Create New Event
        </Button>
      </div>

      {/* Summary KPI Metric Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Events */}
        <DashboardCard
          title="Total Events"
          value={totalEvents}
          icon={Calendar}
          trend="+15%"
          subtitle="Managed in system"
          variantColor="purple"
        />

        {/* Card 2: Published Events */}
        <DashboardCard
          title="Published Events"
          value={publishedEvents}
          icon={Globe}
          trend="+8%"
          subtitle={`${totalEvents - publishedEvents} in draft`}
          variantColor="emerald"
        />

        {/* Card 3: Total Bookings */}
        <DashboardCard
          title="Total Bookings"
          value={totalBookings.toLocaleString()}
          icon={Ticket}
          trend="+24.5%"
          subtitle="Passes issued"
          variantColor="brand"
        />

        {/* Card 4: Total Revenue */}
        <DashboardCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          trend="+19.2%"
          subtitle="Gross sales payout"
          variantColor="indigo"
        />
      </div>

      {/* Recent Events Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Recent Events Inventory</h2>
            <p className="text-xs text-slate-500 dark:text-gray-400">Manage status, view details, edit parameters, or toggle publication</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('organizer-events')}
            className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-bold"
          >
            View All Events →
          </Button>
        </div>

        {/* Reusable Recent Events Table Component */}
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-gray-400">Loading live dashboard metrics...</div>
        ) : (
          <RecentEventsTable
            events={events}
            onView={handleView}
            onEdit={handleEdit}
            onTogglePublish={handleTogglePublish}
          />
        )}
      </div>

      {/* View Event Detail Modal */}
      {selectedViewEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-purple-500/30 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Event Summary Overview</h3>
              </div>
              <button onClick={() => setSelectedViewEvent(null)} className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <img
                src={selectedViewEvent.image_url}
                alt={selectedViewEvent.title}
                className="w-full h-44 object-cover rounded-2xl border border-slate-200 dark:border-gray-800"
              />

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">{selectedViewEvent.category}</span>
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">{selectedViewEvent.title}</h4>
                <p className="text-xs text-slate-500 dark:text-gray-400">{selectedViewEvent.city} • {selectedViewEvent.location}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs pt-2">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800">
                  <span className="text-slate-500 dark:text-gray-400 block text-[10px]">Price</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">${selectedViewEvent.price.toFixed(2)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800">
                  <span className="text-slate-500 dark:text-gray-400 block text-[10px]">Bookings</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedViewEvent.total_bookings}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800">
                  <span className="text-slate-500 dark:text-gray-400 block text-[10px]">Status</span>
                  <span className={`font-bold ${selectedViewEvent.status === 'Published' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {selectedViewEvent.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedViewEvent(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {selectedEditEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-purple-500/30 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Event Details</h3>
              </div>
              <button onClick={() => setSelectedEditEvent(null)} className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-medium mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-gray-300 font-medium mb-1">Ticket Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-gray-300 font-medium mb-1">Total Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(Number(e.target.value))}
                    className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setSelectedEditEvent(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" icon={<CheckCircle2 className="w-4 h-4" />} className="bg-purple-600 hover:bg-purple-500 text-white">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

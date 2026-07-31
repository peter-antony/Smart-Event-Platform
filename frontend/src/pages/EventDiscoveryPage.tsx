import React, { useEffect, useState, useMemo } from 'react';
import {
  Sparkles,
  Calendar,
  TrendingUp,
  Search,
  MapPin,
  Ticket,
  ArrowUpDown,
  Bell,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Event } from '../types/event';
import { fetchPublishedEvents } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface EventDiscoveryPageProps {
  onSelectEvent: (event: Event) => void;
  onBookEvent: (event: Event) => void;
  onOpenAIAssistant: () => void;
}

export const EventDiscoveryPage: React.FC<EventDiscoveryPageProps> = ({
  onSelectEvent,
  onBookEvent,
  onOpenAIAssistant,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search Controls State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Notification Toast State
  const [notifyToast, setNotifyToast] = useState<boolean>(false);

  const categories = [
    'All',
    'Technology',
    'Music',
    'UI/UX Workshop',
    'Startup Meetup',
    'Sports',
    'Development',
    'Cloud & DevOps',
    'AI & ML'
  ];

  const cities = [
    'All',
    'San Francisco',
    'Los Angeles',
    'Austin',
    'New York',
    'Boston',
    'Chicago',
    'Seattle'
  ];

  // Fetch Published Events from GET /api/v1/events/published
  const loadPublishedEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPublishedEvents(
        selectedCategory,
        searchQuery,
        selectedCity,
        selectedDate
      );

      // Ensure ONLY events with status PUBLISHED (or no status field which defaults to published) are displayed
      const publishedOnly = (data || []).filter(
        (e: any) => !e.status || e.status.toUpperCase() === 'PUBLISHED'
      );

      setEvents(publishedOnly);
    } catch (err: any) {
      console.error('Failed to load published events:', err);
      setError('Unable to load published events from the server. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublishedEvents();
  }, [selectedCategory, selectedCity, selectedDate]);

  // Client-side instant keyword search and date sorting
  const filteredAndSortedEvents = useMemo(() => {
    return (events || [])
      .filter((evt) => {
        const titleMatch = (evt.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (evt.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        return titleMatch;
      })
      .sort((a, b) => {
        const timeA = new Date(a.start_time).getTime();
        const timeB = new Date(b.start_time).getTime();
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [events, searchQuery, sortOrder]);

  const handleNotifyMe = () => {
    setNotifyToast(true);
    setTimeout(() => setNotifyToast(false), 4000);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Banner with Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 lg:p-10 border border-brand-500/30 bg-gradient-to-r from-brand-950/80 via-indigo-950/60 to-purple-950/50">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Connected to GET /api/v1/events/published
          </div>
          <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
            Discover & Experience <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Smart Events</span>
          </h1>
          <p className="text-gray-300 text-sm lg:text-base leading-relaxed">
            Explore live published tech summits, music festivals, design workshops, and developer meetups. Book your pass instantly with real-time seat availability.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAIAssistant}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-brand-600 text-white font-semibold text-xs lg:text-sm shadow-glow flex items-center gap-2 hover:scale-[1.02] transition-transform"
            >
              <Sparkles className="w-4 h-4" />
              Ask AI Event Assistant
            </button>
          </div>
        </div>

        {/* Ambient Glow background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Toast Notification Banner */}
      {notifyToast && (
        <div className="glass-panel p-4 rounded-2xl border border-brand-500/40 bg-brand-950/50 flex items-center gap-3 text-xs text-brand-200 animate-in fade-in zoom-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0" />
          <span>You'll be notified via email whenever new events are published!</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Published Events</h2>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            Showing <strong className="text-white">{filteredAndSortedEvents.length}</strong> published event(s)
          </span>
        </div>

        {/* Filter Toolbar */}
        <div className="glass-card p-4 rounded-2xl border border-gray-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. Search by Event Name */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event name..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* 2. Filter by Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* 3. Filter by City */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
          >
            {cities.map((ct) => (
              <option key={ct} value={ct}>
                {ct === 'All' ? 'All Cities' : ct}
              </option>
            ))}
          </select>

          {/* 4. Filter by Date */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
          />

          {/* 5. Sort by Date */}
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="bg-gray-900 border border-gray-800 hover:border-brand-500 rounded-xl px-3 py-2 text-xs text-gray-300 flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-brand-400" />
              <span>Sort: {sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
            </span>
          </button>
        </div>
      </div>

      {/* Main Events Display Section */}
      {loading ? (
        /* Loading Skeleton State */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-card h-96 rounded-3xl animate-pulse p-6 bg-gray-900/40 border border-gray-800 space-y-4">
              <div className="h-44 bg-gray-800/60 rounded-2xl w-full" />
              <div className="h-4 bg-gray-800/80 rounded w-3/4" />
              <div className="h-3 bg-gray-800/60 rounded w-1/2" />
              <div className="h-10 bg-gray-800/60 rounded-xl w-full mt-4" />
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="glass-panel p-10 rounded-3xl border border-red-500/30 text-center space-y-4 bg-red-950/20">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Error Loading Events</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">{error}</p>
          </div>
          <Button
            variant="outline"
            onClick={loadPublishedEvents}
            icon={<RefreshCw className="w-4 h-4" />}
            className="text-xs py-2 px-4"
          >
            Retry Connection
          </Button>
        </div>
      ) : filteredAndSortedEvents.length === 0 ? (
        /* Empty State with Exact Required Text & Notify Me Button */
        <div className="glass-panel p-14 text-center rounded-3xl border border-gray-800 space-y-5 bg-gradient-to-b from-gray-900/40 to-gray-950/60">
          <div className="w-16 h-16 rounded-3xl bg-brand-950/50 border border-brand-500/30 text-brand-400 flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              No events are currently available.
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              There are no published events matching your criteria right now. Subscribe to receive alerts when new events are added!
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              variant="primary"
              onClick={handleNotifyMe}
              icon={<Bell className="w-4 h-4" />}
              className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-glow"
            >
              Notify Me
            </Button>

            {(searchQuery || selectedCategory !== 'All' || selectedCity !== 'All' || selectedDate) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedCity('All');
                  setSelectedDate('');
                }}
                className="text-xs py-2 px-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Published Events Grid Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedEvents.map((evt) => {
            const seatsAvailable = evt.available_seats !== undefined ? evt.available_seats : (evt.capacity || 100);
            return (
              <div
                key={evt.id}
                className="glass-card rounded-3xl overflow-hidden border border-gray-800 hover:border-brand-500/50 transition-all duration-300 hover:shadow-2xl flex flex-col justify-between group"
              >
                {/* Event Image Cover */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={evt.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80'}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />

                  <div className="absolute top-3 left-3">
                    <Badge variant="brand">{evt.category}</Badge>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-black/70 backdrop-blur-md text-brand-400 border border-brand-500/30">
                      ${evt.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Event Body Content */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-white group-hover:text-brand-300 transition-colors line-clamp-2">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div className="space-y-2 pt-2 border-t border-gray-800/80 text-xs text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                      <span className="truncate">{formatDate(evt.start_time)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                        <span className="truncate">{evt.city} • {evt.location || 'Main Venue'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Ticket className="w-3.5 h-3.5 text-brand-400" />
                        <span>Available Seats:</span>
                        <strong className="text-white font-bold">{seatsAvailable}</strong>
                      </div>

                      {evt.is_virtual && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                          Virtual
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2 grid grid-cols-2 gap-2.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectEvent(evt)}
                      icon={<Eye className="w-3.5 h-3.5" />}
                      className="text-xs py-2 border-gray-700 hover:border-brand-500 text-gray-200"
                    >
                      View Event
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onBookEvent(evt)}
                      className="text-xs py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold"
                    >
                      Book Ticket
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

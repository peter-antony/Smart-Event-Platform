import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  MapPin,
  Search,
  Edit3,
  Eye,
  Globe,
  EyeOff,
  Ban,
  Calendar,
  Ticket,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { NavTab } from '../../types/event';
import { useAuth } from '../../context/AuthContext';
import { fetchOrganizerEvents, updateEventStatus } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export interface OrganizerEventRecord {
  id: string;
  title: string;
  name?: string;
  category: string;
  city: string;
  location: string;
  start_time: string;
  end_time?: string;
  price: number;
  capacity: number;
  available_seats: number;
  image_url: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED' | string;
  organizer_id?: string;
}

interface OrganizerEventsPageProps {
  onNavigate: (tab: NavTab) => void;
}

const ITEMS_PER_PAGE = 4;

export const OrganizerEventsPage: React.FC<OrganizerEventsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const organizerEmail = user?.email || 'organizer@example.com';

  const [events, setEvents] = useState<OrganizerEventRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters and Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [selectedViewEvent, setSelectedViewEvent] = useState<OrganizerEventRecord | null>(null);
  const [selectedEditEvent, setSelectedEditEvent] = useState<OrganizerEventRecord | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [editCapacity, setEditCapacity] = useState(0);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Fetch events from GET /api/v1/events connected to logged-in organizer
  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchOrganizerEvents(organizerEmail);
      // Ensure filtering strictly by logged-in organizer
      const myEvents = data.filter(
        (e: any) => !e.organizer_id || e.organizer_id.toLowerCase() === organizerEmail.toLowerCase()
      );

      // Fallback sample organizer events if empty initially
      if (myEvents.length === 0) {
        const defaultOrganizerEvents: OrganizerEventRecord[] = [
          {
            id: 'evt-org-001',
            title: 'Global AI & Cloud Tech Conference 2026',
            category: 'Technology',
            city: 'San Francisco',
            location: 'Moscone Center West',
            start_time: '2026-08-20T09:00:00Z',
            price: 299.00,
            capacity: 3000,
            available_seats: 1250,
            image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
            status: 'PUBLISHED',
            organizer_id: organizerEmail
          },
          {
            id: 'evt-org-002',
            title: 'Acoustic Harmony Music Concert',
            category: 'Music',
            city: 'Los Angeles',
            location: 'Hollywood Bowl Auditorium',
            start_time: '2026-08-10T19:00:00Z',
            price: 85.00,
            capacity: 1200,
            available_seats: 340,
            image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
            status: 'PUBLISHED',
            organizer_id: organizerEmail
          },
          {
            id: 'evt-org-003',
            title: 'Modern UI/UX Design Systems Workshop',
            category: 'UI/UX Workshop',
            city: 'Austin',
            location: 'Austin Tech Hub Studio',
            start_time: '2026-08-05T10:00:00Z',
            price: 49.00,
            capacity: 500,
            available_seats: 500,
            image_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80',
            status: 'DRAFT',
            organizer_id: organizerEmail
          },
          {
            id: 'evt-org-004',
            title: 'Founders & VCs Startup Pitch Meetup',
            category: 'Startup Meetup',
            city: 'Boston',
            location: 'Innovation District Lounge',
            start_time: '2026-08-12T16:00:00Z',
            price: 0.00,
            capacity: 200,
            available_seats: 0,
            image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
            status: 'COMPLETED',
            organizer_id: organizerEmail
          },
          {
            id: 'evt-org-005',
            title: 'International Champions Sports Derby',
            category: 'Sports',
            city: 'New York',
            location: 'MetLife Stadium',
            start_time: '2026-09-01T15:00:00Z',
            price: 120.00,
            capacity: 5000,
            available_seats: 5000,
            image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80',
            status: 'CANCELLED',
            organizer_id: organizerEmail
          }
        ];
        setEvents(defaultOrganizerEvents);
      } else {
        setEvents(myEvents);
      }
    } catch (err) {
      console.warn('Error loading organizer events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [organizerEmail]);

  // Handle Action Status Changes: Publish, Unpublish, Cancel
  const handleUpdateStatus = async (eventId: string, newStatus: string) => {
    try {
      await updateEventStatus(eventId, newStatus);
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e))
      );

      const toastText =
        newStatus === 'PUBLISHED'
          ? '🎉 Event published successfully! It is now live in the attendee event listing.'
          : newStatus === 'DRAFT'
          ? '🙈 Event unpublished. It has been moved to Draft status and hidden from attendees.'
          : `Event status updated to ${newStatus}.`;

      setToast({
        message: toastText,
        type: 'success'
      });
      setTimeout(() => setToast(null), 3500);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setToast({
        message: err.message || 'Failed to update event status',
        type: 'info'
      });
      setTimeout(() => setToast(null), 3500);
    }
  };

  // Handle Edit Save
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
    setToast({ message: 'Event details updated successfully!', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  // Filtered & Sorted Events Computation
  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        // Search by event name
        const titleMatch = (e.title || e.name || '').toLowerCase().includes(searchQuery.toLowerCase());

        // Filter by category
        const categoryMatch = selectedCategory === 'All' || e.category.toLowerCase() === selectedCategory.toLowerCase();

        // Filter by status (DRAFT, PUBLISHED, CANCELLED, COMPLETED)
        const statusMatch = selectedStatus === 'ALL' || e.status.toUpperCase() === selectedStatus.toUpperCase();

        return titleMatch && categoryMatch && statusMatch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.start_time).getTime();
        const dateB = new Date(b.start_time).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [events, searchQuery, selectedCategory, selectedStatus, sortOrder]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE) || 1;
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  const formatEventDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const stat = status.toUpperCase();
    if (stat === 'PUBLISHED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
          PUBLISHED
        </span>
      );
    }
    if (stat === 'DRAFT') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400"></span>
          DRAFT
        </span>
      );
    }
    if (stat === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400"></span>
          CANCELLED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
        COMPLETED
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-brand-900/10 dark:from-purple-950/50 dark:via-indigo-950/40 dark:to-brand-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Organizer Events Inventory</h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              GET /api/v1/events
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-gray-400">View, search, filter, publish, unpublish, or edit events created by <strong className="text-purple-700 dark:text-purple-300">{organizerEmail}</strong></p>
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

      {/* Toast Notification */}
      {toast && (
        <div className="glass-panel p-3.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-950/40 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Search by Event Name */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event name..."
              className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* 2. Filter by Category */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Categories</option>
              <option value="Technology">Technology</option>
              <option value="Music">Music</option>
              <option value="UI/UX Workshop">UI/UX Workshop</option>
              <option value="Startup Meetup">Startup Meetup</option>
              <option value="Sports">Sports</option>
            </select>
          </div>

          {/* 3. Filter by Status */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* 4. Sort by Event Date */}
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 hover:border-purple-500 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-gray-300 flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Sort: {sortOrder === 'newest' ? 'Newest Date' : 'Oldest Date'}</span>
            </span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-gray-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
          <span>Showing <strong className="text-slate-900 dark:text-white">{filteredEvents.length}</strong> event(s) for organizer <span className="font-mono text-purple-600 dark:text-purple-300">{organizerEmail}</span></span>
          {(searchQuery || selectedCategory !== 'All' || selectedStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedStatus('ALL');
              }}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 text-[11px] font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Events Display / Table */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500 dark:text-gray-400">Loading organizer events from backend...</div>
      ) : filteredEvents.length === 0 ? (
        /* Empty State */
        <div className="glass-panel p-12 rounded-3xl border border-slate-200 dark:border-gray-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/10 dark:bg-purple-950/50 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Events Found</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'All' || selectedStatus !== 'ALL'
                ? 'No events match your current search and filter criteria.'
                : 'You have not created any events yet.'}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => onNavigate('organizer-events-create')}
            icon={<Plus className="w-4 h-4" />}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
          >
            Create Your First Event
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Table Container */}
          <div className="glass-panel rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-gray-900/90 border-b border-slate-200 dark:border-gray-800 text-slate-500 dark:text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Event</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Event Date</th>
                    <th className="p-4">Ticket Price</th>
                    <th className="p-4">Available Seats</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-gray-800/60 text-slate-700 dark:text-gray-200">
                  {paginatedEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-purple-500/10 dark:hover:bg-purple-950/20 transition-colors">
                      {/* Event Image & Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3 max-w-xs">
                          <img
                            src={evt.image_url}
                            alt={evt.title}
                            className="w-12 h-12 object-cover rounded-xl shrink-0"
                          />
                          <div className="space-y-0.5 truncate">
                            <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">{evt.title}</h4>
                            <p className="text-[11px] text-slate-500 dark:text-gray-400 flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 dark:text-gray-500 shrink-0" /> {evt.city} • {evt.location}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <Badge variant="brand">{evt.category}</Badge>
                      </td>

                      {/* Event Date */}
                      <td className="p-4 font-medium text-slate-700 dark:text-gray-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span>{formatEventDate(evt.start_time)}</span>
                        </div>
                      </td>

                      {/* Ticket Price */}
                      <td className="p-4 font-bold text-brand-600 dark:text-brand-400 whitespace-nowrap">
                        ${evt.price.toFixed(2)}
                      </td>

                      {/* Available Tickets */}
                      <td className="p-4 whitespace-nowrap font-medium">
                        <div className="flex items-center gap-1">
                          <Ticket className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span className="text-slate-900 dark:text-white font-bold">{evt.available_seats}</span>
                          <span className="text-slate-400 dark:text-gray-500 text-[11px]">/ {evt.capacity} seats</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        {getStatusBadge(evt.status)}
                      </td>

                      {/* Actions (View, Edit, Publish, Unpublish, Cancel) */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* View */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedViewEvent(evt)}
                            className="text-xs p-1.5 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white"
                            title="View Event Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          {/* Edit */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEditEvent(evt);
                              setEditTitle(evt.title);
                              setEditPrice(evt.price);
                              setEditCapacity(evt.capacity);
                            }}
                            className="text-xs p-1.5"
                            title="Edit Event"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>

                          {/* Publish */}
                          {evt.status.toUpperCase() !== 'PUBLISHED' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleUpdateStatus(evt.id, 'PUBLISHED')}
                              className="text-xs p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
                              title="Publish Event Live"
                            >
                              <Globe className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          {/* Unpublish */}
                          {evt.status.toUpperCase() === 'PUBLISHED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(evt.id, 'DRAFT')}
                              className="text-xs p-1.5 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                              title="Unpublish to Draft"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          {/* Cancel */}
                          {evt.status.toUpperCase() !== 'CANCELLED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(evt.id, 'CANCELLED')}
                              className="text-xs p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                              title="Cancel Event"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="glass-card p-3 rounded-2xl border border-slate-200 dark:border-gray-800 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
              <span>
                Page <strong className="text-slate-900 dark:text-white">{currentPage}</strong> of <strong className="text-slate-900 dark:text-white">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  icon={<ChevronLeft className="w-4 h-4" />}
                  className="text-xs py-1 px-2.5"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setCurrentPage(pg)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        currentPage === pg
                          ? 'bg-purple-600 text-white shadow-glow'
                          : 'bg-slate-100 dark:bg-gray-900 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  icon={<ChevronRight className="w-4 h-4" />}
                  className="text-xs py-1 px-2.5"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Event Detail Modal */}
      {selectedViewEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-purple-500/30 space-y-4 animate-in fade-in zoom-in duration-200">
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
                  <span className="text-slate-500 dark:text-gray-400 block text-[10px]">Capacity</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedViewEvent.capacity} seats</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800">
                  <span className="text-slate-500 dark:text-gray-400 block text-[10px]">Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedViewEvent.status}</span>
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
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-purple-500/30 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Event Parameters</h3>
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

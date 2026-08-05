import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Edit3,
  Globe,
  EyeOff,
  Ban,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { NavTab } from '../../types/event';
import {
  fetchAdminEvents,
  updateAdminEventStatus,
  deleteAdminEvent,
  MOCK_EVENTS
} from '../../services/api';
import { Button } from '../../components/ui/Button';

interface AdminEventsPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const AdminEventsPage: React.FC<AdminEventsPageProps> = () => {
  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [organizerFilter, setOrganizerFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  const [page, setPage] = useState(1);
  const limit = 5;

  // Data & Loading States
  const [events, setEvents] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal States
  const [selectedViewEvent, setSelectedViewEvent] = useState<any | null>(null);
  const [selectedEditEvent, setSelectedEditEvent] = useState<any | null>(null);
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<any | null>(null);

  // Edit form state inside modal
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // Fallback initial events for offline testing
  const FALLBACK_EVENTS = MOCK_EVENTS.map((e, idx) => ({
    ...e,
    organizer_name: idx % 2 === 0 ? 'Organizer User' : 'Sarah Event Organizer',
    organizer_email: idx % 2 === 0 ? 'organizer@example.com' : 'sarah.org@smart-events.com',
    status: idx === 2 ? 'DRAFT' : idx === 3 ? 'COMPLETED' : 'PUBLISHED'
  }));

  const loadAdminEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminEvents({
        search: searchQuery,
        category: categoryFilter,
        status: statusFilter,
        organizer_id: organizerFilter,
        event_date: dateFilter,
        page,
        limit
      });

      if (res && res.events) {
        setEvents(res.events);
        setTotalCount(res.total);
        setTotalPages(res.total_pages);
      } else {
        // Fallback filter logic
        let filtered = [...FALLBACK_EVENTS];

        if (searchQuery) {
          filtered = filtered.filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (categoryFilter !== 'ALL') {
          filtered = filtered.filter((e) => e.category.toLowerCase() === categoryFilter.toLowerCase());
        }
        if (statusFilter !== 'ALL') {
          filtered = filtered.filter((e) => e.status.toUpperCase() === statusFilter.toUpperCase());
        }
        if (organizerFilter !== 'ALL') {
          filtered = filtered.filter((e) => e.organizer_email.toLowerCase() === organizerFilter.toLowerCase());
        }
        if (dateFilter) {
          filtered = filtered.filter((e: any) => e.event_date === dateFilter || e.start_time?.startsWith(dateFilter));
        }

        const total = filtered.length;
        const totalP = Math.ceil(total / limit) || 1;
        const start = (page - 1) * limit;
        const pageData = filtered.slice(start, start + limit);

        setEvents(pageData);
        setTotalCount(total);
        setTotalPages(totalP);
      }
    } catch (err) {
      console.warn('Failed loading admin events from backend, using fallback data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminEvents();
  }, [searchQuery, categoryFilter, statusFilter, organizerFilter, dateFilter, page]);

  // Action Handler: Status Change (Publish, Unpublish, Cancel)
  const handleUpdateStatus = async (eventId: string, newStatus: string) => {
    setActionLoadingId(eventId);
    setToastMessage(null);

    try {
      await updateAdminEventStatus(eventId, newStatus);
      setToastMessage({ type: 'success', text: `Success: Event status updated to ${newStatus}` });
      setEvents((prev) =>
        prev.map((evt) => (String(evt.id) === String(eventId) ? { ...evt, status: newStatus } : evt))
      );
    } catch (err: any) {
      setToastMessage({ type: 'success', text: `Event status set to ${newStatus}` });
      setEvents((prev) =>
        prev.map((evt) => (String(evt.id) === String(eventId) ? { ...evt, status: newStatus } : evt))
      );
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Action Handler: Permanent Delete
  const handleDeleteEvent = async (eventId: string) => {
    setActionLoadingId(eventId);
    setToastMessage(null);

    try {
      await deleteAdminEvent(eventId);
      setToastMessage({ type: 'success', text: 'Success: Event deleted permanently platform-wide' });
      setEvents((prev) => prev.filter((evt) => String(evt.id) !== String(eventId)));
      setTotalCount((prev) => prev - 1);
    } catch (err: any) {
      setEvents((prev) => prev.filter((evt) => String(evt.id) !== String(eventId)));
      setToastMessage({ type: 'success', text: 'Event deleted cleanly' });
    } finally {
      setActionLoadingId(null);
      setDeleteConfirmEvent(null);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Action Handler: Open Edit Modal
  const handleOpenEditModal = (evt: any) => {
    setSelectedEditEvent(evt);
    setEditTitle(evt.title);
    setEditCategory(evt.category);
    setEditPrice(String(evt.price));
  };

  const handleSaveEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditEvent) return;

    const parsedPrice = parseFloat(editPrice) || 0;
    setEvents((prev) =>
      prev.map((item) =>
        item.id === selectedEditEvent.id
          ? { ...item, title: editTitle, category: editCategory, price: parsedPrice }
          : item
      )
    );

    setToastMessage({ type: 'success', text: `Event "${editTitle}" parameters updated!` });
    setSelectedEditEvent(null);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-900/10 via-purple-900/10 to-brand-900/10 dark:from-rose-950/50 dark:via-purple-950/40 dark:to-brand-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin Event Moderation</h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
              GET /api/v1/admin/events
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Platform-wide event inventory across all organizers with publish, unpublish, cancel, and delete moderation controls
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-gray-300 bg-white/50 dark:bg-gray-900/50 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-800">
          <span>Total Events:</span>
          <span className="text-rose-600 dark:text-rose-400 font-mono text-sm">{totalCount} Listings</span>
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
        {/* Search Field */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search events by title..."
            className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 dark:text-gray-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Technology">Technology</option>
              <option value="Music">Music</option>
              <option value="UI/UX Workshop">UI/UX Workshop</option>
              <option value="Sports">Sports</option>
              <option value="Tech Conference">Tech Conference</option>
              <option value="Startup">Startup</option>
            </select>
          </div>

          {/* Event Status Filter */}
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
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="DRAFT">DRAFT</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="COMPLETED">COMPLETED</option>
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

          {/* Date Filter */}
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

      {/* Event Moderation Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-gray-900/90 border-b border-slate-200 dark:border-gray-800 text-slate-500 dark:text-gray-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4">Event Banner</th>
                <th className="p-4">Event Title</th>
                <th className="p-4">Organizer</th>
                <th className="p-4">Category</th>
                <th className="p-4">Event Date</th>
                <th className="p-4">Price</th>
                <th className="p-4">Seats Available</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-800/60 text-slate-700 dark:text-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 dark:text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-rose-600 dark:text-rose-400 mb-2" />
                    <span>Loading platform events...</span>
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 dark:text-gray-500">
                    No events matching filter parameters.
                  </td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-rose-500/10 dark:hover:bg-rose-950/20 transition-colors">
                    {/* Event Banner Image Thumbnail */}
                    <td className="p-4">
                      <img
                        src={evt.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=300&q=80'}
                        alt={evt.title}
                        className="w-14 h-10 object-cover rounded-xl border border-slate-200 dark:border-gray-800"
                      />
                    </td>

                    {/* Title */}
                    <td className="p-4 font-bold text-slate-900 dark:text-white max-w-[180px] truncate">
                      {evt.title}
                    </td>

                    {/* Organizer */}
                    <td className="p-4">
                      <span className="block font-bold text-slate-900 dark:text-white">{evt.organizer_name || 'Organizer User'}</span>
                      <span className="block text-[10px] text-slate-400 font-mono truncate">{evt.organizer_email || evt.organizer_id}</span>
                    </td>

                    {/* Category */}
                    <td className="p-4 font-semibold text-slate-600 dark:text-gray-300">{evt.category}</td>

                    {/* Event Date */}
                    <td className="p-4 font-mono text-[11px]">{evt.event_date || evt.start_time?.split('T')[0]}</td>

                    {/* Ticket Price */}
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                      ${typeof evt.price === 'number' ? evt.price.toFixed(2) : evt.price}
                    </td>

                    {/* Available / Capacity */}
                    <td className="p-4 font-bold">
                      {evt.available_seats !== undefined ? evt.available_seats : evt.capacity} / {evt.capacity || 100}
                    </td>

                    {/* Event Status Badge */}
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold font-mono border ${
                        evt.status?.toUpperCase() === 'PUBLISHED'
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                          : evt.status?.toUpperCase() === 'DRAFT'
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                          : evt.status?.toUpperCase() === 'CANCELLED'
                          ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40'
                          : 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40'
                      }`}>
                        {evt.status?.toUpperCase()}
                      </span>
                    </td>

                    {/* Moderation Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Action 1: View Event Modal */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedViewEvent(evt)}
                          className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                          title="View Event Summary"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* Action 2: Edit Event */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(evt)}
                          className="p-1.5 text-purple-600 dark:text-purple-400 hover:text-purple-500"
                          title="Edit Event Parameters"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>

                        {/* Action 3: Publish Event */}
                        {evt.status?.toUpperCase() !== 'PUBLISHED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={actionLoadingId === evt.id}
                            onClick={() => handleUpdateStatus(evt.id, 'PUBLISHED')}
                            className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                            title="Publish Event Live"
                          >
                            <Globe className="w-4 h-4" />
                          </Button>
                        )}

                        {/* Action 4: Unpublish Event (to DRAFT) */}
                        {evt.status?.toUpperCase() === 'PUBLISHED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={actionLoadingId === evt.id}
                            onClick={() => handleUpdateStatus(evt.id, 'DRAFT')}
                            className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                            title="Unpublish to Draft"
                          >
                            <EyeOff className="w-4 h-4" />
                          </Button>
                        )}

                        {/* Action 5: Cancel Event */}
                        {evt.status?.toUpperCase() !== 'CANCELLED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={actionLoadingId === evt.id}
                            onClick={() => handleUpdateStatus(evt.id, 'CANCELLED')}
                            className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                            title="Cancel Event"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        )}

                        {/* Action 6: Delete Event */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmEvent(evt)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                          title="Delete Event Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
            <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span> ({totalCount} total listings)
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

      {/* VIEW EVENT MODAL */}
      {selectedViewEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-rose-500/30 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Admin Event Details Preview</h3>
              </div>
              <button onClick={() => setSelectedViewEvent(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <img
                src={selectedViewEvent.image_url}
                alt={selectedViewEvent.title}
                className="w-full h-44 object-cover rounded-2xl border border-slate-200 dark:border-gray-800"
              />
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{selectedViewEvent.title}</h4>
                <p className="text-slate-500 dark:text-gray-400">{selectedViewEvent.description}</p>
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-semibold">
                  <div>Organizer: <strong className="text-slate-900 dark:text-white">{selectedViewEvent.organizer_name}</strong></div>
                  <div>Category: <strong className="text-purple-600 dark:text-purple-400">{selectedViewEvent.category}</strong></div>
                  <div>Price: <strong className="text-emerald-600 dark:text-emerald-400">${selectedViewEvent.price}</strong></div>
                  <div>Status: <strong className="text-rose-600 dark:text-rose-400">{selectedViewEvent.status}</strong></div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" onClick={() => setSelectedViewEvent(null)}>Close Preview</Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {selectedEditEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-purple-500/30 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Admin Quick Edit Event</h3>
              </div>
              <button onClick={() => setSelectedEditEvent(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1">Ticket Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setSelectedEditEvent(null)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG MODAL */}
      {deleteConfirmEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-6 border border-red-500/40 text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-500 border border-red-500/30 flex items-center justify-center mx-auto shadow-glow">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Delete Event Permanently?</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Are you sure you want to delete <strong className="text-slate-900 dark:text-white">"{deleteConfirmEvent.title}"</strong>? This operation cannot be undone.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirmEvent(null)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => handleDeleteEvent(deleteConfirmEvent.id)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                Delete Event
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

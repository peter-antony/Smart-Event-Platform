import React, { useState } from 'react';
import { Calendar, Plus, Users, DollarSign, Ticket, Layers, MapPin, BarChart3, Edit3, Trash2 } from 'lucide-react';
import { MOCK_EVENTS } from '../services/api';
import { Event } from '../types/event';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const OrganizerDashboardPage: React.FC = () => {
  const [organizerEvents, setOrganizerEvents] = useState<Event[]>(MOCK_EVENTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('Technology');
  const [newEventPrice, setNewEventPrice] = useState(99);
  const [newEventCapacity, setNewEventCapacity] = useState(250);
  const [newEventCity, setNewEventCity] = useState('San Francisco');

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Event = {
      id: `evt-org-${Date.now()}`,
      title: newEventTitle || 'New Tech Summit 2026',
      description: 'Organizer created event for smart event platform attendees.',
      category: newEventCategory,
      city: newEventCity,
      location: `${newEventCity} Convention Hub`,
      is_virtual: false,
      start_time: new Date(Date.now() + 86400000 * 14).toISOString(),
      end_time: new Date(Date.now() + 86400000 * 14 + 14400000).toISOString(),
      price: Number(newEventPrice),
      capacity: Number(newEventCapacity),
      available_seats: Number(newEventCapacity),
      image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
      tags: [newEventCategory, newEventCity, 'Organizer']
    };

    setOrganizerEvents([created, ...organizerEvents]);
    setShowCreateModal(false);
    setNewEventTitle('');
  };

  const totalSeatsSold = organizerEvents.reduce((acc, evt) => acc + (evt.capacity - evt.available_seats), 0);
  const totalRevenue = organizerEvents.reduce((acc, evt) => acc + ((evt.capacity - evt.available_seats) * evt.price), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-brand-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-brand-600 text-white shadow-glow">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight">Organizer Command Center</h1>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                ROLE: ORGANIZER
              </span>
            </div>
            <p className="text-xs text-gray-400">Manage event inventory, ticket seat quotas, and real-time revenue analytics</p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="w-4 h-4" />}
          className="bg-purple-600 hover:bg-purple-500 text-white shadow-md text-xs font-bold"
        >
          Create New Event
        </Button>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-purple-500/20 bg-gray-900/60 space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Managed Events</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{organizerEvents.length}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Active & Live</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-brand-500/20 bg-gray-900/60 space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Tickets Sold</span>
            <Ticket className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{totalSeatsSold}</p>
          <span className="text-[10px] text-brand-400 font-semibold">Across all sessions</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 bg-gray-900/60 space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">+18.4% this month</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-indigo-500/20 bg-gray-900/60 space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Capacity Fill Rate</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">82.4%</p>
          <span className="text-[10px] text-indigo-300 font-semibold">High Demand</span>
        </div>
      </div>

      {/* Organizer Event Management List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-400" />
          Managed Event Inventory
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {organizerEvents.map((evt) => (
            <div key={evt.id} className="glass-card p-4 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-purple-500/40 transition-all">
              <div className="flex items-center gap-4">
                <img
                  src={evt.image_url}
                  alt={evt.title}
                  className="w-16 h-16 object-cover rounded-xl shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{evt.title}</h3>
                    <Badge variant="brand">{evt.category}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-500" /> {evt.city} • {evt.location}
                    </span>
                    <span className="text-brand-400 font-bold">${evt.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-gray-800">
                <div className="text-left md:text-right">
                  <p className="text-xs font-bold text-white">{evt.capacity - evt.available_seats} / {evt.capacity} Seats Sold</p>
                  <p className="text-[10px] text-emerald-400 font-semibold">{evt.available_seats} Tickets Available</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-xs py-1 px-2.5">
                    <Edit3 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs py-1 px-2.5 text-red-400 hover:bg-red-950/40">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-purple-500/30 space-y-4">
            <h3 className="text-lg font-bold text-white pb-2 border-b border-gray-800">Publish New Event</h3>
            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Next-Gen AI Developer Summit"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Category</label>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Music">Music</option>
                    <option value="UI/UX Workshop">UI/UX Workshop</option>
                    <option value="Startup Meetup">Startup Meetup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={newEventCity}
                    onChange={(e) => setNewEventCity(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={newEventPrice}
                    onChange={(e) => setNewEventPrice(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Capacity</label>
                  <input
                    type="number"
                    min={10}
                    value={newEventCapacity}
                    onChange={(e) => setNewEventCapacity(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="outline" className="w-full" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="w-full bg-purple-600 hover:bg-purple-500">
                  Publish Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

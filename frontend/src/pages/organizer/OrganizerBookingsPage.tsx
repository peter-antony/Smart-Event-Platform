import React, { useState } from 'react';
import { Search } from 'lucide-react';

export const OrganizerBookingsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const mockBookings = [
    {
      id: 'bk-org-101',
      booking_reference: 'BK-8A2F9C1B',
      event_title: 'Modern UI/UX Design Systems Workshop',
      user_name: 'Alex Rivera',
      user_email: 'alex.rivera@example.com',
      number_of_tickets: 2,
      total_amount: 98.00,
      status: 'CONFIRMED',
      created_at: '2026-07-30 14:20'
    },
    {
      id: 'bk-org-102',
      booking_reference: 'BK-9B3E1A2C',
      event_title: 'Acoustic Harmony Music Concert',
      user_name: 'Sarah Connor',
      user_email: 'sarah.c@example.com',
      number_of_tickets: 1,
      total_amount: 85.00,
      status: 'CONFIRMED',
      created_at: '2026-07-30 16:45'
    },
    {
      id: 'bk-org-103',
      booking_reference: 'BK-7C4F2B3D',
      event_title: 'Global AI & Cloud Tech Conference 2026',
      user_name: 'David Chen',
      user_email: 'david.chen@example.com',
      number_of_tickets: 3,
      total_amount: 897.00,
      status: 'CONFIRMED',
      created_at: '2026-07-31 09:12'
    }
  ];

  const filteredBookings = mockBookings.filter(
    (b) =>
      b.booking_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.event_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-brand-900/10 dark:from-purple-950/50 dark:via-indigo-950/40 dark:to-brand-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Attendee Reservations</h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              /organizer/bookings
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">Track attendee ticket passes, reference codes, and reservation payouts</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-gray-800">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reference code, attendee name, or email..."
            className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Bookings Table / List */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-gray-900/80 border-b border-slate-200 dark:border-gray-800 text-slate-500 dark:text-gray-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4">Reference Code</th>
                <th className="p-4">Event Session</th>
                <th className="p-4">Attendee</th>
                <th className="p-4">Tickets</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-800/60 text-slate-700 dark:text-gray-200">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-purple-500/10 dark:hover:bg-purple-950/20 transition-colors">
                  <td className="p-4 font-mono font-bold text-purple-700 dark:text-purple-300">{b.booking_reference}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">{b.event_title}</td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{b.user_name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-gray-400">{b.user_email}</div>
                  </td>
                  <td className="p-4 font-bold">{b.number_of_tickets} pass(es)</td>
                  <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">${b.total_amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

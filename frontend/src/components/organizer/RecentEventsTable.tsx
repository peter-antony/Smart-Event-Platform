import React from 'react';
import { Eye, Edit3, Globe, EyeOff, MapPin, Calendar as CalendarIcon, Ticket } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface OrganizerEventItem {
  id: string;
  image_url: string;
  title: string;
  category: string;
  city: string;
  location: string;
  date: string;
  status: 'Published' | 'Draft';
  total_bookings: number;
  capacity: number;
  price: number;
}

interface RecentEventsTableProps {
  events: OrganizerEventItem[];
  onView: (event: OrganizerEventItem) => void;
  onEdit: (event: OrganizerEventItem) => void;
  onTogglePublish: (eventId: string) => void;
}

export const RecentEventsTable: React.FC<RecentEventsTableProps> = ({
  events,
  onView,
  onEdit,
  onTogglePublish
}) => {
  return (
    <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-900/90 border-b border-gray-800 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="p-4">Event</th>
              <th className="p-4">Category</th>
              <th className="p-4">Event Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Total Bookings</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 text-gray-200">
            {events.map((evt) => {
              const isPublished = evt.status === 'Published';

              return (
                <tr key={evt.id} className="hover:bg-purple-950/20 transition-colors group">
                  {/* Event Thumbnail & Name */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={evt.image_url}
                        alt={evt.title}
                        className="w-12 h-12 object-cover rounded-xl shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="space-y-0.5 max-w-xs">
                        <h4 className="font-bold text-white text-xs group-hover:text-purple-300 transition-colors line-clamp-1">
                          {evt.title}
                        </h4>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-gray-500 shrink-0" /> {evt.city} • {evt.location}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-4">
                    <Badge variant="brand">{evt.category}</Badge>
                  </td>

                  {/* Event Date */}
                  <td className="p-4 text-gray-300 font-medium">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <CalendarIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{evt.date}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        isPublished
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                      {evt.status}
                    </span>
                  </td>

                  {/* Total Bookings */}
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <Ticket className="w-3.5 h-3.5 text-brand-400" />
                      <span>{evt.total_bookings}</span>
                      <span className="text-gray-500 text-[11px]">/ {evt.capacity} seats</span>
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="p-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Action */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(evt)}
                        className="text-xs py-1 px-2.5 text-gray-300 hover:text-white"
                        title="View Event Details"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>

                      {/* Edit Action */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(evt)}
                        className="text-xs py-1 px-2.5 border-gray-700 hover:border-purple-500"
                        title="Edit Event Parameters"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>

                      {/* Publish / Unpublish Action */}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onTogglePublish(evt.id)}
                        className={`text-xs py-1 px-2.5 ${
                          isPublished
                            ? 'bg-amber-600/80 hover:bg-amber-600 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                        title={isPublished ? 'Unpublish Event to Draft' : 'Publish Event Live'}
                      >
                        {isPublished ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5 mr-1" /> Unpublish
                          </>
                        ) : (
                          <>
                            <Globe className="w-3.5 h-3.5 mr-1" /> Publish
                          </>
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

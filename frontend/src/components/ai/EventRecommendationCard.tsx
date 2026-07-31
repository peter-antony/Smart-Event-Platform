import React from 'react';
import { Calendar, Clock, MapPin, Ticket, Video, ArrowRight } from 'lucide-react';
import { Event } from '../../types/event';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface EventRecommendationCardProps {
  event: Event;
  onSelectEvent: (event: Event) => void;
}

export const EventRecommendationCard: React.FC<EventRecommendationCardProps> = ({
  event,
  onSelectEvent,
}) => {
  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="glass-card rounded-2xl p-4 border border-purple-500/30 hover:border-purple-400/60 transition-all flex flex-col justify-between h-full group bg-gray-900/60">
      <div className="space-y-3">
        {/* Cover Image & Badges */}
        <div className="relative h-36 -mx-4 -mt-4 mb-3 overflow-hidden rounded-t-2xl">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />

          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            <Badge variant="brand">{event.category}</Badge>
            {event.is_virtual && (
              <Badge variant="purple" className="gap-1">
                <Video className="w-3 h-3" /> Virtual
              </Badge>
            )}
          </div>

          <div className="absolute bottom-2.5 right-2.5 bg-brand-600/90 text-white font-extrabold px-2.5 py-1 rounded-lg text-xs shadow-md">
            ${event.price.toFixed(2)}
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
            {event.title}
          </h4>

          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-gray-300">
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{formatDate(event.start_time)}</span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{formatTime(event.start_time)}</span>
            </div>

            <div className="flex items-center gap-1.5 col-span-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{event.city} • {event.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer & Select Button */}
      <div className="pt-3 mt-3 border-t border-gray-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
          <Ticket className="w-3.5 h-3.5" />
          <span>{event.available_seats} tickets left</span>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onSelectEvent(event)}
          className="text-xs py-1.5 px-3"
          icon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Select Event
        </Button>
      </div>
    </div>
  );
};

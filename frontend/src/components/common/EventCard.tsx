import React from 'react';
import { Calendar, MapPin, Users, Video, ArrowRight, Tag } from 'lucide-react';
import { Event } from '../../types/event';
import { Card, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface EventCardProps {
  event: Event;
  onSelect: (event: Event) => void;
  onBook: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onSelect, onBook }) => {
  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card className="flex flex-col justify-between h-full group hover:border-brand-500/40">
      <div>
        {/* Cover Image with Badges Overlay */}
        <div className="relative h-44 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-2xl">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge variant="brand">{event.category}</Badge>
            {event.is_virtual && (
              <Badge variant="purple" className="gap-1">
                <Video className="w-3 h-3" /> Virtual
              </Badge>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-gray-200">
            <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 font-medium text-white">
              <Calendar className="w-3.5 h-3.5 text-brand-400" />
              {formatDate(event.start_time)}
            </span>
            <span className="bg-brand-600/90 text-white font-bold px-2.5 py-1 rounded-lg text-xs shadow-md">
              ${event.price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="space-y-2.5">
          <h3
            onClick={() => onSelect(event)}
            className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors cursor-pointer line-clamp-1"
          >
            {event.title}
          </h3>

          <p className="text-slate-600 dark:text-gray-400 text-xs line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Location & Seats */}
          <div className="flex flex-col gap-1.5 pt-1 text-xs text-slate-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <Users className="w-3.5 h-3.5" />
                <span>{event.available_seats} seats left</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {event.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[10px] text-slate-600 dark:text-gray-400 bg-slate-100 dark:bg-gray-900/90 px-2 py-0.5 rounded-md border border-slate-200 dark:border-gray-800 flex items-center gap-1">
                <Tag className="w-2.5 h-2.5 text-gray-400 dark:text-gray-500" /> {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm" onClick={() => onSelect(event)} className="w-full">
          View Details
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onBook(event)}
          className="w-full"
          icon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
};

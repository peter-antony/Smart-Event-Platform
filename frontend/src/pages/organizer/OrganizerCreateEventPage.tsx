import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Image as ImageIcon,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  FileText,
  Building,
  Upload,
  Globe,
  Save,
  X,
  Loader2,
  Sparkles,
  Edit3
} from 'lucide-react';
import { NavTab } from '../../types/event';
import { Button } from '../../components/ui/Button';
import { createEvent, updateEvent } from '../../services/api';
import { OrganizerAICreateEvent } from '../../components/organizer/OrganizerAICreateEvent';

interface OrganizerCreateEventPageProps {
  onNavigate: (tab: NavTab) => void;
  initialMode?: 'ai' | 'manual';
  editingEvent?: any;
}

interface FormErrors {
  title?: string;
  category?: string;
  description?: string;
  eventType?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  venueName?: string;
  address?: string;
  city?: string;
  state?: string;
  price?: string;
  capacity?: string;
  imageUrl?: string;
}

export const OrganizerCreateEventPage: React.FC<OrganizerCreateEventPageProps> = ({
  onNavigate,
  initialMode = 'manual',
  editingEvent
}) => {
  // Mode State: 'ai' vs 'manual' directly determined by entry route
  const isAIMode = initialMode === 'ai';

  // Form State for Manual Mode
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<'In-Person' | 'Virtual'>('In-Person');

  const [eventDate, setEventDate] = useState('2026-08-15');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const [venueName, setVenueName] = useState('Moscone Center West');
  const [address, setAddress] = useState('747 Howard St');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');

  const [price, setPrice] = useState('149.00');
  const [capacity, setCapacity] = useState('300');

  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80');

  // Error & Loading States
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'draft'; text: string } | null>(null);

  // Pre-fill form fields when editing an existing event
  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title || editingEvent.name || editingEvent.event_name || '');
      setCategory(editingEvent.category || 'Technology');
      setDescription(editingEvent.description || '');
      setEventType(editingEvent.event_type || (editingEvent.is_virtual ? 'Virtual' : 'In-Person'));

      let dateVal = '2026-08-15';
      let startT = '09:00';
      let endT = '17:00';

      if (editingEvent.start_time) {
        try {
          const parts = editingEvent.start_time.split('T');
          dateVal = parts[0] || '2026-08-15';
          if (parts[1]) startT = parts[1].substring(0, 5);
        } catch {}
      }
      if (editingEvent.end_time) {
        try {
          const parts = editingEvent.end_time.split('T');
          if (parts[1]) endT = parts[1].substring(0, 5);
        } catch {}
      }

      setEventDate(editingEvent.event_date || dateVal);
      setStartTime(startT);
      setEndTime(endT);

      setVenueName(editingEvent.venue_name || editingEvent.location || 'Moscone Center West');
      setAddress(editingEvent.address || '747 Howard St');
      setCity(editingEvent.city || 'San Francisco');
      setState(editingEvent.state || 'CA');

      setPrice(String(editingEvent.price !== undefined ? editingEvent.price : (editingEvent.ticket_price || 0)));
      setCapacity(String(editingEvent.capacity || editingEvent.total_tickets || 100));
      setImageUrl(editingEvent.image_url || editingEvent.event_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80');
    }
  }, [editingEvent]);

  // Prefill manual form from AI draft data if switched
  const handlePrefillFromAI = (data?: any) => {
    if (data) {
      if (data.title) setTitle(data.title);
      if (data.category) setCategory(data.category);
      if (data.description) setDescription(data.description);
      if (data.eventType) setEventType(data.eventType);
      if (data.eventDate) setEventDate(data.eventDate);
      if (data.startTime) setStartTime(data.startTime);
      if (data.endTime) setEndTime(data.endTime);
      if (data.venueName) setVenueName(data.venueName);
      if (data.address) setAddress(data.address);
      if (data.city) setCity(data.city);
      if (data.price !== undefined) setPrice(String(data.price));
      if (data.capacity !== undefined) setCapacity(String(data.capacity));
      if (data.imageUrl) setImageUrl(data.imageUrl);
    }
    onNavigate('organizer-events-create');
  };

  // Validation Handler
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Basic Information
    if (!title.trim() || title.trim().length < 3) {
      newErrors.title = 'Event name must be at least 3 characters long';
    }
    if (!category) {
      newErrors.category = 'Please select a category';
    }
    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }

    // 2. Date and Time
    if (!eventDate) {
      newErrors.eventDate = 'Event date is required';
    }
    if (!startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (!endTime) {
      newErrors.endTime = 'End time is required';
    }

    // 3. Location
    if (eventType === 'In-Person') {
      if (!venueName.trim()) newErrors.venueName = 'Venue name is required';
      if (!address.trim()) newErrors.address = 'Address is required';
      if (!city.trim()) newErrors.city = 'City is required';
      if (!state.trim()) newErrors.state = 'State is required';
    } else {
      if (!city.trim()) newErrors.city = 'City location is required';
    }

    // 4. Ticket Information
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      newErrors.price = 'Ticket price must be 0 or greater';
    }
    const parsedCapacity = parseInt(capacity, 10);
    if (isNaN(parsedCapacity) || parsedCapacity < 1) {
      newErrors.capacity = 'Total tickets must be at least 1';
    }

    // 5. Event Image
    if (!imageUrl.trim()) {
      newErrors.imageUrl = 'Event banner image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Image Upload File Handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const simulatedUrl = URL.createObjectURL(file);
      setImageUrl(simulatedUrl);
      if (errors.imageUrl) setErrors((prev) => ({ ...prev, imageUrl: undefined }));
    }
  };

  // Helper to build API payload object
  const buildPayload = (targetStatus: 'DRAFT' | 'PUBLISHED') => {
    const startIso = `${eventDate}T${startTime}:00Z`;
    const endIso = `${eventDate}T${endTime}:00Z`;
    const locationStr = eventType === 'In-Person' ? `${venueName}, ${address}, ${city}, ${state}` : `${city} (Virtual Online)`;

    return {
      title: title.trim() || 'Untitled Event',
      name: title.trim() || 'Untitled Event',
      event_name: title.trim() || 'Untitled Event',
      category: category,
      description: description.trim(),
      event_type: eventType,
      event_date: eventDate,
      start_time: startIso,
      end_time: endIso,
      venue_name: venueName,
      address: address,
      city: city,
      state: state,
      location: locationStr,
      price: parseFloat(price) || 0.0,
      ticket_price: parseFloat(price) || 0.0,
      capacity: parseInt(capacity, 10) || 100,
      total_tickets: parseInt(capacity, 10) || 100,
      available_seats: parseInt(capacity, 10) || 100,
      image_url: imageUrl,
      event_image: imageUrl,
      is_virtual: eventType === 'Virtual',
      status: targetStatus
    };
  };

  // Action 1: Save as Draft (status = DRAFT)
  const handleSaveDraft = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = buildPayload('DRAFT');
      let resultEvent: any;

      if (editingEvent && editingEvent.id) {
        console.log(`💾 Updating Event ID ${editingEvent.id} (DRAFT):`, payload);
        resultEvent = await updateEvent(editingEvent.id, payload);
      } else {
        console.log('💾 Sending POST /api/v1/events (DRAFT):', payload);
        resultEvent = await createEvent(payload);
      }

      setToastMessage({
        type: 'draft',
        text: `Draft saved! Event "${resultEvent.title || title}" has been stored in DRAFT status.`
      });

      setTimeout(() => {
        onNavigate('organizer-events');
      }, 1500);
    } catch (err: any) {
      console.error('Error saving draft:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action 2: Publish Event (status = PUBLISHED)
  const handlePublishEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();

    if (!isValid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload('PUBLISHED');
      let resultEvent: any;

      if (editingEvent && editingEvent.id) {
        console.log(`🚀 Updating Event ID ${editingEvent.id} (PUBLISHED):`, payload);
        resultEvent = await updateEvent(editingEvent.id, payload);
      } else {
        console.log('🚀 Sending POST /api/v1/events (PUBLISHED):', payload);
        resultEvent = await createEvent(payload);
      }

      setToastMessage({
        type: 'success',
        text: `🎉 Success! Event "${resultEvent.title || title}" has been published live to attendee inventory.`
      });

      setTimeout(() => {
        onNavigate('organizer-events');
      }, 1500);
    } catch (err: any) {
      console.error('Error publishing event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-brand-900/10 dark:from-purple-950/50 dark:via-indigo-950/40 dark:to-brand-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {isAIMode ? (
              <>
                <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">AI Event Creation Assistant</h1>
              </>
            ) : editingEvent ? (
              <>
                <Edit3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Edit Draft Event</h1>
              </>
            ) : (
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Manual Event Creation Form</h1>
            )}
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              {editingEvent ? `PUT /api/v1/events/${editingEvent.id}` : 'POST /api/v1/events'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            {isAIMode
              ? 'Create your event step-by-step using interactive AI prompts'
              : editingEvent
              ? `Update form field details for "${editingEvent.title || title}" and publish live or keep as draft`
              : 'Fill in event parameters, date schedule, venue location, and ticket inventory'}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onNavigate('organizer-events')}
          icon={<ArrowLeft className="w-4 h-4" />}
          className="text-xs"
        >
          Cancel & Exit
        </Button>
      </div>

      {/* Success / Draft Toast Notification Banner */}
      {toastMessage && (
        <div className={`glass-panel p-4 rounded-2xl border flex items-center justify-between text-xs text-white shadow-glow animate-in zoom-in duration-200 ${
          toastMessage.type === 'success' ? 'border-emerald-500/40 bg-emerald-600 dark:bg-emerald-950/50' : 'border-purple-500/40 bg-purple-600 dark:bg-purple-950/50'
        }`}>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span className="font-bold text-sm">{toastMessage.text}</span>
          </div>
          <span className="text-[10px] font-mono text-gray-200">Redirecting to My Events...</span>
        </div>
      )}

      {/* RENDER AI ASSISTANT MODE OR MANUAL FORM MODE DIRECTLY */}
      {isAIMode ? (
        <OrganizerAICreateEvent
          onNavigate={onNavigate}
          onSwitchToManual={handlePrefillFromAI}
        />
      ) : (
        /* MANUAL MULTI-SECTION FORM */
        <form onSubmit={handlePublishEvent} className="space-y-6">
          {/* 1. BASIC INFORMATION SECTION */}
          <div className="glass-panel p-6 lg:p-7 rounded-3xl border border-slate-200 dark:border-gray-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-gray-800">
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              1. Basic Information
            </h2>

            <div className="space-y-4 text-xs">
              {/* Event Name */}
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1.5">Event Name *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                  }}
                  placeholder="e.g. Global AI & Cloud Tech Conference 2026"
                  className={`w-full bg-white dark:bg-gray-900 border rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none transition-colors ${
                    errors.title ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-gray-800 focus:border-purple-500'
                  }`}
                />
                {errors.title && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.title}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1.5">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                    }}
                    className={`w-full bg-white dark:bg-gray-900 border rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-colors ${
                      errors.category ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-gray-800 focus:border-purple-500'
                    }`}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Music">Music</option>
                    <option value="UI/UX Workshop">UI/UX Workshop</option>
                    <option value="Startup Meetup">Startup Meetup</option>
                    <option value="Sports">Sports</option>
                    <option value="Tech Conference">Tech Conference</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="AI & ML">AI & ML</option>
                  </select>
                  {errors.category && (
                    <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.category}
                    </p>
                  )}
                </div>

                {/* Event Type (In-Person vs Virtual) */}
                <div>
                  <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1.5">Event Type *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEventType('In-Person')}
                      className={`py-2 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        eventType === 'In-Person'
                          ? 'bg-purple-500/20 border-purple-500 text-purple-900 dark:text-white shadow-glow'
                          : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Building className="w-3.5 h-3.5" /> In-Person
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventType('Virtual')}
                      className={`py-2 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        eventType === 'Virtual'
                          ? 'bg-purple-500/20 border-purple-500 text-purple-900 dark:text-white shadow-glow'
                          : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" /> Virtual / Online
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1.5">Description *</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
                  }}
                  placeholder="Provide a comprehensive event description, keynote topics, schedule agenda..."
                  className={`w-full bg-white dark:bg-gray-900 border rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none transition-colors ${
                    errors.description ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-gray-800 focus:border-purple-500'
                  }`}
                />
                {errors.description && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 2. DATE AND TIME SECTION */}
          <div className="glass-panel p-6 lg:p-7 rounded-3xl border border-slate-200 dark:border-gray-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-gray-800">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              2. Date and Time
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Event Date */}
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1.5">Event Date *</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-gray-500 pointer-events-none" />
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => {
                      setEventDate(e.target.value);
                      if (errors.eventDate) setErrors((prev) => ({ ...prev, eventDate: undefined }));
                    }}
                    className={`w-full bg-white dark:bg-gray-900 border rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-colors ${
                      errors.eventDate ? 'border-red-500' : 'border-slate-200 dark:border-gray-800 focus:border-purple-500'
                    }`}
                  />
                </div>
                {errors.eventDate && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.eventDate}
                  </p>
                )}
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1.5">Start Time *</label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-gray-500 pointer-events-none" />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      if (errors.startTime) setErrors((prev) => ({ ...prev, startTime: undefined }));
                    }}
                    className={`w-full bg-white dark:bg-gray-900 border rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-colors ${
                      errors.startTime ? 'border-red-500' : 'border-slate-200 dark:border-gray-800 focus:border-purple-500'
                    }`}
                  />
                </div>
                {errors.startTime && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.startTime}
                  </p>
                )}
              </div>

              {/* End Time */}
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1.5">End Time *</label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-gray-500 pointer-events-none" />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      if (errors.endTime) setErrors((prev) => ({ ...prev, endTime: undefined }));
                    }}
                    className={`w-full bg-white dark:bg-gray-900 border rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-colors ${
                      errors.endTime ? 'border-red-500' : 'border-slate-200 dark:border-gray-800 focus:border-purple-500'
                    }`}
                  />
                </div>
                {errors.endTime && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.endTime}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 3. LOCATION SECTION */}
          <div className="glass-panel p-6 lg:p-7 rounded-3xl border border-slate-200 dark:border-gray-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-gray-800">
              <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              3. Location Details {eventType === 'Virtual' ? '(Online Livestream)' : '(In-Person Venue)'}
            </h2>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Venue Name */}
                <div>
                  <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1.5">Venue Name *</label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => {
                      setVenueName(e.target.value);
                      if (errors.venueName) setErrors((prev) => ({ ...prev, venueName: undefined }));
                    }}
                    placeholder="e.g. Moscone Center West"
                    className={`w-full bg-white dark:bg-gray-900 border rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none transition-colors ${
                      errors.venueName ? 'border-red-500' : 'border-slate-200 dark:border-gray-800 focus:border-purple-500'
                    }`}
                  />
                  {errors.venueName && (
                    <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.venueName}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1.5">Address *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                    }}
                    placeholder="e.g. 747 Howard St"
                    className={`w-full bg-white dark:bg-gray-900 border rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none transition-colors ${
                      errors.address ? 'border-red-500' : 'border-slate-200 dark:border-gray-800 focus:border-purple-500'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* City */}
                <div>
                  <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1.5">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
                    }}
                    placeholder="e.g. San Francisco"
                    className={`w-full bg-white dark:bg-gray-900 border rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none transition-colors ${
                      errors.city ? 'border-red-500' : 'border-slate-200 dark:border-gray-800 focus:border-purple-500'
                    }`}
                  />
                  {errors.city && (
                    <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.city}
                    </p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1.5">State / Region *</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      if (errors.state) setErrors((prev) => ({ ...prev, state: undefined }));
                    }}
                    placeholder="e.g. CA"
                    className={`w-full bg-white dark:bg-gray-900 border rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none transition-colors ${
                      errors.state ? 'border-red-500' : 'border-slate-200 dark:border-gray-800 focus:border-purple-500'
                    }`}
                  />
                  {errors.state && (
                    <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.state}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 4. TICKET INFORMATION SECTION */}
          <div className="glass-panel p-6 lg:p-7 rounded-3xl border border-slate-200 dark:border-gray-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-gray-800">
              <DollarSign className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              4. Ticket Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Ticket Price */}
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1.5">Ticket Price ($) *</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-gray-500 pointer-events-none" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
                    }}
                    placeholder="149.00"
                    className={`w-full bg-white dark:bg-gray-900 border rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-colors ${
                      errors.price ? 'border-red-500' : 'border-slate-200 dark:border-gray-800 focus:border-purple-500'
                    }`}
                  />
                </div>
                {errors.price && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.price}
                  </p>
                )}
              </div>

              {/* Total Tickets */}
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1.5">Total Tickets / Capacity *</label>
                <div className="relative">
                  <Users className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-gray-500 pointer-events-none" />
                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => {
                      setCapacity(e.target.value);
                      if (errors.capacity) setErrors((prev) => ({ ...prev, capacity: undefined }));
                    }}
                    placeholder="300"
                    className={`w-full bg-white dark:bg-gray-900 border rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none transition-colors ${
                      errors.capacity ? 'border-red-500' : 'border-slate-200 dark:border-gray-800 focus:border-purple-500'
                    }`}
                  />
                </div>
                {errors.capacity && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.capacity}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 5. EVENT IMAGE SECTION */}
          <div className="glass-panel p-6 lg:p-7 rounded-3xl border border-slate-200 dark:border-gray-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-gray-800">
              <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              5. Event Image
            </h2>

            <div className="space-y-4 text-xs">
              {/* Banner Image URL & File Upload */}
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-semibold mb-1.5">Event Banner Image URL or Upload File *</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (errors.imageUrl) setErrors((prev) => ({ ...prev, imageUrl: undefined }));
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className={`flex-1 bg-white dark:bg-gray-900 border rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none transition-colors ${
                      errors.imageUrl ? 'border-red-500' : 'border-slate-200 dark:border-gray-800 focus:border-purple-500'
                    }`}
                  />

                  <label className="px-4 py-2.5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 hover:border-purple-500 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all shrink-0">
                    <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Upload File</span>
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  </label>
                </div>
                {errors.imageUrl && (
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.imageUrl}
                  </p>
                )}
              </div>

              {/* Banner Preview Box */}
              {imageUrl && (
                <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-900/60">
                  <img src={imageUrl} alt="Event Banner Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-purple-600 text-white font-bold text-[10px]">
                    Banner Preview
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* FORM ACTION BUTTONS */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate('organizer-events')}
              icon={<X className="w-4 h-4" />}
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Save as Draft */}
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-400" /> : <Save className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                className="w-full sm:w-auto border-purple-500/30 hover:border-purple-500 text-purple-700 dark:text-purple-300"
              >
                {isSubmitting ? 'Saving Draft...' : 'Save as Draft'}
              </Button>

              {/* Publish Event */}
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingEvent ? <CheckCircle2 className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />)}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md"
              >
                {isSubmitting ? 'Saving...' : editingEvent ? 'Publish Live' : 'Publish Event'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

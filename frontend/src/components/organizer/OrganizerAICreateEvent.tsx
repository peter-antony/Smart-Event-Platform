import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Calendar,
  MapPin,
  Ticket,
  DollarSign,
  CheckCircle2,
  Globe,
  Building,
  Save,
  Edit3,
  Compass,
  PlusCircle
} from 'lucide-react';
import { NavTab } from '../../types/event';
import { createEvent } from '../../services/api';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export type QuestionStep =
  | 'TRIGGER'
  | 'TITLE'
  | 'CATEGORY'
  | 'EVENT_TYPE'
  | 'DESCRIPTION'
  | 'DATE'
  | 'TIMES'
  | 'VENUE'
  | 'CITY'
  | 'PRICE'
  | 'CAPACITY'
  | 'COMPLETE';

interface CollectedEventDraft {
  title: string;
  category: string;
  eventType: 'In-Person' | 'Virtual' | '';
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venueName: string;
  address: string;
  city: string;
  state: string;
  price: number | null;
  capacity: number | null;
  imageUrl: string;
}

interface ChatMessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  stepKey?: QuestionStep;
  draftSnapshot?: CollectedEventDraft;
  actionCompleted?: boolean;
}

interface OrganizerAICreateEventProps {
  onNavigate: (tab: NavTab) => void;
  onSwitchToManual: (prefillData?: any) => void;
}

export const OrganizerAICreateEvent: React.FC<OrganizerAICreateEventProps> = ({
  onNavigate,
  onSwitchToManual,
}) => {
  // Current active Question Step in the single-question chat flow
  const [currentStep, setCurrentStep] = useState<QuestionStep>('TRIGGER');

  // Event Data object collected strictly through Q&A chat
  const [draft, setDraft] = useState<CollectedEventDraft>({
    title: '',
    category: '',
    eventType: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    venueName: '',
    address: '',
    city: '',
    state: '',
    price: null,
    capacity: null,
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
  });

  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      stepKey: 'TRIGGER',
      text: `Hello Organizer! 🤖 I am your AI Event Creation Assistant.\n\nPlease type **"create event"** to begin creating your event.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Quick suggestion chips based on active question step
  const quickSuggestions: Record<QuestionStep, string[]> = {
    TRIGGER: ['create event', 'I want to create a new event'],
    TITLE: ['Global AI & Cloud Tech Conference 2026', 'Acoustic Harmony Music Concert', 'Modern UI/UX Design Workshop', 'Founders Pitch Meetup'],
    CATEGORY: ['Technology', 'Music', 'UI/UX Workshop', 'Startup Meetup', 'Sports', 'Cloud & DevOps', 'AI & ML'],
    EVENT_TYPE: ['In-Person', 'Virtual / Online'],
    DESCRIPTION: ['A premier conference featuring keynote speakers, live workshops, and networking.', 'An acoustic live music performance featuring top artists.'],
    DATE: ['2026-09-20', '2026-10-15', '2026-11-05'],
    TIMES: ['09:00 AM to 05:00 PM (09:00 to 17:00)', '10:00 AM to 04:00 PM', '06:00 PM to 09:00 PM'],
    VENUE: ['Moscone Center West, 747 Howard St', 'Austin Tech Hub Studio, 100 Main St', 'Online Virtual Stream'],
    CITY: ['San Francisco, CA', 'Austin, TX', 'Los Angeles, CA', 'New York, NY'],
    PRICE: ['$149.00 ticket price', '$49.00 ticket price', '$0.00 (Free Event)'],
    CAPACITY: ['300 seats capacity', '100 tickets available', '500 seats capacity'],
    COMPLETE: [],
  };

  const handleSendMessage = async (textToSend?: string) => {
    const userPrompt = (textToSend || inputMessage).trim();
    if (!userPrompt || isProcessing) return;

    setInputMessage('');
    setIsProcessing(true);

    // Render User message bubble in chat stream
    const userMsg: ChatMessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userPrompt,
      stepKey: currentStep,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const lower = userPrompt.toLowerCase();
      const updatedDraft = { ...draft };
      let nextStep: QuestionStep = 'TITLE';
      let assistantQuestionText = '';

      if (currentStep === 'TRIGGER') {
        // User typed "create event" -> ask Question 1: Event Name
        nextStep = 'TITLE';
        assistantQuestionText = `Great! Let's create your event step-by-step. 📝\n\n**Please enter the Event Name / Title:**`;
      } else if (currentStep === 'TITLE') {
        updatedDraft.title = userPrompt.charAt(0).toUpperCase() + userPrompt.slice(1);
        nextStep = 'CATEGORY';
        assistantQuestionText = `Event Name set to **"${updatedDraft.title}"**. ✅\n\n🏷️ **Please enter or select the Category** (e.g. Technology, Music, UI/UX Workshop, Startup Meetup, Sports, Cloud & DevOps, AI & ML):`;
      } else if (currentStep === 'CATEGORY') {
        let cat = 'Technology';
        if (lower.includes('music') || lower.includes('concert')) cat = 'Music';
        else if (lower.includes('ui/ux') || lower.includes('design')) cat = 'UI/UX Workshop';
        else if (lower.includes('startup') || lower.includes('pitch')) cat = 'Startup Meetup';
        else if (lower.includes('sport')) cat = 'Sports';
        else if (lower.includes('cloud')) cat = 'Cloud & DevOps';
        else if (lower.includes('ai') || lower.includes('ml')) cat = 'AI & ML';
        else cat = userPrompt;

        updatedDraft.category = cat;

        let imageUrl = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80';
        if (cat === 'Music') imageUrl = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80';
        else if (cat === 'UI/UX Workshop') imageUrl = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80';
        else if (cat === 'Startup Meetup') imageUrl = 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80';
        updatedDraft.imageUrl = imageUrl;

        nextStep = 'EVENT_TYPE';
        assistantQuestionText = `Category set to **"${cat}"**. ✅\n\n🌐 **Is this event In-Person or Virtual / Online?**`;
      } else if (currentStep === 'EVENT_TYPE') {
        const isVirt = lower.includes('virtual') || lower.includes('online') || lower.includes('webinar');
        updatedDraft.eventType = isVirt ? 'Virtual' : 'In-Person';

        nextStep = 'DESCRIPTION';
        assistantQuestionText = `Event Type set to **"${updatedDraft.eventType}"**. ✅\n\n📄 **Please enter a brief Description for your event:**`;
      } else if (currentStep === 'DESCRIPTION') {
        updatedDraft.description = userPrompt;

        nextStep = 'DATE';
        assistantQuestionText = `Description saved! ✅\n\n📅 **What is the Event Date?** (e.g. 2026-09-20 or Sept 20, 2026)`;
      } else if (currentStep === 'DATE') {
        let dateStr = userPrompt;
        const dateMatch = userPrompt.match(/\b(20\d\d-\d\d-\d\d|\w+\s+\d{1,2}(?:,\s*20\d\d)?)\b/i);
        if (dateMatch) dateStr = dateMatch[1];
        updatedDraft.eventDate = dateStr;

        nextStep = 'TIMES';
        assistantQuestionText = `Event Date set to **"${dateStr}"**. ✅\n\n⏰ **What are the Start Time and End Time?** (e.g. 09:00 to 17:00)`;
      } else if (currentStep === 'TIMES') {
        updatedDraft.startTime = '09:00';
        updatedDraft.endTime = '17:00';

        nextStep = 'VENUE';
        assistantQuestionText = `Schedule set to **09:00 to 17:00**. ✅\n\n📍 **What is the Venue Name & Address?** (e.g. Moscone Center West, 747 Howard St)`;
      } else if (currentStep === 'VENUE') {
        if (updatedDraft.eventType === 'Virtual') {
          updatedDraft.venueName = 'Online Virtual Stream';
          updatedDraft.address = 'https://meet.eventora.ai/live';
        } else {
          updatedDraft.venueName = userPrompt;
          updatedDraft.address = '747 Howard St';
        }

        nextStep = 'CITY';
        assistantQuestionText = `Venue set to **"${updatedDraft.venueName}"**. ✅\n\n🌆 **What is the City and State / Region?** (e.g. San Francisco, CA)`;
      } else if (currentStep === 'CITY') {
        let city = userPrompt;
        let state = 'CA';
        if (lower.includes('austin')) { city = 'Austin'; state = 'TX'; }
        else if (lower.includes('san francisco')) { city = 'San Francisco'; state = 'CA'; }
        else if (lower.includes('los angeles')) { city = 'Los Angeles'; state = 'CA'; }
        else if (lower.includes('new york')) { city = 'New York'; state = 'NY'; }

        updatedDraft.city = city;
        updatedDraft.state = state;

        nextStep = 'PRICE';
        assistantQuestionText = `City set to **"${city}, ${state}"**. ✅\n\n💲 **What is the Ticket Price in USD ($)?** (Enter 0 for Free tickets)`;
      } else if (currentStep === 'PRICE') {
        let p = 0;
        const pMatch = userPrompt.match(/\$?(\d+(\.\d+)?)/);
        if (pMatch) p = parseFloat(pMatch[1]);
        if (lower.includes('free')) p = 0;
        updatedDraft.price = p;

        nextStep = 'CAPACITY';
        assistantQuestionText = `Ticket Price set to **$${p.toFixed(2)}**. ✅\n\n🎟️ **What is the Total Ticket Capacity / Seats available?** (e.g. 300)`;
      } else if (currentStep === 'CAPACITY') {
        let cap = 100;
        const capMatch = userPrompt.match(/(\d+)/);
        if (capMatch) cap = parseInt(capMatch[1], 10);
        updatedDraft.capacity = cap;

        nextStep = 'COMPLETE';
        assistantQuestionText = `🎉 **All Event Information Collected Successfully!**\n\nHere is your full **Event Summary Preview Card**. Would you like to **Publish Live** or **Save as Draft**?`;
      }

      setDraft(updatedDraft);
      setCurrentStep(nextStep);

      const assistantMsg: ChatMessageItem = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        stepKey: nextStep,
        text: assistantQuestionText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        draftSnapshot: updatedDraft,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsProcessing(false);
    }, 400);
  };

  // HITL Action 1: Confirm & Publish Event Live
  const handlePublishDraft = async (msgId: string, eventDraft: CollectedEventDraft) => {
    setIsProcessing(true);
    try {
      const payload = {
        title: eventDraft.title,
        name: eventDraft.title,
        event_name: eventDraft.title,
        category: eventDraft.category || 'Technology',
        description: eventDraft.description,
        event_type: eventDraft.eventType || 'In-Person',
        event_date: eventDraft.eventDate || '2026-09-20',
        start_time: `${eventDraft.eventDate || '2026-09-20'}T09:00:00Z`,
        end_time: `${eventDraft.eventDate || '2026-09-20'}T17:00:00Z`,
        venue_name: eventDraft.venueName || 'Moscone Center West',
        address: eventDraft.address || '747 Howard St',
        city: eventDraft.city || 'San Francisco',
        state: eventDraft.state || 'CA',
        location: `${eventDraft.venueName}, ${eventDraft.city}`,
        price: eventDraft.price || 0,
        ticket_price: eventDraft.price || 0,
        capacity: eventDraft.capacity || 100,
        total_tickets: eventDraft.capacity || 100,
        available_seats: eventDraft.capacity || 100,
        image_url: eventDraft.imageUrl,
        event_image: eventDraft.imageUrl,
        is_virtual: eventDraft.eventType === 'Virtual',
        status: 'PUBLISHED',
      };

      const res = await createEvent(payload);

      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, actionCompleted: true } : m))
      );

      const confirmMsg: ChatMessageItem = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        stepKey: 'COMPLETE',
        text: `🎉 **Event Published Live!** "${res.title || eventDraft.title}" is now active in attendee discovery! (ID: \`${res.id}\`)`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, confirmMsg]);
      setToastNotification(`🎉 Event "${eventDraft.title}" published live successfully!`);
      setTimeout(() => setToastNotification(null), 4000);
    } catch (err: any) {
      console.error('Failed to publish event:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // HITL Action 2: Save as Draft
  const handleSaveDraft = async (msgId: string, eventDraft: CollectedEventDraft) => {
    setIsProcessing(true);
    try {
      const payload = {
        title: eventDraft.title,
        name: eventDraft.title,
        event_name: eventDraft.title,
        category: eventDraft.category || 'Technology',
        description: eventDraft.description,
        event_type: eventDraft.eventType || 'In-Person',
        event_date: eventDraft.eventDate || '2026-09-20',
        start_time: `${eventDraft.eventDate || '2026-09-20'}T09:00:00Z`,
        end_time: `${eventDraft.eventDate || '2026-09-20'}T17:00:00Z`,
        venue_name: eventDraft.venueName || 'Moscone Center West',
        address: eventDraft.address || '747 Howard St',
        city: eventDraft.city || 'San Francisco',
        state: eventDraft.state || 'CA',
        location: `${eventDraft.venueName}, ${eventDraft.city}`,
        price: eventDraft.price || 0,
        ticket_price: eventDraft.price || 0,
        capacity: eventDraft.capacity || 100,
        total_tickets: eventDraft.capacity || 100,
        available_seats: eventDraft.capacity || 100,
        image_url: eventDraft.imageUrl,
        event_image: eventDraft.imageUrl,
        is_virtual: eventDraft.eventType === 'Virtual',
        status: 'DRAFT',
      };

      const res = await createEvent(payload);

      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, actionCompleted: true } : m))
      );

      const confirmMsg: ChatMessageItem = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        stepKey: 'COMPLETE',
        text: `💾 **Draft Saved!** Event "${res.title || eventDraft.title}" stored in DRAFT status.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, confirmMsg]);
      setToastNotification(`💾 Event "${eventDraft.title}" saved as draft!`);
      setTimeout(() => setToastNotification(null), 4000);
    } catch (err: any) {
      console.error('Failed to save draft:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto flex flex-col h-[calc(100vh-180px)] animate-in fade-in duration-200">
      {/* Toast Notification Banner */}
      {toastNotification && (
        <div className="glass-panel p-3.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-950/40 flex items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-200 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">{toastNotification}</span>
          </div>
          <button
            onClick={() => onNavigate('organizer-events')}
            className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline"
          >
            View in My Events →
          </button>
        </div>
      )}

      {/* Main Chat Stream Container */}
      <div className="flex-1 glass-panel rounded-2xl p-4 lg:p-6 border border-slate-200 dark:border-gray-800 overflow-y-auto space-y-4 no-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 space-y-3 text-xs shadow-sm ${msg.sender === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-brand-600 text-white rounded-tr-none'
                  : 'glass-card border border-slate-200 dark:border-gray-800 text-slate-800 dark:text-gray-200 rounded-tl-none'
                }`}
            >
              <div className="flex items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-2">
                <span className="font-bold flex items-center gap-1.5 text-[11px]">
                  {msg.sender === 'assistant' ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" /> AI Event Assistant
                    </>
                  ) : (
                    'Organizer Response'
                  )}
                </span>
                <span className="text-[10px] opacity-75 font-mono">{msg.timestamp}</span>
              </div>

              <div className="leading-relaxed whitespace-pre-line text-xs">{msg.text}</div>

              {/* Render Final Preview Card ONLY when COMPLETE */}
              {msg.stepKey === 'COMPLETE' && msg.draftSnapshot && msg.draftSnapshot.title && (
                <div className="mt-3 p-4 rounded-2xl border border-purple-500/40 bg-white/90 dark:bg-gray-900/90 text-slate-900 dark:text-white space-y-4 shadow-md animate-in fade-in duration-200">
                  <div className="relative h-36 rounded-xl overflow-hidden">
                    <img
                      src={msg.draftSnapshot.imageUrl}
                      alt={msg.draftSnapshot.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />
                    <div className="absolute top-2.5 left-2.5">
                      <Badge variant="brand">{msg.draftSnapshot.category || 'Technology'}</Badge>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-white">
                      <span className="font-bold flex items-center gap-1">
                        {msg.draftSnapshot.eventType === 'Virtual' ? <Globe className="w-3.5 h-3.5 text-purple-400" /> : <Building className="w-3.5 h-3.5 text-purple-400" />}
                        {msg.draftSnapshot.eventType || 'In-Person'}
                      </span>
                      <span className="font-extrabold text-brand-400 bg-black/70 px-2 py-0.5 rounded-md">
                        ${(msg.draftSnapshot.price || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{msg.draftSnapshot.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-gray-400 line-clamp-2">{msg.draftSnapshot.description}</p>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-700 dark:text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>Date: <strong>{msg.draftSnapshot.eventDate} ({msg.draftSnapshot.startTime})</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span className="truncate">Venue: <strong>{msg.draftSnapshot.city} • {msg.draftSnapshot.venueName}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                        <span>Capacity: <strong>{msg.draftSnapshot.capacity} seats</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Price: <strong>${(msg.draftSnapshot.price || 0).toFixed(2)}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Publish & Draft Action Buttons */}
                  {!msg.actionCompleted ? (
                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-slate-200 dark:border-gray-800">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handlePublishDraft(msg.id, msg.draftSnapshot!)}
                        icon={<Globe className="w-3.5 h-3.5" />}
                        className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                        disabled={isProcessing}
                      >
                        Publish Live
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSaveDraft(msg.id, msg.draftSnapshot!)}
                        icon={<Save className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                        className="text-xs"
                        disabled={isProcessing}
                      >
                        Save Draft
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSwitchToManual(msg.draftSnapshot)}
                        icon={<Edit3 className="w-3.5 h-3.5" />}
                        className="text-xs text-purple-700 dark:text-purple-300"
                        disabled={isProcessing}
                      >
                        Edit Manual Form
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-2 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Action Confirmed & Saved to Event Inventory
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-semibold p-2">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>AI Assistant is parsing your prompt...</span>
          </div>
        )}
      </div>

      {/* Suggested Input Chips for Current Active Question */}
      {currentStep !== 'COMPLETE' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 no-scrollbar">
          <span className="text-xs text-purple-600 dark:text-purple-400 font-bold shrink-0 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" /> Suggested:
          </span>
          {quickSuggestions[currentStep].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-xl text-xs bg-purple-500/10 dark:bg-purple-950/40 border border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-600 hover:text-white shrink-0 transition-all font-semibold shadow-sm disabled:opacity-50 flex items-center gap-1"
            >
              {currentStep === 'TRIGGER' && <PlusCircle className="w-3.5 h-3.5" />}
              <span>"{prompt}"</span>
            </button>
          ))}
        </div>
      )}

      {/* Chat Text Input Bar */}
      <div className="glass-card p-2 rounded-2xl border border-slate-200 dark:border-gray-800 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={
            currentStep === 'TRIGGER'
              ? 'Type "create event" to start...'
              : currentStep === 'COMPLETE'
                ? 'Click Publish Live or Save Draft above...'
                : 'Enter value here...'
          }
          className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none"
          disabled={isProcessing || currentStep === 'COMPLETE'}
        />
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleSendMessage()}
          disabled={!inputMessage.trim() || isProcessing || currentStep === 'COMPLETE'}
          icon={<Send className="w-4 h-4" />}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold"
        >
          {currentStep === 'TRIGGER' ? 'Start' : 'Send'}
        </Button>
      </div>
    </div>
  );
};

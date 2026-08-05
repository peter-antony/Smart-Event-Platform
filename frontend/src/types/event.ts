export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  location: string;
  is_virtual: boolean;
  start_time: string;
  end_time: string;
  price: number;
  capacity: number;
  available_seats: number;
  image_url: string;
  tags: string[];
  organizer?: string;
  agenda?: { time: string; title: string; speaker: string }[];
}

export interface Booking {
  id: string;
  booking_reference: string;
  event_id: string;
  user_name?: string;
  user_email?: string;
  user_id: string;
  number_of_tickets: number;
  unit_price: number;
  total_amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  created_at: string;
  event: Event;
}

export interface FilterState {
  category: string;
  searchQuery: string;
  isVirtualOnly: boolean;
}

export interface AgentStep {
  id: string;
  step: string;
  status: 'pending' | 'in_progress' | 'active' | 'completed' | 'failed';
  description?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendedEvents?: Event[];
  agentSteps?: AgentStep[];
  requiresConfirmation?: boolean;
  confirmationOptions?: string[];
}

export type UserRole = 'ORGANIZER' | 'ATTENDEE' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  access_token?: string;
}

export type NavTab =
  | 'discovery'
  | 'details'
  | 'bookings'
  | 'ai-assistant'
  | 'organizer-dashboard'
  | 'organizer-events'
  | 'organizer-events-create'
  | 'organizer-events-create-ai'
  | 'organizer-bookings'
  | 'organizer-analytics'
  | 'organizer-notifications'
  | 'organizer-settings'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-organizers'
  | 'admin-organizer-detail'
  | 'admin-events'
  | 'admin-bookings'
  | 'admin-analytics'
  | 'admin-notifications'
  | 'admin-settings'
  | 'login';



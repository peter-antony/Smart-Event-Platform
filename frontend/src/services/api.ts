import { Event, Booking } from '../types/event';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_BASE_URL = `${BASE_URL}/api`;

export const fetchHealthStatus = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline, falling back to mock state mode:', err);
    return { status: 'mock', app_name: 'Smart Event Platform' };
  }
};

export const fetchPublishedEvents = async (
  category?: string,
  search?: string,
  city?: string,
  startDate?: string
): Promise<Event[]> => {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('name', search);
    if (city && city !== 'All') params.append('city', city);
    if (startDate) params.append('start_date', startDate);

    const res = await fetch(`${API_BASE_URL}/events/published?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch published events');
    return await res.json();
  } catch (err) {
    console.warn('Failed fetching published events from backend:', err);
    throw err;
  }
};

export const fetchEvents = async (category?: string, search?: string): Promise<Event[]> => {
  return fetchPublishedEvents(category, search);
};


export const fetchEventById = async (eventId: string): Promise<Event | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/events/${eventId}`);
    if (!res.ok) throw new Error('Event not found');
    return await res.json();
  } catch (err) {
    console.warn('Using mock event lookup:', err);
    return MOCK_EVENTS.find((e) => e.id === eventId) || MOCK_EVENTS[0];
  }
};

export const fetchMyBookings = async (userId: string = 'attendee@example.com'): Promise<Booking[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/my?user_id=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to fetch my bookings');
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch my bookings from backend:', err);
    throw err;
  }
};

export const cancelBooking = async (bookingIdOrRef: string): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/${bookingIdOrRef}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Failed to cancel booking' }));
      throw new Error(errData.detail || 'Failed to cancel booking');
    }
    return await res.json();
  } catch (err) {
    console.warn('Failed canceling booking:', err);
    throw err;
  }
};

export const fetchBookings = async (userId: string = 'attendee@example.com'): Promise<Booking[]> => {
  return fetchMyBookings(userId).catch(() => MOCK_BOOKINGS);
};

export const createBooking = async (eventId: string, userName: string, userEmail: string, count: number = 1): Promise<Booking> => {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: eventId,
        user_id: userEmail || userName,
        number_of_tickets: count
      })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Failed to complete booking' }));
      throw new Error(errData.detail || 'Failed to complete booking');
    }
    return await res.json();
  } catch (err) {
    console.warn('Mocking booking creation response:', err);
    const event = MOCK_EVENTS.find(e => e.id === eventId) || MOCK_EVENTS[0];
    const bkgRef = `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      id: `bkg-${Date.now()}`,
      booking_reference: bkgRef,
      event_id: eventId,
      user_name: userName,
      user_email: userEmail,
      user_id: userEmail || userName,
      number_of_tickets: count,
      unit_price: event.price,
      total_amount: event.price * count,
      status: 'CONFIRMED',
      created_at: new Date().toISOString(),
      event: event
    };
  }
};

export const createEvent = async (eventPayload: Record<string, any>): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify(eventPayload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Failed to create event' }));
      throw new Error(errData.detail || 'Failed to create event');
    }

    return await res.json();
  } catch (err) {
    console.warn('Backend API event creation fallback:', err);
    return {
      id: `evt-${Date.now()}`,
      ...eventPayload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
};

export const fetchOrganizerEvents = async (
  organizerId: string = 'organizer@example.com',
  status?: string,
  category?: string,
  search?: string
): Promise<any[]> => {
  try {
    const params = new URLSearchParams();
    if (organizerId) params.append('organizer_id', organizerId);
    if (status && status !== 'ALL') params.append('status', status);
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('name', search);

    const res = await fetch(`${API_BASE_URL}/events/search?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch organizer events');
    return await res.json();
  } catch (err) {
    console.warn('Failed fetching organizer events from backend:', err);
    return [];
  }
};

export const updateEventStatus = async (eventId: string, newStatus: string): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/events/${eventId}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Failed to update event status' }));
      throw new Error(errData.detail || 'Failed to update event status');
    }
    return await res.json();
  } catch (err) {
    console.warn('Fallback updating status locally:', err);
    return { id: eventId, status: newStatus };
  }
};

export const updateEvent = async (eventId: string, eventPayload: Record<string, any>): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(eventPayload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Failed to update event' }));
      throw new Error(errData.detail || 'Failed to update event');
    }

    return await res.json();
  } catch (err) {
    console.warn('Backend API event update fallback:', err);
    return {
      id: eventId,
      ...eventPayload,
      updated_at: new Date().toISOString()
    };
  }
};




// High quality mock data
export const MOCK_EVENTS: Event[] = [
  {
    id: 'evt-1',
    title: 'AI & Future Tech Summit 2026',
    description: 'Explore the next generation of artificial intelligence, agentic workflows, neural networks, and LangGraph architectures with industry leaders.',
    category: 'Technology',
    city: 'San Francisco',
    location: 'San Francisco, CA & Virtual',
    is_virtual: true,
    start_time: '2026-08-15T09:00:00Z',
    end_time: '2026-08-16T18:00:00Z',
    price: 299.00,
    capacity: 500,
    available_seats: 142,
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    tags: ['AI', 'LLMs', 'LangChain', 'Future Tech'],
    organizer: 'TechInnovate Global',
    agenda: [
      { time: '09:00 AM', title: 'Keynote: Agentic Workflows in 2026', speaker: 'Dr. Evelyn Vance' },
      { time: '11:30 AM', title: 'Building Autonomous Agents with LangGraph', speaker: 'Marcus Chen' },
      { time: '02:00 PM', title: 'Panel: Responsible AI & Enterprise Scale', speaker: 'AI Research Board' }
    ]
  },
  {
    id: 'evt-2',
    title: 'Global Web Development Conference',
    description: 'Hands-on workshops on React 19, Vite optimizations, Tailwind CSS design systems, and micro-frontend architectures.',
    category: 'Development',
    city: 'Austin',
    location: 'Austin, TX',
    is_virtual: false,
    start_time: '2026-09-02T10:00:00Z',
    end_time: '2026-09-04T17:00:00Z',
    price: 499.00,
    capacity: 800,
    available_seats: 210,
    image_url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
    tags: ['React', 'TypeScript', 'Vite', 'WebDev'],
    organizer: 'Frontend Leaders Guild',
    agenda: [
      { time: '10:00 AM', title: 'React 19 Server Components Masterclass', speaker: 'Sarah Jenkins' },
      { time: '01:30 PM', title: 'Ultra-fast builds with Vite & Rust', speaker: 'Alexey Romanov' }
    ]
  },
  {
    id: 'evt-3',
    title: 'Cloud Native & DevOps Symposium',
    description: 'Deep dive into Kubernetes, Terraform, FastAPI microservice scaling, serverless GPU clusters, and eBPF observability.',
    category: 'Cloud & DevOps',
    city: 'Seattle',
    location: 'Seattle, WA & Virtual',
    is_virtual: true,
    start_time: '2026-10-10T08:30:00Z',
    end_time: '2026-10-11T17:30:00Z',
    price: 199.00,
    capacity: 400,
    available_seats: 85,
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    tags: ['Cloud', 'DevOps', 'FastAPI', 'Docker'],
    organizer: 'Cloud Engineering Alliance',
    agenda: [
      { time: '08:30 AM', title: 'Zero-Trust Architecture on Kubernetes', speaker: 'Michael Ross' },
      { time: '11:00 AM', title: 'Scaling FastAPI to 100k Req/Sec', speaker: 'Elena Rostova' }
    ]
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'bkg-101',
    booking_reference: 'BK-8A2F9C1B',
    event_id: 'evt-1',
    user_name: 'Antony Peter',
    user_email: 'user@example.com',
    user_id: 'user@example.com',
    number_of_tickets: 2,
    unit_price: 299.00,
    total_amount: 598.00,
    status: 'CONFIRMED',
    created_at: '2026-07-28T14:30:00Z',
    event: MOCK_EVENTS[0]
  }
];

// Helper to get auth token headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('smart_event_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// -------------------------------------------------------------
// ADMIN USER MANAGEMENT APIs
// -------------------------------------------------------------
export const fetchAdminUsers = async (params: {
  search?: string;
  role?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.role) query.append('role', params.role);
    if (params.status) query.append('status', params.status);
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${BASE_URL}/api/v1/admin/users?${query.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Admin API] Failed fetching users from backend, fallback mock:', err);
    return null;
  }
};

export const fetchAdminUserById = async (userId: string) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/admin/users/${encodeURIComponent(userId)}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[Admin API] Failed fetching user ${userId}:`, err);
    return null;
  }
};

export const updateAdminUserStatus = async (userId: string, targetStatus: 'ACTIVE' | 'BLOCKED') => {
  const res = await fetch(`${BASE_URL}/api/v1/admin/users/${encodeURIComponent(userId)}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ status: targetStatus })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Failed updating user status');
  }
  return data;
};

export const updateAdminUserRole = async (userId: string, targetRole: 'ADMIN' | 'ORGANIZER' | 'ATTENDEE') => {
  const res = await fetch(`${BASE_URL}/api/v1/admin/users/${encodeURIComponent(userId)}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ role: targetRole })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Failed updating user role');
  }
  return data;
};

export const fetchAdminOrganizers = async (search?: string) => {
  try {
    const query = new URLSearchParams();
    if (search) query.append('search', search);

    const res = await fetch(`${BASE_URL}/api/v1/admin/organizers?${query.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Admin API] Failed fetching organizers, fallback mock:', err);
    return null;
  }
};

export const fetchAdminOrganizerById = async (organizerId: string) => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/admin/organizers/${encodeURIComponent(organizerId)}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[Admin API] Failed fetching organizer ${organizerId}:`, err);
    return null;
  }
};

// -------------------------------------------------------------
// ADMIN EVENT MODERATION APIs
// -------------------------------------------------------------
export const fetchAdminEvents = async (params: {
  search?: string;
  category?: string;
  status?: string;
  organizer_id?: string;
  event_date?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.status) query.append('status', params.status);
    if (params.organizer_id) query.append('organizer_id', params.organizer_id);
    if (params.event_date) query.append('event_date', params.event_date);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${BASE_URL}/api/v1/admin/events?${query.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Admin API] Failed fetching admin events, fallback mock:', err);
    return null;
  }
};

export const updateAdminEventStatus = async (eventId: string, targetStatus: string) => {
  const res = await fetch(`${BASE_URL}/api/v1/admin/events/${encodeURIComponent(eventId)}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ status: targetStatus })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Failed updating event status');
  }
  return data;
};

export const deleteAdminEvent = async (eventId: string) => {
  const res = await fetch(`${BASE_URL}/api/v1/admin/events/${encodeURIComponent(eventId)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Failed deleting event');
  }
  return data;
};

// -------------------------------------------------------------
// ADMIN BOOKING MANAGEMENT APIs
// -------------------------------------------------------------
export const fetchAdminBookings = async (params: {
  search?: string;
  status?: string;
  event_id?: string;
  organizer_email?: string;
  attendee_email?: string;
  booking_date?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.event_id) query.append('event_id', params.event_id);
    if (params.organizer_email) query.append('organizer_email', params.organizer_email);
    if (params.attendee_email) query.append('attendee_email', params.attendee_email);
    if (params.booking_date) query.append('booking_date', params.booking_date);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${BASE_URL}/api/v1/admin/bookings?${query.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Admin API] Failed fetching bookings, fallback mock:', err);
    return null;
  }
};

export const cancelAdminBooking = async (bookingId: string) => {
  const res = await fetch(`${BASE_URL}/api/v1/admin/bookings/${encodeURIComponent(bookingId)}/cancel`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Failed cancelling booking');
  }
  return data;
};

export const fetchAdminDashboardStats = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/admin/dashboard`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Admin API] Failed fetching dashboard stats, fallback mock:', err);
    return null;
  }
};

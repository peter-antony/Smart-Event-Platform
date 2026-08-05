import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User, UserRole } from '../types/event';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'smart_event_user';
const LOCAL_STORAGE_TOKEN_KEY = 'smart_event_token';

// Demo fallback users for development testing if backend is offline
const DEMO_USERS: Record<string, User> = {
  'admin@example.com': {
    id: 'admin-demo-333',
    email: 'admin@example.com',
    full_name: 'System Administrator',
    role: 'ADMIN'
  },
  'organizer@example.com': {
    id: 'org-organizer-222',
    email: 'organizer@example.com',
    full_name: 'Organizer User',
    role: 'ORGANIZER'
  },
  'attendee@example.com': {
    id: 'user-attendee-111',
    email: 'attendee@example.com',
    full_name: 'Attendee User',
    role: 'ATTENDEE'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed restoring auth state from localStorage:', e);
      }
    }
    // Default to Attendee Demo user if no session stored
    return DEMO_USERS['attendee@example.com'];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    const cleanEmail = email.toLowerCase().trim();

    try {
      // Attempt backend authentication
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await axios.post(
        `${API_BASE}/api/auth/login`,
        {
          email: cleanEmail,
          password: password
        },
        {
          timeout: 3000
        }
      );

      if (response.data && response.data.user) {
        const userData: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          full_name: response.data.user.full_name,
          role: response.data.user.role as UserRole,
          access_token: response.data.access_token
        };

        if (response.data.access_token) {
          localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, response.data.access_token);
        }

        setUser(userData);
        return { success: true, role: userData.role };
      }
    } catch (err) {
      console.warn('[AuthContext] Backend login call failed or offline, checking demo fallback users:', err);
    }

    // Development Fallback for Demo User Credentials
    if (DEMO_USERS[cleanEmail] && password === 'password123') {
      const demoUser = DEMO_USERS[cleanEmail];
      setUser(demoUser);
      return { success: true, role: demoUser.role };
    }

    return {
      success: false,
      error: 'Invalid credentials. Use organizer@example.com / password123 or attendee@example.com / password123.'
    };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

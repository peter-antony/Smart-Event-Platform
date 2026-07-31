import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, NavTab } from '../../types/event';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  onNavigate: (tab: NavTab) => void;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  onNavigate,
  children
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    onNavigate('login');
    return null;
  }

  const isAllowed = allowedRoles.includes(user.role);

  if (!isAllowed) {
    const defaultRoute: NavTab = user.role === 'ORGANIZER' ? 'organizer-dashboard' : 'discovery';

    return (
      <div className="max-w-xl mx-auto my-12 glass-panel p-8 rounded-3xl border border-red-500/30 text-center space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto shadow-glow">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-xs text-gray-300">
            This page is restricted to <span className="font-extrabold text-brand-400">{allowedRoles.join(', ')}</span> role accounts.
            You are currently logged in as <span className="font-extrabold text-purple-300">{user.full_name}</span> (<span className="font-mono">{user.role}</span>).
          </p>
        </div>

        <div className="pt-3">
          <Button
            variant="primary"
            onClick={() => onNavigate(defaultRoute)}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Return to {user.role === 'ORGANIZER' ? 'Organizer Dashboard' : 'Attendee Dashboard'}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

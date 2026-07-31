import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NavTab } from '../types/event';
import { LogIn, UserCheck, ShieldCheck, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface LoginPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('organizer@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success && result.role) {
      if (result.role === 'ORGANIZER') {
        onNavigate('organizer-dashboard');
      } else {
        onNavigate('discovery');
      }
    } else {
      setError(result.error || 'Authentication failed');
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
    setIsLoading(true);

    const result = await login(demoEmail, 'password123');
    setIsLoading(false);

    if (result.success && result.role) {
      if (result.role === 'ORGANIZER') {
        onNavigate('organizer-dashboard');
      } else {
        onNavigate('discovery');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6">
      <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 space-y-6 shadow-glow">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-md">
            <LogIn className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign In to Eventora</h2>
          <p className="text-xs text-gray-400">Enter your credentials or click a demo account below</p>
        </div>

        {error && (
          <div className="glass-card p-3.5 rounded-2xl border border-red-500/40 bg-red-950/30 flex items-center gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-gray-900/80 border border-gray-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-900/80 border border-gray-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 text-xs font-bold"
            disabled={isLoading}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {/* Quick Demo User Credentials Switcher */}
        <div className="pt-4 border-t border-gray-800 space-y-3">
          <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider text-center">
            Development Quick Demo Accounts
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('organizer@example.com')}
              className="glass-card p-3 rounded-2xl border border-purple-500/30 hover:border-purple-400/60 text-left transition-all group hover:bg-purple-950/30"
            >
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white group-hover:text-purple-300">Organizer</span>
              </div>
              <p className="text-[10px] text-gray-400 truncate">organizer@example.com</p>
              <span className="text-[9px] text-purple-400 font-mono">Role: ORGANIZER</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('attendee@example.com')}
              className="glass-card p-3 rounded-2xl border border-brand-500/30 hover:border-brand-400/60 text-left transition-all group hover:bg-brand-950/30"
            >
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-bold text-white group-hover:text-brand-300">Attendee</span>
              </div>
              <p className="text-[10px] text-gray-400 truncate">attendee@example.com</p>
              <span className="text-[9px] text-brand-400 font-mono">Role: ATTENDEE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

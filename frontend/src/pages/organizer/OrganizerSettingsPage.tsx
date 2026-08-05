import React, { useState } from 'react';
import { User, Save, CheckCircle2, CreditCard, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';

export const OrganizerSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [organizerName, setOrganizerName] = useState(user?.full_name || 'Organizer User');
  const [organizerEmail, setOrganizerEmail] = useState(user?.email || 'organizer@example.com');
  const [payoutBank, setPayoutBank] = useState('Chase Business Checking (**** 4892)');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {saved && (
        <div className="glass-panel p-3.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-950/30 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Organizer settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel p-6 pt-4 rounded-2xl border border-slate-200 dark:border-gray-800 space-y-6">
        {/* Profile details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-gray-800">
            <User className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Organizer Profile Details
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-gray-300 font-medium mb-1">Organizer Full Name</label>
              <input
                type="text"
                required
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-gray-300 font-medium mb-1">Email Address</label>
              <input
                type="email"
                required
                value={organizerEmail}
                onChange={(e) => setOrganizerEmail(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-gray-300 font-medium mb-1">Role Permission Boundary</label>
              <input
                type="text"
                disabled
                value="ORGANIZER (Verified System Account)"
                className="w-full bg-purple-500/10 dark:bg-purple-950/30 border border-purple-500/30 rounded-xl px-3.5 py-2.5 text-purple-700 dark:text-purple-300 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Theme Preferences Section */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-gray-800">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />} Appearance & Theme Mode
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${theme === 'light'
                  ? 'bg-purple-50 border-purple-500 text-purple-900 font-bold shadow-sm'
                  : 'bg-white dark:bg-gray-900/60 border-slate-200 dark:border-gray-800 text-slate-600 dark:text-gray-400 hover:border-purple-300'
                }`}
            >
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Theme</span>
              </div>
              {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${theme === 'dark'
                  ? 'bg-purple-950/40 border-purple-500 text-white font-bold shadow-glow'
                  : 'bg-white dark:bg-gray-900/60 border-slate-200 dark:border-gray-800 text-slate-600 dark:text-gray-400 hover:border-purple-300'
                }`}
            >
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Dark Theme</span>
              </div>
              {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
            </button>
          </div>
        </div>

        {/* Payout Disbursement Account */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-gray-800">
            <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Payout Disbursement Account
          </h3>

          <div className="text-xs">
            <label className="block text-slate-700 dark:text-gray-300 font-medium mb-1">Direct Deposit Bank Account</label>
            <input
              type="text"
              value={payoutBank}
              onChange={(e) => setPayoutBank(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-gray-800 flex justify-end">
          <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />} className="bg-purple-600 hover:bg-purple-500 text-white">
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

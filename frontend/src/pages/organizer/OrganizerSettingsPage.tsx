import React, { useState } from 'react';
import { User, Save, CheckCircle2, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

export const OrganizerSettingsPage: React.FC = () => {
  const { user } = useAuth();
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
      {/* Header Banner */}
      {/* <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-brand-950/50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">Organizer Settings</h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
              /organizer/settings
            </span>
          </div>
          <p className="text-xs text-gray-400">Profile preferences, payout disbursement accounts, and security settings</p>
        </div>
      </div> */}

      {saved && (
        <div className="glass-panel p-3.5 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Organizer settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel p-6 pt-4 rounded-3xl border border-gray-800 space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-4 border-b border-gray-800">
            <User className="w-4 h-4 text-purple-400" /> Organizer Profile Details
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-300 font-medium mb-1">Organizer Full Name</label>
              <input
                type="text"
                required
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">Email Address</label>
              <input
                type="email"
                required
                value={organizerEmail}
                onChange={(e) => setOrganizerEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">Role Permission Boundary</label>
              <input
                type="text"
                disabled
                value="ORGANIZER (Verified System Account)"
                className="w-full bg-purple-950/30 border border-purple-500/30 rounded-xl px-3.5 py-2.5 text-purple-300 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-gray-800">
            <CreditCard className="w-4 h-4 text-emerald-400" /> Payout Disbursement Account
          </h3>

          <div className="text-xs">
            <label className="block text-gray-300 font-medium mb-1">Direct Deposit Bank Account</label>
            <input
              type="text"
              value={payoutBank}
              onChange={(e) => setPayoutBank(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white font-mono"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800 flex justify-end">
          <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />} className="bg-purple-600 hover:bg-purple-500">
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

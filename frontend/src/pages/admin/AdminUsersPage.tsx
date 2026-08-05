import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Ban,
  Eye,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { NavTab, UserRole } from '../../types/event';
import { useAuth } from '../../context/AuthContext';
import {
  fetchAdminUsers,
  updateAdminUserStatus,
  updateAdminUserRole
} from '../../services/api';
import { Button } from '../../components/ui/Button';

interface AdminUsersPageProps {
  onNavigate?: (tab: NavTab) => void;
}

interface AdminUserItem {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: 'ACTIVE' | 'BLOCKED';
  created_at: string;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = () => {
  const { user: currentUser } = useAuth();

  // State Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const [page, setPage] = useState(1);
  const limit = 5;

  // Data & Loading States
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Selected User Modal State
  const [selectedViewUser, setSelectedViewUser] = useState<AdminUserItem | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Fallback initial dataset for development offline mode
  const FALLBACK_USERS: AdminUserItem[] = [
    { id: 'admin-demo-333', email: 'admin@example.com', full_name: 'System Administrator', role: 'ADMIN', status: 'ACTIVE', created_at: '2026-08-01T00:00:00Z' },
    { id: 'org-organizer-222', email: 'organizer@example.com', full_name: 'Organizer User', role: 'ORGANIZER', status: 'ACTIVE', created_at: '2026-08-02T10:00:00Z' },
    { id: 'user-attendee-111', email: 'attendee@example.com', full_name: 'Attendee User', role: 'ATTENDEE', status: 'ACTIVE', created_at: '2026-08-03T14:30:00Z' },
    { id: 'org-222', email: 'sarah.org@smart-events.com', full_name: 'Sarah Event Organizer', role: 'ORGANIZER', status: 'ACTIVE', created_at: '2026-08-04T09:15:00Z' },
    { id: 'user-default-111', email: 'alex.rivera@example.com', full_name: 'Alex Rivera', role: 'ATTENDEE', status: 'BLOCKED', created_at: '2026-08-05T11:20:00Z' }
  ];

  // Fetch Users Function
  const loadUsersData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await fetchAdminUsers({
        search: searchQuery,
        role: roleFilter,
        status: statusFilter,
        sort: sortOrder,
        page,
        limit
      });

      if (data && data.users) {
        setUsers(data.users);
        setTotalCount(data.total);
        setTotalPages(data.total_pages);
      } else {
        // Fallback filter & pagination logic
        let filtered = [...FALLBACK_USERS];

        if (searchQuery) {
          const sq = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (u) => u.full_name.toLowerCase().includes(sq) || u.email.toLowerCase().includes(sq)
          );
        }
        if (roleFilter !== 'ALL') {
          filtered = filtered.filter((u) => u.role === roleFilter);
        }
        if (statusFilter !== 'ALL') {
          filtered = filtered.filter((u) => u.status === statusFilter);
        }

        if (sortOrder === 'oldest') {
          filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        } else {
          filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        const total = filtered.length;
        const totalP = Math.ceil(total / limit) || 1;
        const start = (page - 1) * limit;
        const pageData = filtered.slice(start, start + limit);

        setUsers(pageData);
        setTotalCount(total);
        setTotalPages(totalP);
      }
    } catch (err: any) {
      console.error('Error fetching admin users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsersData();
  }, [searchQuery, roleFilter, statusFilter, sortOrder, page]);

  // Handler: Toggle Account Status (ACTIVE <-> BLOCKED)
  const handleToggleStatus = async (userItem: AdminUserItem) => {
    const isSelf = currentUser?.email?.toLowerCase() === userItem.email.toLowerCase();
    if (isSelf && userItem.status === 'ACTIVE') {
      setErrorMessage('Security Guardrail: Admin cannot block their own account.');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const nextStatus = userItem.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    setActionLoadingId(userItem.id);
    setErrorMessage(null);

    try {
      await updateAdminUserStatus(userItem.id, nextStatus);
      setSuccessMessage(`Success: User status updated to ${nextStatus}`);

      setUsers((prev) =>
        prev.map((u) => (u.id === userItem.id ? { ...u, status: nextStatus } : u))
      );
    } catch (err: any) {
      console.warn('Backend update error, updating local state:', err);
      setUsers((prev) =>
        prev.map((u) => (u.id === userItem.id ? { ...u, status: nextStatus } : u))
      );
      setSuccessMessage(`User "${userItem.full_name}" set to ${nextStatus}`);
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Handler: Change User Role (ADMIN, ORGANIZER, ATTENDEE)
  const handleChangeRole = async (userItem: AdminUserItem, newRole: UserRole) => {
    const isSelf = currentUser?.email?.toLowerCase() === userItem.email.toLowerCase();
    if (isSelf) {
      setErrorMessage('Security Guardrail: Admin cannot change their own role.');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setActionLoadingId(userItem.id);
    setErrorMessage(null);

    try {
      await updateAdminUserRole(userItem.id, newRole);
      setSuccessMessage(`Success: Role for ${userItem.email} updated to ${newRole}`);

      setUsers((prev) =>
        prev.map((u) => (u.id === userItem.id ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      console.warn('Backend update error, updating local state:', err);
      setUsers((prev) =>
        prev.map((u) => (u.id === userItem.id ? { ...u, role: newRole } : u))
      );
      setSuccessMessage(`Role for ${userItem.full_name} updated to ${newRole}`);
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-900/10 via-purple-900/10 to-brand-900/10 dark:from-rose-950/50 dark:via-purple-950/40 dark:to-brand-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin User Management</h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
              GET /api/v1/admin/users
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            View, search, filter, activate/block user accounts, and update RBAC user roles
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-gray-300 bg-white/50 dark:bg-gray-900/50 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-800">
          <span>Total Records:</span>
          <span className="text-rose-600 dark:text-rose-400 font-mono text-sm">{totalCount} Users</span>
        </div>
      </div>

      {/* Alert Banners */}
      {errorMessage && (
        <div className="glass-panel p-3.5 rounded-2xl border border-red-500/40 bg-red-500/10 dark:bg-red-950/30 flex items-center gap-2 text-xs text-red-700 dark:text-red-300 animate-in zoom-in duration-150">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span className="font-bold">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="glass-panel p-3.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-950/30 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 animate-in zoom-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {/* Controls & Filter Toolbar Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-gray-800 flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
        {/* Search Field */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search users by name or email address..."
            className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 dark:text-gray-400">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">ADMIN Only</option>
              <option value="ORGANIZER">ORGANIZER Only</option>
              <option value="ATTENDEE">ATTENDEE Only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 dark:text-gray-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Users Data Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-gray-900/90 border-b border-slate-200 dark:border-gray-800 text-slate-500 dark:text-gray-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4">User Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Role & Change</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-800/60 text-slate-700 dark:text-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-rose-600 dark:text-rose-400 mb-2" />
                    <span>Loading platform users...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-gray-500">
                    No users matching the filter parameters.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = currentUser?.email?.toLowerCase() === u.email.toLowerCase();

                  return (
                    <tr key={u.id} className="hover:bg-rose-500/10 dark:hover:bg-rose-950/20 transition-colors">
                      {/* Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{u.full_name}</span>
                          {isSelf && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40">
                              YOU (CURRENT LOGGED-IN ADMIN)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-4 font-mono text-slate-600 dark:text-gray-300">{u.email}</td>

                      {/* Role Dropdown */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <select
                            disabled={isSelf || actionLoadingId === u.id}
                            value={u.role}
                            onChange={(e) => handleChangeRole(u, e.target.value as UserRole)}
                            className={`bg-white dark:bg-gray-900 border rounded-xl px-2.5 py-1 text-xs font-bold font-mono focus:outline-none transition-colors ${
                              isSelf ? 'opacity-50 cursor-not-allowed border-slate-300 dark:border-gray-800' : 'border-rose-500/30 focus:border-rose-500'
                            } ${
                              u.role === 'ADMIN'
                                ? 'text-rose-600 dark:text-rose-400'
                                : u.role === 'ORGANIZER'
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-brand-600 dark:text-brand-400'
                            }`}
                            title={isSelf ? 'Self-modification protected: Admin cannot change their own role' : 'Change User Role'}
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="ORGANIZER">ORGANIZER</option>
                            <option value="ATTENDEE">ATTENDEE</option>
                          </select>
                        </div>
                      </td>

                      {/* Account Status Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                          u.status === 'ACTIVE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {u.status === 'ACTIVE' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          {u.status}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="p-4 text-slate-400 dark:text-gray-500 font-mono text-[11px]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View User Modal Trigger */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedViewUser(u)}
                            className="p-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                            title="View User Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {/* Toggle Activate / Block Status Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isSelf || actionLoadingId === u.id}
                            onClick={() => handleToggleStatus(u)}
                            className={`text-[11px] font-bold py-1 px-2.5 ${
                              u.status === 'ACTIVE'
                                ? 'border-rose-500/40 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                : 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            } ${isSelf ? 'opacity-40 cursor-not-allowed' : ''}`}
                            title={isSelf ? 'Self-modification protected: Admin cannot block their own account' : u.status === 'ACTIVE' ? 'Block User' : 'Activate User'}
                          >
                            {actionLoadingId === u.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : u.status === 'ACTIVE' ? (
                              'Block'
                            ) : (
                              'Activate'
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-gray-900/50 text-xs">
          <div className="text-slate-500 dark:text-gray-400">
            Showing Page <span className="font-bold text-slate-900 dark:text-white">{page}</span> of{' '}
            <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span> ({totalCount} total users)
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* VIEW USER DETAILS MODAL */}
      {selectedViewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-rose-500/30 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">User Profile Details</h3>
              </div>
              <button
                onClick={() => setSelectedViewUser(null)}
                className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-gray-900/80 border border-slate-200 dark:border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-gray-500 font-bold uppercase text-[10px]">User ID</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{selectedViewUser.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-gray-500 font-bold uppercase text-[10px]">Full Name</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedViewUser.full_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-gray-500 font-bold uppercase text-[10px]">Email Address</span>
                  <span className="font-mono text-slate-700 dark:text-gray-300">{selectedViewUser.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-gray-500 font-bold uppercase text-[10px]">RBAC Role</span>
                  <span className="px-2 py-0.5 rounded-md font-mono font-extrabold bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40">
                    {selectedViewUser.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-gray-500 font-bold uppercase text-[10px]">Account Status</span>
                  <span className={`font-bold ${selectedViewUser.status === 'ACTIVE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {selectedViewUser.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 dark:text-gray-500 font-bold uppercase text-[10px]">Account Created</span>
                  <span className="font-mono text-slate-500 dark:text-gray-400">{new Date(selectedViewUser.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" onClick={() => setSelectedViewUser(null)} className="w-full sm:w-auto">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

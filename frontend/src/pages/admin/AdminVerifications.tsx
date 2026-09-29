import React, { useState, useEffect } from 'react';
import { userApi } from '../../api/entitiesApi';
import { User } from '../../types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Building2,
  UserCheck,
  Search,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';

export const AdminVerifications: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const fetchPending = async () => {
    try {
      const data = await userApi.getPending();
      setPendingUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (userId: string, name: string) => {
    setProcessingId(userId);
    try {
      await userApi.verifyUser(userId);
      setActionMessage(`Accreditation approved: ${name} is now verified and active.`);
      await fetchPending();
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to reject the accreditation request for ${name}?`)) return;
    setProcessingId(userId);
    try {
      await userApi.rejectUser(userId);
      setActionMessage(`Registration rejected for ${name}.`);
      await fetchPending();
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = pendingUsers.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Accreditation & Registration Verifications
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Review and approve pending accounts for new Athletes, Laboratories, and Doping Control Officers.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {pendingUsers.length} Pending Approval
          </span>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-300 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs text-teal-400 hover:text-white font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by candidate name or official email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-900/80 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">All Roles</option>
            <option value="ATHLETE">Athletes Only</option>
            <option value="LABORATORY_STAFF">Laboratory Staff</option>
            <option value="DOPING_CONTROL_OFFICER">Doping Control Officers</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl inline-flex mb-3 border border-emerald-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">All Accreditations Up to Date</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
            No registration requests are currently pending review. New registrations will automatically appear here for verification.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map((u) => {
            const isProcessing = processingId === u.id;
            return (
              <div
                key={u.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold border border-teal-500/20">
                      {u.first_name?.[0] || 'U'}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-base leading-tight">
                        {u.full_name || `${u.first_name} ${u.last_name}`}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">{u.email}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        u.role === 'ATHLETE'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : u.role === 'LABORATORY_STAFF'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {u.role.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-slate-400 pl-1">
                    {(u as any).sport && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        Sport: <strong className="text-slate-200">{(u as any).sport}</strong>
                      </span>
                    )}
                    {(u as any).team && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        Club/Team: <strong className="text-slate-200">{(u as any).team}</strong>
                      </span>
                    )}
                    {(u as any).laboratory_name && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        Laboratory: <strong className="text-slate-200">{(u as any).laboratory_name}</strong>
                      </span>
                    )}
                    {(u as any).designation && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        Designation: <strong className="text-slate-200">{(u as any).designation}</strong>
                      </span>
                    )}
                    {(u as any).certification_number && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        Cert #: <strong className="text-slate-200">{(u as any).certification_number}</strong>
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-slate-800/50 border border-slate-800 text-slate-400">
                      Registered: {new Date(u.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <button
                    disabled={isProcessing}
                    onClick={() => handleReject(u.id, u.full_name || u.email)}
                    className="flex-1 md:flex-none inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 mr-1.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={() => handleVerify(u.id, u.full_name || u.email)}
                    className="flex-1 md:flex-none inline-flex items-center justify-center px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 shadow-md shadow-teal-500/20 transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-slate-950" />
                    <span>Verify & Approve</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

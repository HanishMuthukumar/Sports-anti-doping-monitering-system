import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../../api/entitiesApi';
import { User } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { Plus, UserX, Search } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await userApi.list();
      setUsers(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeactivate = async (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      await userApi.deactivate(id);
      fetchUsers();
    }
  };

  const filtered = users.filter((u) =>
    `${u.first_name} ${u.last_name} ${u.email} ${u.role}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h2>
          <p className="text-sm text-slate-500">Manage credentials and roles across the platform.</p>
        </div>
        <Link
          to="/admin/users/create"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No users found"
              description="No user records match your search criteria."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/75">
                    <td className="py-3.5 px-4 font-medium text-slate-900">{u.full_name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                        {u.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={u.is_active ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.is_active && (
                        <button
                          onClick={() => handleDeactivate(u.id)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-medium inline-flex items-center space-x-1"
                        >
                          <UserX className="w-3.5 h-3.5 mr-1" />
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

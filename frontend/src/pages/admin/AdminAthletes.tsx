import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { athleteApi } from '../../api/entitiesApi';
import { Athlete } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { Plus, Search } from 'lucide-react';

export const AdminAthletes: React.FC = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAthletes = async () => {
    try {
      const res = await athleteApi.list();
      setAthletes(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, []);

  const filtered = athletes.filter((a) =>
    `${a.full_name} ${a.athlete_id} ${a.sport} ${a.nationality}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Athlete Registry</h2>
          <p className="text-sm text-slate-500">Registered athletes eligible for testing pools.</p>
        </div>
        <Link
          to="/admin/athletes/create"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Register Athlete
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, sport, or country..."
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
              title="No athletes found"
              description="No registered athletes match the query."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">Athlete ID</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Sport</th>
                  <th className="py-3.5 px-4">Nationality</th>
                  <th className="py-3.5 px-4">Team</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/75">
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-teal-700">
                      {a.athlete_id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{a.full_name}</td>
                    <td className="py-3.5 px-4 text-slate-700">{a.sport}</td>
                    <td className="py-3.5 px-4 text-slate-600">{a.nationality || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-600">{a.team || '—'}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={a.status} />
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

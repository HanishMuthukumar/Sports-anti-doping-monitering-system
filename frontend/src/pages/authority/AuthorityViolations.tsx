import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { violationApi } from '../../api/operationsApi';
import { Violation } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { Search, Filter } from 'lucide-react';

export const AuthorityViolations: React.FC = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchViolations = async () => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const res = await violationApi.list(params);
      setViolations(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, [statusFilter]);

  const filtered = violations.filter((v) =>
    `${v.violation_number} ${v.athlete_name} ${v.sport} ${v.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">ADRV Casework Registry</h2>
        <p className="text-sm text-slate-500">Official hearings, sanctions, and appeals proceedings.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search case #, athlete, sport..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ACTION_TAKEN">Action Taken</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No violation cases found"
              description="No cases match your search or filter."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Case #</th>
                  <th className="py-3 px-4">Athlete</th>
                  <th className="py-3 px-4">Sport</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Reviewed By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Adjudication</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/75">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-rose-700">
                      {v.violation_number}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{v.athlete_name}</td>
                    <td className="py-3 px-4 text-slate-600">{v.sport}</td>
                    <td className="py-3 px-4 text-slate-800 max-w-xs truncate" title={v.description}>
                      {v.description}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{v.reviewed_by_name || 'Pending Review'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/authority/violations/${v.id}`}
                        className="text-xs text-teal-600 hover:text-teal-800 font-semibold"
                      >
                        Review Case &rarr;
                      </Link>
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

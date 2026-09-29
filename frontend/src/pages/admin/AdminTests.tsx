import React, { useEffect, useState } from 'react';
import { testApi } from '../../api/operationsApi';
import { DopingTest } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { Search, Filter } from 'lucide-react';

export const AdminTests: React.FC = () => {
  const [tests, setTests] = useState<DopingTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTests = async () => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const res = await testApi.list(params);
      setTests(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [statusFilter]);

  const filtered = tests.filter((t) =>
    `${t.test_number} ${t.athlete_name} ${t.sport} ${t.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Doping Test Register</h2>
        <p className="text-sm text-slate-500">Every authorized doping test order from planning to result verification.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, athlete, sport..."
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
              <option value="SCHEDULED">Scheduled</option>
              <option value="SAMPLE_COLLECTED">Sample Collected</option>
              <option value="SAMPLE_SUBMITTED">Sample Submitted</option>
              <option value="UNDER_ANALYSIS">Under Analysis</option>
              <option value="RESULT_GENERATED">Result Generated</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
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
              title="No tests found"
              description="No doping tests match your search criteria."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Test Reference</th>
                  <th className="py-3 px-4">Athlete</th>
                  <th className="py-3 px-4">Sport</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Officer</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/75">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-teal-700">
                      {t.test_number}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{t.athlete_name}</td>
                    <td className="py-3 px-4 text-slate-700">{t.sport}</td>
                    <td className="py-3 px-4 text-slate-600">{t.scheduled_date}</td>
                    <td className="py-3 px-4 text-slate-600">{t.test_type.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 text-slate-600">{t.officer_name || 'Unassigned'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={t.status} />
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

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sampleApi } from '../../api/operationsApi';
import { Sample } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { Search } from 'lucide-react';

export const LaboratorySamples: React.FC = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchSamples = async () => {
    try {
      const res = await sampleApi.list();
      setSamples(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  const filtered = samples.filter((s) =>
    `${s.sample_number} ${s.test_number} ${s.athlete_name} ${s.sample_type}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sample Intake & Custody</h2>
        <p className="text-sm text-slate-500">Biological specimens transferred to this accredited laboratory.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search sample #, test, or athlete..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
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
              title="No samples in custody"
              description="No samples matching the criteria."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Sample #</th>
                  <th className="py-3 px-4">Test Reference</th>
                  <th className="py-3 px-4">Athlete</th>
                  <th className="py-3 px-4">Specimen Type</th>
                  <th className="py-3 px-4">Collection Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/75">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-teal-700">{s.sample_number}</td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">{s.test_number}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{s.athlete_name}</td>
                    <td className="py-3 px-4 text-slate-600">{s.sample_type}</td>
                    <td className="py-3 px-4 text-slate-600">{s.collection_date}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/laboratory/samples/${s.id}`}
                        className="text-xs text-teal-600 hover:text-teal-800 font-semibold"
                      >
                        Intake / Process &rarr;
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

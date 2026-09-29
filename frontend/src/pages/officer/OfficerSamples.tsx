import React, { useEffect, useState } from 'react';
import { sampleApi } from '../../api/operationsApi';
import { Sample } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';

export const OfficerSamples: React.FC = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchSamples();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Officer Sample Custody Log</h2>
        <p className="text-sm text-slate-500">Biological specimens collected during your scheduled missions.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : samples.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No collected samples"
              description="You have not collected any biological samples yet."
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {samples.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/75">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-teal-700">{s.sample_number}</td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">{s.test_number}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{s.athlete_name}</td>
                    <td className="py-3 px-4 text-slate-600">{s.sample_type}</td>
                    <td className="py-3 px-4 text-slate-600">{s.collection_date}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={s.status} />
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

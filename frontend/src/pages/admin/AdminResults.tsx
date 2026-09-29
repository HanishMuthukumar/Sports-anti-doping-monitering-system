import React, { useEffect, useState } from 'react';
import { resultApi } from '../../api/operationsApi';
import { LaboratoryResult } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';

export const AdminResults: React.FC = () => {
  const [results, setResults] = useState<LaboratoryResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await resultApi.list();
        setResults(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Analytical Laboratory Results</h2>
        <p className="text-sm text-slate-500">Official certificate findings submitted by testing facilities.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : results.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No laboratory results"
              description="No analytical findings currently registered."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Sample #</th>
                  <th className="py-3 px-4">Athlete</th>
                  <th className="py-3 px-4">Laboratory</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Findings</th>
                  <th className="py-3 px-4">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/75">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-teal-700">
                      {r.sample_number}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{r.athlete_name}</td>
                    <td className="py-3 px-4 text-slate-700">{r.laboratory_name || 'Accredited Lab'}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-mono">{r.test_method}</td>
                    <td className="py-3 px-4 text-slate-800 max-w-xs truncate" title={r.findings}>
                      {r.findings}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.result_status} />
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

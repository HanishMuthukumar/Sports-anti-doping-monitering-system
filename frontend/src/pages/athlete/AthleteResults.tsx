import React, { useEffect, useState } from 'react';
import { resultApi } from '../../api/operationsApi';
import { LaboratoryResult } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';

export const AthleteResults: React.FC = () => {
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
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Laboratory Results</h2>
        <p className="text-sm text-slate-500">Official laboratory certifications and analytical findings.</p>
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
              description="No results have been certified for your samples yet."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Sample Reference</th>
                  <th className="py-3 px-4">Analyzing Laboratory</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Findings</th>
                  <th className="py-3 px-4">Analyzed At</th>
                  <th className="py-3 px-4">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/75">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-teal-700">{r.sample_number}</td>
                    <td className="py-3 px-4 text-slate-700">{r.laboratory_name || 'Accredited Lab'}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-mono">{r.test_method}</td>
                    <td className="py-3 px-4 text-slate-800">{r.findings}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{r.analyzed_at?.slice(0, 16).replace('T', ' ')}</td>
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

import React, { useEffect, useState } from 'react';
import { violationApi } from '../../api/operationsApi';
import { Violation } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';

export const AdminViolations: React.FC = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        const res = await violationApi.list();
        setViolations(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchViolations();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Anti-Doping Rule Violations</h2>
        <p className="text-sm text-slate-500">Official adverse analytical casework tracking and disciplinary proceedings.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : violations.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No violations on record"
              description="Zero active or historical anti-doping rule violations recorded."
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
                  <th className="py-3 px-4">Basis / Description</th>
                  <th className="py-3 px-4">Reviewed By</th>
                  <th className="py-3 px-4">Action Taken</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {violations.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/75">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-rose-700">
                      {v.violation_number}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{v.athlete_name}</td>
                    <td className="py-3 px-4 text-slate-700">{v.sport}</td>
                    <td className="py-3 px-4 text-slate-800 max-w-xs truncate" title={v.description}>
                      {v.description}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{v.reviewed_by_name || 'Pending Review'}</td>
                    <td className="py-3 px-4 text-slate-600">{v.action_taken || 'None'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={v.status} />
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

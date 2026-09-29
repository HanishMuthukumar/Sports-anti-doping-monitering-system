import React, { useEffect, useState } from 'react';
import { violationApi } from '../../api/operationsApi';
import { Violation } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';
import { ShieldCheck } from 'lucide-react';

export const AthleteViolations: React.FC = () => {
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
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Disciplinary & Compliance Cases</h2>
        <p className="text-sm text-slate-500">Official Anti-Doping Rule Violation (ADRV) tracking.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : violations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex p-4 rounded-full bg-emerald-100 text-emerald-600 mb-3">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Clean Athlete Record</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              You have no open or past rule violations. All testing results comply with the WADA Code.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Case #</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Action Taken</th>
                  <th className="py-3 px-4">Action Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {violations.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/75">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-rose-700">{v.violation_number}</td>
                    <td className="py-3 px-4 text-slate-800">{v.description}</td>
                    <td className="py-3 px-4 text-slate-700">{v.action_taken || 'Under Review'}</td>
                    <td className="py-3 px-4 text-slate-600">{v.action_date || '—'}</td>
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

import React, { useEffect, useState } from 'react';
import { testApi } from '../../api/operationsApi';
import { DopingTest } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';

export const AthleteTests: React.FC = () => {
  const [tests, setTests] = useState<DopingTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await testApi.list();
        setTests(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Testing Sessions</h2>
        <p className="text-sm text-slate-500">Scheduled and completed doping control appointments.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : tests.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No testing orders"
              description="No active or past doping tests found for your profile."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Test Reference</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Officer Assigned</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tests.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/75">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-teal-700">{t.test_number}</td>
                    <td className="py-3 px-4 text-slate-700">{t.scheduled_date}</td>
                    <td className="py-3 px-4 text-slate-600">{t.test_type.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 text-slate-600">{t.location}</td>
                    <td className="py-3 px-4 text-slate-600">{t.officer_name || 'Accredited DCO'}</td>
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

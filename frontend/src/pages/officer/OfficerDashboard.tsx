import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { testApi, sampleApi, reportApi } from '../../api/operationsApi';
import { DopingTest, Sample } from '../../types';
import { StatCard } from '../../components/shared/StatCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ClipboardList, PlusCircle, TestTubes, CheckCircle2, ArrowRight } from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const [tests, setTests] = useState<DopingTest[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tRes, sRes] = await Promise.all([testApi.list(), sampleApi.list()]);
        setTests(tRes);
        setSamples(sRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const scheduled = tests.filter((t) => t.status === 'SCHEDULED');
  const collected = tests.filter((t) => t.status === 'SAMPLE_COLLECTED');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">DCO Field Operations</h2>
          <p className="text-sm text-slate-500">Manage testing missions, athlete notifications, and chain-of-custody.</p>
        </div>
        <Link
          to="/officer/tests/create"
          className="inline-flex items-center justify-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-sm"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Schedule Testing Mission
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Assigned Tests"
          value={tests.length}
          icon={ClipboardList}
          subtitle="Total assigned missions"
        />
        <StatCard
          title="Pending Collection"
          value={scheduled.length}
          icon={ClipboardList}
          subtitle="Scheduled appointments"
          variant="warning"
        />
        <StatCard
          title="Samples Logged"
          value={samples.length}
          icon={TestTubes}
          subtitle="Under chain of custody"
          variant="success"
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Active Field Missions</h3>
          <Link to="/officer/tests" className="text-sm font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {tests.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 italic">No active missions assigned.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase">
                  <th className="py-2.5 px-3">Mission #</th>
                  <th className="py-2.5 px-3">Athlete</th>
                  <th className="py-2.5 px-3">Sport</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tests.slice(0, 5).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-xs font-semibold text-teal-700">{t.test_number}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{t.athlete_name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{t.sport}</td>
                    <td className="py-2.5 px-3 text-slate-600">{t.location}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        to={`/officer/tests/${t.id}`}
                        className="text-xs text-teal-600 hover:text-teal-800 font-semibold"
                      >
                        Details &rarr;
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

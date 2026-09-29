import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sampleApi, resultApi } from '../../api/operationsApi';
import { Sample, LaboratoryResult } from '../../types';
import { StatCard } from '../../components/shared/StatCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { TestTubes, FlaskConical, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const LaboratoryDashboard: React.FC = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [results, setResults] = useState<LaboratoryResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, rRes] = await Promise.all([sampleApi.list(), resultApi.list()]);
        setSamples(sRes);
        setResults(rRes);
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

  const incoming = samples.filter((s) => s.status === 'SUBMITTED');
  const analyzing = samples.filter((s) => s.status === 'UNDER_ANALYSIS' || s.status === 'RECEIVED');
  const positives = results.filter((r) => r.result_status === 'POSITIVE');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Laboratory Analytics Console</h2>
          <p className="text-sm text-slate-500">Accredited testing facility sample intake, screening, and certification.</p>
        </div>
        <Link
          to="/laboratory/results/create"
          className="inline-flex items-center justify-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-sm"
        >
          <FlaskConical className="w-4 h-4 mr-2" />
          Certify Analytical Result
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <StatCard
          title="Incoming In Transit"
          value={incoming.length}
          icon={TestTubes}
          subtitle="Awaiting lab receipt"
          variant="warning"
        />
        <StatCard
          title="In Screening"
          value={analyzing.length}
          icon={FlaskConical}
          subtitle="Currently under analysis"
          variant="default"
        />
        <StatCard
          title="Results Certified"
          value={results.length}
          icon={CheckCircle2}
          subtitle="Certificates issued"
          variant="success"
        />
        <StatCard
          title="Adverse Findings"
          value={positives.length}
          icon={AlertTriangle}
          subtitle="Reported positives"
          variant="danger"
        />
      </div>

      {/* Samples Pending Action */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Samples Pending Receipt or Analysis</h3>
          <Link to="/laboratory/samples" className="text-sm font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center">
            View All Samples <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {samples.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 italic">No active samples in custody.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase">
                  <th className="py-2.5 px-3">Sample #</th>
                  <th className="py-2.5 px-3">Athlete</th>
                  <th className="py-2.5 px-3">Specimen</th>
                  <th className="py-2.5 px-3">Collected Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {samples.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-xs font-semibold text-teal-700">{s.sample_number}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{s.athlete_name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{s.sample_type}</td>
                    <td className="py-2.5 px-3 text-slate-600">{s.collection_date}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-2.5 px-3 text-right">
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

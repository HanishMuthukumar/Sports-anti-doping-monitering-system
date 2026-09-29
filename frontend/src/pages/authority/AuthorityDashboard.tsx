import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { violationApi } from '../../api/operationsApi';
import { Violation } from '../../types';
import { StatCard } from '../../components/shared/StatCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { AlertTriangle, Clock, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

export const AuthorityDashboard: React.FC = () => {
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

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const openCases = violations.filter((v) => v.status === 'OPEN');
  const underReview = violations.filter((v) => v.status === 'UNDER_REVIEW');
  const actionTaken = violations.filter((v) => v.status === 'ACTION_TAKEN');
  const closed = violations.filter((v) => v.status === 'CLOSED');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sports Authority Casework Command</h2>
        <p className="text-sm text-slate-500">
          Disciplinary oversight, hearing administration, and anti-doping rule enforcement.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <StatCard
          title="Open Violations"
          value={openCases.length}
          icon={AlertTriangle}
          subtitle="New adverse findings"
          variant="danger"
        />
        <StatCard
          title="Under Review"
          value={underReview.length}
          icon={Clock}
          subtitle="Tribunal review active"
          variant="warning"
        />
        <StatCard
          title="Sanction Imposed"
          value={actionTaken.length}
          icon={ShieldAlert}
          subtitle="Suspensions / rulings"
        />
        <StatCard
          title="Cases Closed"
          value={closed.length}
          icon={CheckCircle2}
          subtitle="Concluded adjudications"
          variant="success"
        />
      </div>

      {/* Casework Queue */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Active Adjudication Queue</h3>
          <Link to="/authority/violations" className="text-sm font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center">
            All Violations <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {violations.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 italic">No active violation cases on record.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase">
                  <th className="py-2.5 px-3">Case Reference</th>
                  <th className="py-2.5 px-3">Athlete</th>
                  <th className="py-2.5 px-3">Sport</th>
                  <th className="py-2.5 px-3">Adverse Finding</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Adjudication</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {violations.slice(0, 5).map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-xs font-semibold text-rose-700">
                      {v.violation_number}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{v.athlete_name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{v.sport}</td>
                    <td className="py-2.5 px-3 text-slate-800 max-w-xs truncate" title={v.description}>
                      {v.description}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        to={`/authority/violations/${v.id}`}
                        className="text-xs text-teal-600 hover:text-teal-800 font-semibold"
                      >
                        Review Case &rarr;
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

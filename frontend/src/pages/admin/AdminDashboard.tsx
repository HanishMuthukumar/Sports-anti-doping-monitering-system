import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportApi } from '../../api/operationsApi';
import { userApi } from '../../api/entitiesApi';
import { DashboardSummary } from '../../types';
import { StatCard } from '../../components/shared/StatCard';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import {
  Users,
  UserCheck,
  ShieldAlert,
  Building2,
  ClipboardList,
  CheckCircle2,
  TestTubes,
  AlertTriangle,
  Flame,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const [res, pending] = await Promise.all([
          reportApi.getDashboardSummary(),
          userApi.getPending(),
        ]);
        setData(res);
        setPendingCount(pending.length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Programme Overview</h2>
          <p className="text-sm text-slate-300">
            Live statistics across testing operations, chain of custody, and rule violations.
          </p>
        </div>
        {pendingCount > 0 && (
          <Link
            to="/admin/verifications"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{pendingCount} Verifications Awaiting Review</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        )}
      </div>

      {pendingCount > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3 text-amber-200 text-sm">
            <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Action Required:</strong> {pendingCount} new user(s) (Athletes, Lab Staff, or Officers) have registered and require administrator accreditation verification before their accounts are unlocked.
            </span>
          </div>
          <Link
            to="/admin/verifications"
            className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs whitespace-nowrap ml-4 transition-colors"
          >
            Review Now
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Users"
          value={data?.total_users ?? 0}
          icon={Users}
          subtitle="System wide registered users"
        />
        <StatCard
          title="Active Athletes"
          value={data?.total_athletes ?? 0}
          icon={UserCheck}
          subtitle="Registered athletes"
        />
        <StatCard
          title="Doping Control Officers"
          value={data?.total_officers ?? 0}
          icon={ShieldAlert}
          subtitle="Accredited DCOs"
        />
        <StatCard
          title="Accredited Laboratories"
          value={data?.total_laboratories ?? 0}
          icon={Building2}
          subtitle="WADA-accredited labs"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Scheduled Tests"
          value={data?.scheduled_tests ?? 0}
          icon={ClipboardList}
          subtitle="Upcoming appointments"
          variant="warning"
        />
        <StatCard
          title="Completed Tests"
          value={data?.completed_tests ?? 0}
          icon={CheckCircle2}
          subtitle="Successfully concluded"
          variant="success"
        />
        <StatCard
          title="Total Samples"
          value={data?.total_samples ?? 0}
          icon={TestTubes}
          subtitle="Collected & tracked"
        />
        <StatCard
          title="Positive Findings"
          value={data?.positive_results ?? 0}
          icon={Flame}
          subtitle="Adverse analytical findings"
          variant="danger"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard
          title="Total Violations Logged"
          value={data?.total_violations ?? 0}
          icon={AlertTriangle}
          subtitle="Anti-doping rule violations"
          variant="danger"
        />
        <StatCard
          title="Open Violations Requiring Action"
          value={data?.open_violations ?? 0}
          icon={AlertTriangle}
          subtitle="Under active review"
          variant="warning"
        />
      </div>
    </div>
  );
};

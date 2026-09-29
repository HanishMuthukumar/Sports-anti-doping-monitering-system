import React, { useEffect, useState } from 'react';
import { reportApi } from '../../api/operationsApi';
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
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const res = await reportApi.getDashboardSummary();
        setData(res);
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
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Programme Overview</h2>
        <p className="text-sm text-slate-500">
          Live statistics across testing operations, chain of custody, and rule violations.
        </p>
      </div>

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

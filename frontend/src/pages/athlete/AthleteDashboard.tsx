import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { testApi, violationApi, notificationApi } from '../../api/operationsApi';
import { DopingTest, Violation, Notification } from '../../types';
import { StatCard } from '../../components/shared/StatCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ClipboardList, AlertTriangle, Bell, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AthleteDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState<DopingTest[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tRes, vRes, nRes] = await Promise.all([
          testApi.list(),
          violationApi.list(),
          notificationApi.list(),
        ]);
        setTests(tRes);
        setViolations(vRes);
        setNotifications(nRes);
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

  const upcomingTests = tests.filter((t) => t.status === 'SCHEDULED');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome, {user?.first_name}
          </h2>
          <p className="text-sm text-slate-500">
            Athlete compliance portal: view authorized testing appointments, custody receipts, and notifications.
          </p>
        </div>
        <div className="inline-flex items-center px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold rounded-full">
          <ShieldCheck className="w-4 h-4 mr-1 text-teal-600" />
          Biological Profile Active
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Upcoming Tests"
          value={upcomingTests.length}
          icon={ClipboardList}
          subtitle="Scheduled testing sessions"
          variant="warning"
        />
        <StatCard
          title="Total Lifetime Tests"
          value={tests.length}
          icon={ClipboardList}
          subtitle="In-competition & out-of-competition"
          variant="default"
        />
        <StatCard
          title="Casework Inquiries"
          value={violations.length}
          icon={AlertTriangle}
          subtitle={violations.length === 0 ? 'Clear record' : 'Requires attention'}
          variant={violations.length === 0 ? 'success' : 'danger'}
        />
      </div>

      {/* Upcoming / Recent Tests */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Recent Testing Appointments</h3>
          <Link to="/athlete/tests" className="text-sm font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {tests.length === 0 ? (
          <p className="text-sm text-slate-500 italic py-4">No testing records found for your account.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase">
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tests.slice(0, 3).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-xs font-semibold text-teal-700">{t.test_number}</td>
                    <td className="py-2.5 px-3 text-slate-700">{t.scheduled_date}</td>
                    <td className="py-2.5 px-3 text-slate-600">{t.test_type.replace(/_/g, ' ')}</td>
                    <td className="py-2.5 px-3 text-slate-600">{t.location}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notifications preview */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Bell className="w-4 h-4 text-teal-600" />
            <span>Latest Programme Notices</span>
          </h3>
          <Link to="/athlete/notifications" className="text-sm font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center">
            All Notifications <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {notifications.length === 0 ? (
          <p className="text-sm text-slate-500 italic py-2">No new notices.</p>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 3).map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-lg border text-sm ${
                  n.is_read ? 'bg-slate-50/50 border-slate-200' : 'bg-teal-50/40 border-teal-200'
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>{n.title}</span>
                  <span className="text-xs text-slate-400 font-normal">{n.created_at?.slice(0, 10)}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

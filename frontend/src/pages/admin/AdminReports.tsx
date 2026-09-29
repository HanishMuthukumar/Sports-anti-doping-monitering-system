import React, { useEffect, useState } from 'react';
import { reportApi } from '../../api/operationsApi';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { Download, Calendar, Filter } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const [monthly, setMonthly] = useState<Array<{ month: string; tests: number; positive: number; negative: number; violations: number }>>([]);
  const [labReport, setLabReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [mRes, lRes] = await Promise.all([
          reportApi.getMonthlySummary(),
          reportApi.getLaboratoryReport(),
        ]);
        setMonthly(mRes);
        setLabReport(lRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleExportTestingCSV = () => {
    window.open(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/reports/testing/?format=csv`, '_blank');
  };

  const handleExportViolationsCSV = () => {
    window.open(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/reports/violations/?format=csv`, '_blank');
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Intelligence & Operational Reports</h2>
          <p className="text-sm text-slate-500">Live database aggregations, throughput analysis, and CSV export.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExportTestingCSV}
            className="inline-flex items-center px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
          >
            <Download className="w-4 h-4 mr-2 text-slate-500" />
            Export Testing CSV
          </button>
          <button
            onClick={handleExportViolationsCSV}
            className="inline-flex items-center px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
          >
            <Download className="w-4 h-4 mr-2 text-slate-500" />
            Export Violations CSV
          </button>
        </div>
      </div>

      {/* Monthly Testing Breakdown */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          <span>Monthly Programme Throughput</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Reporting Month</th>
                <th className="py-3 px-4">Tests Conducted</th>
                <th className="py-3 px-4">Negative Findings</th>
                <th className="py-3 px-4">Positive Findings</th>
                <th className="py-3 px-4">Violations Opened</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {monthly.map((m) => (
                <tr key={m.month} className="hover:bg-slate-50/75">
                  <td className="py-3 px-4 font-semibold text-slate-900">{m.month}</td>
                  <td className="py-3 px-4 text-slate-800">{m.tests}</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">{m.negative}</td>
                  <td className="py-3 px-4 text-rose-600 font-semibold">{m.positive}</td>
                  <td className="py-3 px-4 text-amber-600 font-semibold">{m.violations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Laboratory Turnaround & Processing */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Laboratory Turnaround & Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Facility Name</th>
                <th className="py-3 px-4">Accreditation</th>
                <th className="py-3 px-4">City / Country</th>
                <th className="py-3 px-4">Total Samples Analyzed</th>
                <th className="py-3 px-4">Positives</th>
                <th className="py-3 px-4">Negatives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {labReport.map((lab) => (
                <tr key={lab.id} className="hover:bg-slate-50/75">
                  <td className="py-3 px-4 font-medium text-slate-900">{lab.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-teal-700">{lab.accreditation}</td>
                  <td className="py-3 px-4 text-slate-600">{lab.city}, {lab.country}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{lab.total_analyzed}</td>
                  <td className="py-3 px-4 text-rose-600 font-semibold">{lab.positive}</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">{lab.negative}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

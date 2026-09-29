import React, { useEffect, useState } from 'react';
import { officerApi } from '../../api/entitiesApi';
import { DopingControlOfficer } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/shared/EmptyState';

export const AdminOfficers: React.FC = () => {
  const [officers, setOfficers] = useState<DopingControlOfficer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const res = await officerApi.list();
        setOfficers(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOfficers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Doping Control Officers</h2>
        <p className="text-sm text-slate-500">Accredited sample collection officers in the field.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : officers.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No officers found"
              description="No doping control officers registered in the system."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">Officer ID</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Certification #</th>
                  <th className="py-3.5 px-4">Organization</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {officers.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/75">
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-teal-700">
                      {o.officer_id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{o.full_name}</td>
                    <td className="py-3.5 px-4 text-slate-700">{o.certification_number || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-600">{o.organization || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-600">{o.email}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={o.status} />
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

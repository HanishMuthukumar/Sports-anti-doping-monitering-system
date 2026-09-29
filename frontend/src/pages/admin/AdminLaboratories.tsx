import React, { useEffect, useState } from 'react';
import { laboratoryApi } from '../../api/entitiesApi';
import { Laboratory, LaboratoryStaff } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Building2, Users } from 'lucide-react';

export const AdminLaboratories: React.FC = () => {
  const [labs, setLabs] = useState<Laboratory[]>([]);
  const [staff, setStaff] = useState<LaboratoryStaff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lRes, sRes] = await Promise.all([
          laboratoryApi.list(),
          laboratoryApi.listStaff(),
        ]);
        setLabs(lRes);
        setStaff(sRes);
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

  return (
    <div className="space-y-8">
      {/* Laboratories Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-teal-600" />
            <span>Accredited Laboratories</span>
          </h2>
          <p className="text-sm text-slate-500">Authorized testing facilities handling analytical screening.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {labs.map((lab) => (
            <div key={lab.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{lab.laboratory_name}</h3>
                  <p className="font-mono text-xs text-teal-700 font-semibold">{lab.accreditation_number}</p>
                </div>
                <StatusBadge status={lab.status} />
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p>{lab.address}, {lab.city}, {lab.country}</p>
                <p>Phone: {lab.phone || '—'} | Email: {lab.email || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-5 h-5 text-teal-600" />
            <span>Laboratory Personnel</span>
          </h3>
          <p className="text-sm text-slate-500">Accredited scientists and analysts.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Staff ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Laboratory</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/75">
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-teal-700">{s.staff_id}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{s.full_name}</td>
                  <td className="py-3 px-4 text-slate-700">{s.laboratory_name}</td>
                  <td className="py-3 px-4 text-slate-600">{s.designation || '—'}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { violationApi } from '../../api/operationsApi';
import { Violation, ViolationStatus } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { ArrowLeft, Gavel, Scale, AlertOctagon, CheckCircle } from 'lucide-react';

export const AuthorityViolationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [violation, setViolation] = useState<Violation | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetStatus, setTargetStatus] = useState<ViolationStatus>('UNDER_REVIEW');
  const [remarks, setRemarks] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [actionDate, setActionDate] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  const fetchViolation = async () => {
    if (!id) return;
    try {
      const v = await violationApi.get(id);
      setViolation(v);
      if (v.status === 'OPEN') setTargetStatus('UNDER_REVIEW');
      else if (v.status === 'UNDER_REVIEW') setTargetStatus('ACTION_TAKEN');
      else if (v.status === 'ACTION_TAKEN') setTargetStatus('CLOSED');
      else setTargetStatus('CLOSED');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolation();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await violationApi.review(id, {
        status: targetStatus,
        remarks,
        action_taken: actionTaken,
        action_date: actionDate,
      });
      setRemarks('');
      setActionTaken('');
      await fetchViolation();
    } catch (err: any) {
      alert(err.response?.data?.status?.[0] || err.response?.data?.detail || 'Review transition failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!violation) {
    return <div className="p-8 text-center text-slate-500">Violation record not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/authority/violations')}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Case {violation.violation_number}</h2>
          <p className="text-sm text-slate-500">Athlete: {violation.athlete_name} ({violation.sport})</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={violation.status} />
        </div>
      </div>

      {/* Case Overview Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-900">
          <Scale className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-base">Evidentiary Record</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Athlete License</span>
            <p className="font-mono text-xs font-bold text-slate-800">{violation.athlete_id_code}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Sport Discipline</span>
            <p className="font-medium text-slate-800">{violation.sport}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Test Reference</span>
            <p className="font-mono text-xs text-slate-800">{violation.test_number || 'Linked Test'}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Sample Barcode</span>
            <p className="font-mono text-xs text-slate-800">{violation.sample_number || 'Specimen'}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Case Opened</span>
            <p className="font-medium text-slate-800">{violation.created_at?.slice(0, 10)}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Reviewing Official</span>
            <p className="font-medium text-slate-800">{violation.reviewed_by_name || 'Pending Assignment'}</p>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <span className="text-xs text-slate-400 font-semibold uppercase">Adverse Analytical Finding Basis</span>
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-lg text-sm font-medium mt-1">
              {violation.description}
            </div>
          </div>
          {violation.action_taken && (
            <div className="col-span-2 sm:col-span-3">
              <span className="text-xs text-slate-400 font-semibold uppercase">Disciplinary Decision / Sanction</span>
              <div className="p-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-sm mt-1">
                <strong>Action:</strong> {violation.action_taken}
                {violation.action_date && <span className="block text-xs text-slate-500 mt-1">Effective Date: {violation.action_date}</span>}
              </div>
            </div>
          )}
          {violation.remarks && (
            <div className="col-span-2 sm:col-span-3">
              <span className="text-xs text-slate-400 font-semibold uppercase">Hearing Panel Remarks</span>
              <pre className="text-xs bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-700 whitespace-pre-wrap font-mono mt-1">
                {violation.remarks}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Adjudication Panel Action Box */}
      {violation.status !== 'CLOSED' && (
        <div className="bg-white p-6 rounded-xl border-2 border-teal-600 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-teal-900">
            <Gavel className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-base">Authority Tribunal Review & Adjudication</h3>
          </div>

          <form onSubmit={handleReviewSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600">Advance Case Status</label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as ViolationStatus)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium"
              >
                {violation.status === 'OPEN' && (
                  <option value="UNDER_REVIEW">UNDER_REVIEW — Open Formal Hearing & Case Review</option>
                )}
                {violation.status === 'UNDER_REVIEW' && (
                  <option value="ACTION_TAKEN">ACTION_TAKEN — Issue Ruling / Impose Sanction</option>
                )}
                {violation.status === 'ACTION_TAKEN' && (
                  <option value="CLOSED">CLOSED — Conclude Case & Close Docket</option>
                )}
              </select>
            </div>

            {targetStatus === 'ACTION_TAKEN' && (
              <div className="space-y-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div>
                  <label className="block text-xs font-semibold uppercase text-amber-900">Sanction / Ruling Text</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. 2-year period of ineligibility under WADA Code Article 10.2; disqualification of results."
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-amber-900">Sanction Effective Date</label>
                  <input
                    type="date"
                    required
                    value={actionDate}
                    onChange={(e) => setActionDate(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600">Review Notes / Tribunal Remarks</label>
              <textarea
                rows={3}
                placeholder="Enter evidentiary findings, athlete statement summary, or tribunal decree..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-sm shadow-sm disabled:opacity-50"
            >
              {submitting ? <LoadingSpinner size="sm" /> : <><CheckCircle className="w-4 h-4 mr-2" /> Apply Adjudication Update</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

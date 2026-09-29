import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sampleApi } from '../../api/operationsApi';
import { Sample } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { ArrowLeft, CheckCircle2, Play, FlaskConical } from 'lucide-react';

export const LaboratorySampleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sample, setSample] = useState<Sample | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSample = async () => {
    if (!id) return;
    try {
      const s = await sampleApi.get(id);
      setSample(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSample();
  }, [id]);

  const handleTransition = async (newStatus: string) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await sampleApi.transition(id, newStatus, notes);
      setNotes('');
      await fetchSample();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Transition failed');
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

  if (!sample) {
    return <div className="p-8 text-center text-slate-500">Sample not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/laboratory/samples')}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sample {sample.sample_number}</h2>
          <p className="text-sm text-slate-500">Test Reference: {sample.test_number} ({sample.sample_type})</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={sample.status} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Intake & Chain of Custody Record</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Athlete Name</span>
            <p className="font-medium text-slate-800">{sample.athlete_name}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Specimen</span>
            <p className="font-medium text-slate-800">{sample.sample_type}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Collection Date</span>
            <p className="font-medium text-slate-800">{sample.collection_date}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Collected By DCO</span>
            <p className="font-medium text-slate-800">{sample.collected_by_name || 'Accredited DCO'}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Dispatched At</span>
            <p className="font-medium text-slate-800">{sample.submitted_at?.slice(0, 16).replace('T', ' ') || 'Pending'}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Received At Lab</span>
            <p className="font-medium text-slate-800">{sample.received_at?.slice(0, 16).replace('T', ' ') || 'Pending'}</p>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <span className="text-xs text-slate-400 font-semibold uppercase">Chain of Custody Timeline</span>
            <pre className="text-xs bg-slate-50 p-3 rounded border border-slate-200 text-slate-700 whitespace-pre-wrap font-mono mt-1">
              {sample.chain_of_custody_notes || 'Initial record.'}
            </pre>
          </div>
        </div>
      </div>

      {/* Action: Mark Received */}
      {sample.status === 'SUBMITTED' && (
        <div className="bg-white p-6 rounded-xl border-2 border-teal-500 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-teal-800">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-base">Verify Security Seals & Receive Sample</h3>
          </div>
          <p className="text-sm text-slate-600">
            Confirm container integrity, tamper-evident tape, and temperature logs upon arrival at the laboratory.
          </p>
          <input
            type="text"
            placeholder="e.g. Tamper tape intact, barcode verified against mission manifest."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <button
            onClick={() => handleTransition('RECEIVED')}
            disabled={submitting}
            className="w-full flex items-center justify-center py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-sm shadow-sm disabled:opacity-50"
          >
            {submitting ? <LoadingSpinner size="sm" /> : 'Confirm Sample Receipt'}
          </button>
        </div>
      )}

      {/* Action: Start Analysis */}
      {sample.status === 'RECEIVED' && (
        <div className="bg-white p-6 rounded-xl border-2 border-blue-500 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-blue-800">
            <Play className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base">Commence Analytical Testing Protocol</h3>
          </div>
          <p className="text-sm text-slate-600">
            Initiate automated aliquoting, screening runs, and analytical chromatography.
          </p>
          <input
            type="text"
            placeholder="e.g. Aliquot A prepared for LC-MS/MS screen."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <button
            onClick={() => handleTransition('UNDER_ANALYSIS')}
            disabled={submitting}
            className="w-full flex items-center justify-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow-sm disabled:opacity-50"
          >
            {submitting ? <LoadingSpinner size="sm" /> : 'Start Laboratory Analysis'}
          </button>
        </div>
      )}

      {/* Action: Record Result Link */}
      {sample.status === 'UNDER_ANALYSIS' && (
        <div className="bg-white p-6 rounded-xl border-2 border-emerald-500 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-emerald-800">
            <FlaskConical className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base">Sample Under Active Screening</h3>
          </div>
          <p className="text-sm text-slate-600">
            Analysis is underway. Once chromatography and spectrometric runs complete, certify the analytical findings.
          </p>
          <Link
            to="/laboratory/results/create"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm shadow-sm"
          >
            Certify Result for This Sample &rarr;
          </Link>
        </div>
      )}
    </div>
  );
};

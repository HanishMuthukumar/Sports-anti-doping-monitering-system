import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testApi, sampleApi } from '../../api/operationsApi';
import { DopingTest, Sample } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { ArrowLeft, CheckCircle, Send, TestTube } from 'lucide-react';

export const OfficerTestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<DopingTest | null>(null);
  const [sample, setSample] = useState<Sample | null>(null);
  const [loading, setLoading] = useState(true);
  const [sampleType, setSampleType] = useState<'URINE' | 'BLOOD'>('URINE');
  const [actionNotes, setActionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      const t = await testApi.get(id);
      setTest(t);
      const allSamples = await sampleApi.list();
      const s = allSamples.find((item: any) => item.doping_test === id || item.test_number === t.test_number);
      if (s) setSample(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleCollectSample = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      const newSample = await sampleApi.create({
        doping_test: id,
        sample_type: sampleType,
        collection_date: new Date().toISOString().slice(0, 10),
        chain_of_custody_notes: actionNotes || 'Sample collected under full chain of custody protocol.',
      });
      setSample(newSample);
      setActionNotes('');
      await fetchDetails();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to collect sample');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitToLab = async () => {
    if (!sample) return;
    setSubmitting(true);
    try {
      await sampleApi.transition(sample.id, 'SUBMITTED', actionNotes || 'Transferred to accredited laboratory courier.');
      setActionNotes('');
      await fetchDetails();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit sample');
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

  if (!test) {
    return <div className="p-8 text-center text-slate-500">Test not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/officer/tests')}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Mission {test.test_number}</h2>
          <p className="text-sm text-slate-500">Athlete: {test.athlete_name} ({test.sport})</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={test.status} />
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Mission Parameters</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Scheduled Date</span>
            <p className="font-medium text-slate-800">{test.scheduled_date}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Testing Protocol</span>
            <p className="font-medium text-slate-800">{test.test_type.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Location</span>
            <p className="font-medium text-slate-800">{test.location}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Assigned DCO</span>
            <p className="font-medium text-slate-800">{test.officer_name || 'Accredited Officer'}</p>
          </div>
          <div className="sm:col-span-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Log / Instructions</span>
            <p className="font-medium text-slate-800">{test.notes || 'No extra remarks'}</p>
          </div>
        </div>
      </div>

      {/* Sample Collection Action Box */}
      {test.status === 'SCHEDULED' && !sample && (
        <div className="bg-white p-6 rounded-xl border-2 border-teal-500 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-teal-700">
            <TestTube className="w-5 h-5" />
            <h3 className="font-bold text-base">Step 1: Collect Biological Sample</h3>
          </div>
          <p className="text-sm text-slate-600">
            Verify athlete identification and witness sample provision according to WADA International Standard for Testing.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600">Sample Specimen Type</label>
              <select
                value={sampleType}
                onChange={(e) => setSampleType(e.target.value as any)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="URINE">Urine Sample (A and B Bottles)</option>
                <option value="BLOOD">Blood Sample (EDTA / Gel Tubes)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600">Chain of Custody Notes</label>
              <input
                type="text"
                placeholder="e.g. Specific gravity 1.020 verified; sealed by athlete."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <button
              onClick={handleCollectSample}
              disabled={submitting}
              className="w-full flex items-center justify-center py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-sm shadow-sm disabled:opacity-50"
            >
              {submitting ? <LoadingSpinner size="sm" /> : <><CheckCircle className="w-4 h-4 mr-2" /> Log Sample Collected</>}
            </button>
          </div>
        </div>
      )}

      {/* Sample Dispatch Action Box */}
      {sample && sample.status === 'COLLECTED' && (
        <div className="bg-white p-6 rounded-xl border-2 border-blue-500 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-blue-700">
            <Send className="w-5 h-5" />
            <h3 className="font-bold text-base">Step 2: Dispatch Sample to Accredited Laboratory</h3>
          </div>
          <p className="text-sm text-slate-600">
            Sample <span className="font-mono font-bold text-teal-800">{sample.sample_number}</span> is sealed and awaiting laboratory handover.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600">Courier / Shipping Notes</label>
              <input
                type="text"
                placeholder="e.g. Courier tracking #7789412 - temperature monitored container"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <button
              onClick={handleSubmitToLab}
              disabled={submitting}
              className="w-full flex items-center justify-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow-sm disabled:opacity-50"
            >
              {submitting ? <LoadingSpinner size="sm" /> : <><Send className="w-4 h-4 mr-2" /> Dispatch Sample to Lab</>}
            </button>
          </div>
        </div>
      )}

      {/* Sample Information Card if available */}
      {sample && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-base">Sample Custody Receipt</h4>
            <StatusBadge status={sample.status} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">Sample Number</span>
              <p className="font-mono font-bold text-teal-700">{sample.sample_number}</p>
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
              <span className="text-xs text-slate-400 font-semibold uppercase">Submitted to Lab At</span>
              <p className="font-medium text-slate-800">{sample.submitted_at || 'Pending Dispatch'}</p>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-slate-400 font-semibold uppercase">Chain of Custody Record</span>
              <pre className="text-xs bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-700 whitespace-pre-wrap font-mono mt-1">
                {sample.chain_of_custody_notes || 'Initial record created.'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

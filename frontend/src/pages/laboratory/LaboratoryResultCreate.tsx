import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { sampleApi, resultApi } from '../../api/operationsApi';
import { Sample } from '../../types';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';

const resultCreateSchema = z.object({
  sample: z.string().min(1, 'Please select a sample'),
  result_status: z.enum(['NEGATIVE', 'POSITIVE', 'INVALID', 'INCONCLUSIVE']),
  test_method: z.string().min(2, 'Testing methodology is required'),
  findings: z.string().min(3, 'Analytical findings statement is required'),
  comments: z.string().optional(),
  report_reference: z.string().optional(),
});

type ResultCreateFormData = z.infer<typeof resultCreateSchema>;

export const LaboratoryResultCreate: React.FC = () => {
  const navigate = useNavigate();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResultCreateFormData>({
    resolver: zodResolver(resultCreateSchema),
    defaultValues: {
      result_status: 'NEGATIVE',
      test_method: 'LC-MS/MS & GC-MS Screening',
      findings: 'Negative for all prohibited substances on the WADA Prohibited List.',
    },
  });

  const selectedStatus = watch('result_status');

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const res = await sampleApi.list();
        // Eligible samples: UNDER_ANALYSIS or RECEIVED
        setSamples(res.filter((s: any) => s.status === 'UNDER_ANALYSIS' || s.status === 'RECEIVED'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSamples();
  }, []);

  const onSubmit = async (data: ResultCreateFormData) => {
    try {
      await resultApi.create(data);
      navigate('/laboratory/results');
    } catch (err: any) {
      alert(err.response?.data?.detail || err.response?.data?.sample?.[0] || 'Submission failed');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/laboratory/results')}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Issue Certificate of Analysis</h2>
          <p className="text-sm text-slate-500">Record certified analytical finding for a biological specimen.</p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Sample for Analysis</label>
            <select
              {...register('sample')}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              <option value="">-- Choose Sample Under Analysis --</option>
              {samples.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.sample_number} — {s.athlete_name} ({s.sample_type})
                </option>
              ))}
            </select>
            {errors.sample && (
              <p className="text-xs text-rose-600 mt-1">{errors.sample.message}</p>
            )}
            {samples.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Notice: No samples are currently under analysis. Go to Sample Intake to start analysis on received samples.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Analytical Outcome</label>
            <select
              {...register('result_status')}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-semibold"
            >
              <option value="NEGATIVE" className="text-emerald-700 font-bold">NEGATIVE (No Prohibited Substances Found)</option>
              <option value="POSITIVE" className="text-rose-700 font-bold">POSITIVE (Adverse Analytical Finding)</option>
              <option value="INCONCLUSIVE" className="text-amber-700 font-bold">INCONCLUSIVE (Atypical Finding)</option>
              <option value="INVALID" className="text-slate-700 font-bold">INVALID (Degraded / Dilute Specimen)</option>
            </select>
          </div>

          {selectedStatus === 'POSITIVE' && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-3 text-rose-900 text-xs">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <div>
                <strong className="block font-semibold text-sm text-rose-950 mb-0.5">
                  Adverse Analytical Finding Protocol
                </strong>
                Submitting a POSITIVE result will atomically trigger an Anti-Doping Rule Violation (ADRV), notify the Sports Authority for legal review, and send an alert to the athlete.
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700">Testing Methodology</label>
            <input
              type="text"
              placeholder="e.g. Gas Chromatography / Tandem Mass Spectrometry (GC-MS/MS)"
              {...register('test_method')}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            {errors.test_method && (
              <p className="text-xs text-rose-600 mt-1">{errors.test_method.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Detailed Analytical Findings</label>
            <textarea
              rows={3}
              placeholder="State chemical metabolites detected, quantification values, specific gravity, etc."
              {...register('findings')}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            {errors.findings && (
              <p className="text-xs text-rose-600 mt-1">{errors.findings.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Certificate / Report Reference</label>
              <input
                type="text"
                placeholder="e.g. LAB-CERT-2026-004"
                {...register('report_reference')}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Additional Remarks</label>
              <input
                type="text"
                placeholder="Optional analyst observations"
                {...register('comments')}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/laboratory/results')}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'Certify & Record Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

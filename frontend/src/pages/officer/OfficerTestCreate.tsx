import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { testApi } from '../../api/operationsApi';
import { athleteApi } from '../../api/entitiesApi';
import { Athlete } from '../../types';
import { ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';

const testCreateSchema = z.object({
  athlete: z.string().min(1, 'Please select an athlete'),
  scheduled_date: z.string().min(1, 'Date is required'),
  scheduled_time: z.string().optional(),
  test_type: z.enum(['IN_COMPETITION', 'OUT_OF_COMPETITION', 'TARGETED', 'FOLLOW_UP']),
  location: z.string().min(2, 'Location is required'),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

type TestCreateFormData = z.infer<typeof testCreateSchema>;

export const OfficerTestCreate: React.FC = () => {
  const navigate = useNavigate();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TestCreateFormData>({
    resolver: zodResolver(testCreateSchema),
    defaultValues: {
      test_type: 'OUT_OF_COMPETITION',
    },
  });

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const res = await athleteApi.list();
        setAthletes(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAthletes();
  }, []);

  const onSubmit = async (data: TestCreateFormData) => {
    try {
      await testApi.create(data);
      navigate('/officer/tests');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to schedule test');
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
          onClick={() => navigate('/officer/tests')}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Order Testing Mission</h2>
          <p className="text-sm text-slate-500">Authorize a targeted or routine sample collection protocol.</p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Select Athlete</label>
            <select
              {...register('athlete')}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              <option value="">-- Choose Athlete --</option>
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.full_name} ({a.athlete_id} - {a.sport})
                </option>
              ))}
            </select>
            {errors.athlete && (
              <p className="text-xs text-rose-600 mt-1">{errors.athlete.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Scheduled Date</label>
              <input
                type="date"
                {...register('scheduled_date')}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              {errors.scheduled_date && (
                <p className="text-xs text-rose-600 mt-1">{errors.scheduled_date.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Testing Type</label>
              <select
                {...register('test_type')}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="IN_COMPETITION">In-Competition</option>
                <option value="OUT_OF_COMPETITION">Out-of-Competition</option>
                <option value="TARGETED">Targeted</option>
                <option value="FOLLOW_UP">Follow-Up</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Testing Location / Facility</label>
            <input
              type="text"
              placeholder="e.g. National Velodrome, Olympic Training Center"
              {...register('location')}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            {errors.location && (
              <p className="text-xs text-rose-600 mt-1">{errors.location.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Testing Mission Justification / Notes</label>
            <textarea
              rows={3}
              placeholder="Optional notes regarding testing protocol, whereabouts compliance, etc."
              {...register('notes')}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/officer/tests')}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-50"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'Authorize Mission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

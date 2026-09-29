import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { athleteApi } from '../../api/entitiesApi';
import { ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';

const athleteCreateSchema = z.object({
  athlete_id: z.string().min(3, 'Athlete ID required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Minimum 6 chars'),
  sport: z.string().min(1, 'Sport discipline is required'),
  nationality: z.string().optional(),
  gender: z.string().optional(),
  team: z.string().optional(),
  coach: z.string().optional(),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
});

type AthleteCreateFormData = z.infer<typeof athleteCreateSchema>;

export const AdminAthleteCreate: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AthleteCreateFormData>({
    resolver: zodResolver(athleteCreateSchema),
  });

  const onSubmit = async (data: AthleteCreateFormData) => {
    try {
      await athleteApi.create(data);
      navigate('/admin/athletes');
    } catch (err: any) {
      alert(err.response?.data?.athlete_id?.[0] || 'Registration failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/admin/athletes')}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Register Athlete</h2>
          <p className="text-sm text-slate-500">Create profile and login credentials in one atomic registration.</p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Athlete License ID</label>
              <input
                type="text"
                placeholder="e.g. ATH-2026-101"
                {...register('athlete_id')}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              {errors.athlete_id && (
                <p className="text-xs text-rose-600 mt-1">{errors.athlete_id.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">First Name</label>
              <input
                type="text"
                {...register('first_name')}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              {errors.first_name && (
                <p className="text-xs text-rose-600 mt-1">{errors.first_name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Last Name</label>
              <input
                type="text"
                {...register('last_name')}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              {errors.last_name && (
                <p className="text-xs text-rose-600 mt-1">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Username</label>
              <input
                type="text"
                {...register('username')}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              {errors.username && (
                <p className="text-xs text-rose-600 mt-1">{errors.username.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <input
                type="email"
                {...register('email')}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                {...register('password')}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              {errors.password && (
                <p className="text-xs text-rose-600 mt-1">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Sport Discipline</label>
              <input
                type="text"
                placeholder="e.g. Swimming, Cycling"
                {...register('sport')}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              {errors.sport && (
                <p className="text-xs text-rose-600 mt-1">{errors.sport.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Nationality</label>
              <input
                type="text"
                {...register('nationality')}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Gender</label>
              <select
                {...register('gender')}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Club / National Team</label>
              <input
                type="text"
                {...register('team')}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Coach Name</label>
              <input
                type="text"
                {...register('coach')}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/athletes')}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-50"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'Register Athlete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

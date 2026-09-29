import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { userApi } from '../../api/entitiesApi';
import { ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';

const userCreateSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Please enter a valid email address'),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    role: z.enum([
      'ADMINISTRATOR',
      'ATHLETE',
      'DOPING_CONTROL_OFFICER',
      'LABORATORY_STAFF',
      'SPORTS_AUTHORITY',
    ]),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  });

type UserCreateFormData = z.infer<typeof userCreateSchema>;

export const AdminUserCreate: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserCreateFormData>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      role: 'ATHLETE',
    },
  });

  const onSubmit = async (data: UserCreateFormData) => {
    try {
      await userApi.create(data);
      navigate('/admin/users');
    } catch (err: any) {
      alert(err.response?.data?.email?.[0] || err.response?.data?.username?.[0] || 'Creation failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/admin/users')}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Platform User</h2>
          <p className="text-sm text-slate-500">Add an administrator, officer, lab analyst, or authority.</p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input
                type="text"
                {...register('phone')}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Role</label>
              <select
                {...register('role')}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="ADMINISTRATOR">Administrator</option>
                <option value="ATHLETE">Athlete</option>
                <option value="DOPING_CONTROL_OFFICER">Doping Control Officer</option>
                <option value="LABORATORY_STAFF">Laboratory Staff</option>
                <option value="SPORTS_AUTHORITY">Sports Authority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
              <input
                type="password"
                {...register('password_confirm')}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              {errors.password_confirm && (
                <p className="text-xs text-rose-600 mt-1">{errors.password_confirm.message}</p>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-50"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

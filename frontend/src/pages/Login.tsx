import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, roleHomeMap } from '../context/AuthContext';
import { ShieldAlert, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const demoAccounts = [
  { role: 'Administrator', email: 'admin@demo.sadms', name: 'System Admin' },
  { role: 'Athlete', email: 'athlete@demo.sadms', name: 'Aarav Mehta' },
  { role: 'Officer (DCO)', email: 'officer@demo.sadms', name: 'Jon Bell' },
  { role: 'Laboratory Staff', email: 'lab@demo.sadms', name: 'Dr. Elena Rossi' },
  { role: 'Sports Authority', email: 'authority@demo.sadms', name: 'Nia Okafor' },
];

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@demo.sadms',
      password: 'Demo@1234',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    try {
      const user = await login(data.email, data.password);
      navigate(roleHomeMap[user.role]);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.detail || 'Authentication failed. Please check your credentials.'
      );
    }
  };

  const setDemoCredentials = (email: string) => {
    setValue('email', email);
    setValue('password', 'Demo@1234');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 bg-teal-500 rounded-2xl text-slate-950 mb-4 shadow-lg shadow-teal-500/20">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Sports Anti-Doping Monitor
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Official Athlete & Chain-of-Custody Compliance Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-sm"
                  placeholder="name@domain.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" className="border-white" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Development Seed Accounts Switcher */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2 text-center">
              Quick Switch Role (Development Demo)
            </span>
            <div className="grid grid-cols-1 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => setDemoCredentials(acc.email)}
                  className="text-left px-3 py-2 text-xs rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-colors flex justify-between items-center"
                >
                  <span className="font-semibold text-slate-700">{acc.role}</span>
                  <span className="text-slate-400">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

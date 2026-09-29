import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, roleHomeMap } from '../context/AuthContext';
import { ShieldAlert, AlertCircle, ArrowRight, Lock, Mail, ArrowLeft, Clock } from 'lucide-react';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPendingVerification, setIsPendingVerification] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    setIsPendingVerification(false);
    try {
      const user = await login(data.email, data.password);
      if (user.is_verified === false) {
        setIsPendingVerification(true);
        return;
      }
      navigate(roleHomeMap[user.role]);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Authentication failed. Please check your credentials.';
      if (msg.toLowerCase().includes('pending') || msg.toLowerCase().includes('verification')) {
        setIsPendingVerification(true);
      } else {
        setErrorMessage(msg);
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-cover bg-center bg-fixed selection:bg-teal-500 selection:text-slate-950"
      style={{
        backgroundImage: `linear-gradient(rgba(10, 15, 29, 0.88), rgba(2, 6, 23, 0.94)), url('https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1920&q=80')`,
      }}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link
          to="/"
          className="inline-flex items-center text-xs text-teal-400 hover:text-teal-300 mb-6 bg-slate-900/60 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Clean Sport Portal
        </Link>
        <div className="block">
          <div className="inline-flex p-3.5 bg-teal-500 rounded-2xl text-slate-950 mb-3 shadow-xl shadow-teal-500/25">
            <ShieldAlert className="w-10 h-10" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight sm:text-4xl">
          Portal Sign In
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Sports Anti-Doping Administration & Monitoring Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-2 relative z-10">
        <div className="bg-slate-900/85 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-700/80">
          {isPendingVerification && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
              <div className="flex items-center space-x-2 font-bold text-amber-300 text-sm">
                <Clock className="w-5 h-5 flex-shrink-0" />
                <span>Account Verification Pending</span>
              </div>
              <p>
                Your registration has been submitted and is currently awaiting verification by the System Administrator. Access will be unlocked as soon as your accreditation is approved.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-3.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center space-x-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email Address</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  className="block w-full pl-9 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-white placeholder-slate-500"
                  placeholder="name@organization.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  className="block w-full pl-9 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-white placeholder-slate-500"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-lg shadow-teal-500/20 text-sm font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all disabled:opacity-50 mt-2 cursor-pointer"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" className="border-slate-950" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              New athlete, laboratory, or staff member?{' '}
              <Link to="/register" className="font-semibold text-teal-400 hover:text-teal-300 underline">
                Register here for verification
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

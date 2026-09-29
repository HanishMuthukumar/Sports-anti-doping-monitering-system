import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, ArrowRight, UserPlus, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth, roleHomeMap } from '../context/AuthContext';
import { Role } from '../types';

const registerSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    role: z.enum([
      'ATHLETE',
      'DOPING_CONTROL_OFFICER',
      'LABORATORY_STAFF',
      'SPORTS_AUTHORITY',
      'ADMINISTRATOR',
    ]),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirm: z.string().min(8, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: 'ATHLETE',
      password: '',
      password_confirm: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    try {
      const user = await registerUser(data);
      navigate(roleHomeMap[user.role]);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.password?.[0] ||
        err.message ||
        'Registration failed. Please check your details.';
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-teal-500 selection:text-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-teal-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Home
        </Link>
        <div className="flex justify-center">
          <div className="p-3 bg-teal-500 text-slate-950 rounded-2xl shadow-lg shadow-teal-500/20">
            <ShieldCheck className="w-10 h-10" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
          Create Clean Sport Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Sports Anti-Doping Administration & Monitoring Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-slate-800/90 backdrop-blur border border-slate-700 py-8 px-6 sm:px-10 shadow-2xl rounded-2xl">
          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aarav"
                  {...register('first_name')}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
                {errors.first_name && (
                  <p className="mt-1 text-xs text-rose-400">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mehta"
                  {...register('last_name')}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
                {errors.last_name && (
                  <p className="mt-1 text-xs text-rose-400">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Official Email Address
              </label>
              <input
                type="email"
                placeholder="name@organization.com"
                {...register('email')}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  {...register('phone')}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Designated Role
                </label>
                <select
                  {...register('role')}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                >
                  <option value="ATHLETE">Athlete</option>
                  <option value="DOPING_CONTROL_OFFICER">Doping Control Officer</option>
                  <option value="LABORATORY_STAFF">Laboratory Staff</option>
                  <option value="SPORTS_AUTHORITY">Sports Authority</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  {...register('password')}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Repeat password"
                  {...register('password_confirm')}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
                {errors.password_confirm && (
                  <p className="mt-1 text-xs text-rose-400">{errors.password_confirm.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-slate-950 font-bold bg-teal-500 hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 mt-4 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  <span>Register Account</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-slate-700 pt-5">
            <p className="text-xs text-slate-400">
              Already have an accredited account?{' '}
              <Link to="/login" className="text-teal-400 hover:text-teal-300 font-semibold underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

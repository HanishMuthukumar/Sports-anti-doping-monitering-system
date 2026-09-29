import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ShieldCheck,
  ArrowRight,
  UserPlus,
  AlertCircle,
  ArrowLeft,
  User,
  FlaskConical,
  ShieldAlert,
  Building2,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

const sportsList = [
  'Athletics / Track & Field',
  'Swimming / Aquatics',
  'Cycling (Road / Track)',
  'Weightlifting & Powerlifting',
  'Boxing & Combat Sports',
  'Gymnastics',
  'Football / Soccer',
  'Basketball',
  'Rowing & Canoeing',
  'Triathlon',
  'Wrestling',
  'Shooting & Archery',
];

const registerSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    role: z.enum([
      'ATHLETE',
      'LABORATORY_STAFF',
      'DOPING_CONTROL_OFFICER',
      'SPORTS_AUTHORITY',
      'ADMINISTRATOR',
    ]),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirm: z.string().min(8, 'Confirm password is required'),

    // Role-specific fields
    sport: z.string().optional(),
    nationality: z.string().optional(),
    team: z.string().optional(),
    coach: z.string().optional(),
    laboratory_name: z.string().optional(),
    accreditation_number: z.string().optional(),
    designation: z.string().optional(),
    certification_number: z.string().optional(),
    organization: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>('ATHLETE');
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [registeredData, setRegisteredData] = useState<{ name: string; email: string; role: Role } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
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
      sport: 'Athletics / Track & Field',
      nationality: '',
      team: '',
      coach: '',
      laboratory_name: '',
      accreditation_number: '',
      designation: 'Laboratory Analyst',
      certification_number: '',
      organization: 'National Anti-Doping Organization',
    },
  });

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    try {
      const res = await registerUser(data);
      setRegisteredData({
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        role: data.role,
      });
      setIsSubmittedSuccess(true);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.password?.[0] ||
        err.message ||
        'Registration failed. Please check your credentials and try again.';
      setServerError(msg);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-cover bg-center bg-fixed selection:bg-teal-500 selection:text-slate-950"
      style={{
        backgroundImage: `linear-gradient(rgba(10, 15, 29, 0.88), rgba(2, 6, 23, 0.94)), url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1920&q=80')`,
      }}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <Link
          to="/"
          className="inline-flex items-center text-xs font-semibold text-teal-400 hover:text-teal-300 mb-6 transition-colors bg-slate-900/60 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700/60"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Clean Sport Portal
        </Link>
        <div className="flex justify-center">
          <div className="p-3.5 bg-teal-500 text-slate-950 rounded-2xl shadow-xl shadow-teal-500/25">
            <ShieldCheck className="w-10 h-10" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-black text-white tracking-tight sm:text-4xl">
          Accreditation & Registration
        </h2>
        <p className="mt-2 text-center text-sm text-slate-300 max-w-lg mx-auto">
          World Anti-Doping Code (WADA) Standardized Participant Enrollment. All registrations are verified by System Administrators.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-2 relative z-10">
        <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-700/80 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl">
          {isSubmittedSuccess ? (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-teal-400" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-3">
                  Verification Pending
                </span>
                <h3 className="text-2xl font-black text-white">
                  Registration Received for Verification
                </h3>
                <p className="mt-2 text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-teal-400">{registeredData?.name}</strong>. Your application as a{' '}
                  <strong className="text-white">{registeredData?.role.replace(/_/g, ' ')}</strong> has been registered.
                </p>
              </div>

              <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-left text-xs text-slate-300 space-y-2 max-w-lg mx-auto">
                <div className="flex items-center text-amber-300 font-bold text-sm">
                  <Lock className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  <span>Admin Verification Process:</span>
                </div>
                <p>
                  To prevent unauthorized access and uphold sports anti-doping integrity, your profile must be reviewed and verified by the designated System Administrator before credentials become active.
                </p>
                <p className="text-slate-400 font-mono">
                  Registered Email: <span className="text-teal-300">{registeredData?.email}</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <Link
                  to="/login"
                  className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-teal-500/20"
                >
                  Proceed to Sign In
                </Link>
                <Link
                  to="/"
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm border border-slate-700 transition-all"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Role Tabs */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                  Select Accreditation Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('ATHLETE')}
                    className={`flex items-center space-x-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedRole === 'ATHLETE'
                        ? 'bg-teal-500/15 border-teal-500 text-white shadow-md shadow-teal-500/10'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <User className={`w-5 h-5 flex-shrink-0 ${selectedRole === 'ATHLETE' ? 'text-teal-400' : 'text-slate-400'}`} />
                    <div>
                      <span className="block text-xs font-bold text-white">Athlete</span>
                      <span className="block text-[10px] text-slate-400">Competitor profile</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('LABORATORY_STAFF')}
                    className={`flex items-center space-x-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedRole === 'LABORATORY_STAFF'
                        ? 'bg-teal-500/15 border-teal-500 text-white shadow-md shadow-teal-500/10'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <FlaskConical className={`w-5 h-5 flex-shrink-0 ${selectedRole === 'LABORATORY_STAFF' ? 'text-teal-400' : 'text-slate-400'}`} />
                    <div>
                      <span className="block text-xs font-bold text-white">Laboratory Staff</span>
                      <span className="block text-[10px] text-slate-400">Testing facility staff</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('DOPING_CONTROL_OFFICER')}
                    className={`flex items-center space-x-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedRole === 'DOPING_CONTROL_OFFICER'
                        ? 'bg-teal-500/15 border-teal-500 text-white shadow-md shadow-teal-500/10'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <ShieldAlert className={`w-5 h-5 flex-shrink-0 ${selectedRole === 'DOPING_CONTROL_OFFICER' ? 'text-teal-400' : 'text-slate-400'}`} />
                    <div>
                      <span className="block text-xs font-bold text-white">DCO Officer</span>
                      <span className="block text-[10px] text-slate-400">Sample collection</span>
                    </div>
                  </button>
                </div>
              </div>

              {serverError && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Aarav"
                      {...register('first_name')}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-xs text-rose-400">{errors.first_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Mehta"
                      {...register('last_name')}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-xs text-rose-400">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email</label>
                    <input
                      type="email"
                      placeholder="candidate@sportsorg.org"
                      {...register('email')}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="+91 (555) 012-3456"
                      {...register('phone')}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                </div>

                {/* Role Specific Fields */}
                {selectedRole === 'ATHLETE' && (
                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3.5">
                    <span className="block text-xs font-bold text-teal-400 uppercase tracking-wider">
                      Athlete Details
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Sport Discipline</label>
                        <select
                          {...register('sport')}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        >
                          {sportsList.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Country / Nationality</label>
                        <input
                          type="text"
                          placeholder="e.g. India, USA, France"
                          {...register('nationality')}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Club / Team Name</label>
                        <input
                          type="text"
                          placeholder="e.g. National Track Squad"
                          {...register('team')}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Head Coach / Trainer</label>
                        <input
                          type="text"
                          placeholder="e.g. Coach Rajesh"
                          {...register('coach')}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedRole === 'LABORATORY_STAFF' && (
                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3.5">
                    <span className="block text-xs font-bold text-teal-400 uppercase tracking-wider">
                      Laboratory Accreditation Details
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Laboratory Facility Name</label>
                        <input
                          type="text"
                          placeholder="e.g. National Doping Testing Laboratory"
                          {...register('laboratory_name')}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Accreditation ID / Cert #</label>
                        <input
                          type="text"
                          placeholder="e.g. WADA-LAB-042"
                          {...register('accreditation_number')}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Staff Designation / Specialty</label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Toxicologist / LC-MS Analyst"
                        {...register('designation')}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      />
                    </div>
                  </div>
                )}

                {selectedRole === 'DOPING_CONTROL_OFFICER' && (
                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3.5">
                    <span className="block text-xs font-bold text-teal-400 uppercase tracking-wider">
                      Officer Accreditation Details
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">DCO Certification Number</label>
                        <input
                          type="text"
                          placeholder="e.g. DCO-CERT-9921"
                          {...register('certification_number')}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Sanctioning Agency / Region</label>
                        <input
                          type="text"
                          placeholder="e.g. National Anti-Doping Agency"
                          {...register('organization')}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Account Password</label>
                    <input
                      type="password"
                      placeholder="Min. 8 characters"
                      {...register('password')}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                    {errors.password && (
                      <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Repeat password"
                      {...register('password_confirm')}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                    {errors.password_confirm && (
                      <p className="mt-1 text-xs text-rose-400">{errors.password_confirm.message}</p>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-normal flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>
                    By submitting, you certify that all submitted identification and credentials are valid and subject to verification against international anti-doping registries.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-slate-950 font-bold bg-teal-400 hover:bg-teal-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all shadow-lg shadow-teal-500/25 disabled:opacity-50 mt-4 cursor-pointer text-sm"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      <span>Submit Registration for Admin Verification</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center border-t border-slate-800 pt-5">
                <p className="text-xs text-slate-400">
                  Already hold an accredited account?{' '}
                  <Link to="/login" className="text-teal-400 hover:text-teal-300 font-semibold underline">
                    Sign in to Portal
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

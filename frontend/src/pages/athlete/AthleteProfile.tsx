import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { athleteApi } from '../../api/entitiesApi';
import { Athlete } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { User, ShieldCheck } from 'lucide-react';

export const AthleteProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const athletes = await athleteApi.list();
        if (athletes.length > 0) {
          setProfile(athletes[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Athlete Profile & Whereabouts</h2>
        <p className="text-sm text-slate-500">Official registered biometric and contact parameters.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-900 text-white flex items-center space-x-4">
          <div className="p-3 bg-teal-500 text-slate-950 rounded-xl">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{user?.full_name}</h3>
            <p className="text-sm text-slate-400 font-mono">Athlete ID: {profile?.athlete_id || 'PENDING'}</p>
          </div>
          <div className="ml-auto">
            <StatusBadge status={profile?.status || 'ACTIVE'} />
          </div>
        </div>

        <div className="p-6 space-y-6 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Email Address</span>
              <p className="font-medium text-slate-800 mt-0.5">{user?.email}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Sport Discipline</span>
              <p className="font-medium text-slate-800 mt-0.5">{profile?.sport || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Nationality</span>
              <p className="font-medium text-slate-800 mt-0.5">{profile?.nationality || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Gender</span>
              <p className="font-medium text-slate-800 mt-0.5">{profile?.gender || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Club / National Team</span>
              <p className="font-medium text-slate-800 mt-0.5">{profile?.team || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Assigned Coach</span>
              <p className="font-medium text-slate-800 mt-0.5">{profile?.coach || '—'}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg flex items-start space-x-3 text-teal-800 text-xs">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 text-teal-600 mt-0.5" />
              <div>
                <strong className="block font-semibold text-sm text-teal-900 mb-0.5">
                  WADA Compliance & Whereabouts Obligation
                </strong>
                As a registered testing pool athlete, you are required to keep contact information, training locations, and daily availability updated. Contact your national anti-doping liaison to modify core biographical fields.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

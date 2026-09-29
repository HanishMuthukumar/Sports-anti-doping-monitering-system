import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  ClipboardList,
  TestTubes,
  FlaskConical,
  Scale,
  Users,
  CheckCircle2,
  ArrowRight,
  Lock,
  Globe2,
  Activity,
  FileCheck2,
} from 'lucide-react';
import { useAuth, roleHomeMap } from '../context/AuthContext';

export const Home: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const dashboardLink = role ? roleHomeMap[role] : '/login';
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-teal-500 selection:text-slate-950">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2.5 bg-teal-500 text-slate-950 rounded-xl shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight block leading-tight">
                Clearline Anti-Doping
              </span>
              <span className="text-xs font-mono text-teal-400 font-semibold tracking-wider uppercase">
                Clean Sport Monitor
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#standards" className="hover:text-teal-400 transition-colors">
              Standards & Code
            </a>
            <a href="#workflow" className="hover:text-teal-400 transition-colors">
              Chain of Custody
            </a>
            <a href="#roles" className="hover:text-teal-400 transition-colors">
              Stakeholder Roles
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-bold rounded-lg shadow-md shadow-teal-500/20 transition-all hover:shadow-teal-500/30"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </>
            ) : (
              <Link
                to={dashboardLink}
                className="inline-flex items-center px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-bold rounded-lg shadow-md shadow-teal-500/20 transition-all hover:shadow-teal-500/30"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Thematic Stadium Backdrop */}
      <section
        className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 border-b border-slate-800 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 15, 29, 0.88), rgba(2, 6, 23, 0.95)), url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=2000&q=80')`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold mb-8">
            <ShieldCheck className="w-4 h-4" />
            <span>World Anti-Doping Code (WADA) Standard Compliant</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Protecting Athletic Integrity with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-200">Tamper-Evident</span> Monitoring
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The national sports anti-doping monitoring platform for targeted test missions, biological passport custody receipts, accredited laboratory screenings, and fair disciplinary hearings.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={dashboardLink}
              className="w-full sm:w-auto px-8 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/25 transition-all text-base flex items-center justify-center"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Access Secure Portal'}</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-white font-semibold rounded-xl border border-slate-700 transition-all text-base"
              >
                Athlete / Officer Registration
              </Link>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-2xl font-black text-white block">100%</span>
              <span className="text-xs text-slate-400 font-medium">Chain of Custody Verifiable</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-2xl font-black text-teal-400 block">5 Roles</span>
              <span className="text-xs text-slate-400 font-medium">Isolated Stakeholder Contexts</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-2xl font-black text-white block">WADA Code</span>
              <span className="text-xs text-slate-400 font-medium">Procedural Adjudication</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-2xl font-black text-emerald-400 block">Real-Time</span>
              <span className="text-xs text-slate-400 font-medium">Instant Notice Dispatch</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Pillars */}
      <section id="workflow" className="py-24 border-b border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">
              End-to-End Governance
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
              The Anti-Doping Lifecycle
            </h3>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              From out-of-competition testing order to tribunal ruling, every state transition is cryptographically logged and validated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative hover:border-teal-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-5">
                <ClipboardList className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-teal-500">STAGE 01</span>
              <h4 className="text-lg font-bold text-white mt-1 mb-2">Mission Scheduling</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Authorized testing orders targeted or in-competition with assigned Doping Control Officers and whereabouts tracking.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative hover:border-teal-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5">
                <TestTubes className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-blue-400">STAGE 02</span>
              <h4 className="text-lg font-bold text-white mt-1 mb-2">Specimen Custody</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Witnessed sample provision, A/B bottle tamper-evident sealing, courier dispatch, and timestamped custody logs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative hover:border-teal-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5">
                <FlaskConical className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-purple-400">STAGE 03</span>
              <h4 className="text-lg font-bold text-white mt-1 mb-2">Lab Screening</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                WADA-accredited analytical runs via GC-MS/MS and LC-MS/MS spectrometry with certified finding issuance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative hover:border-teal-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-5">
                <Scale className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-rose-400">STAGE 04</span>
              <h4 className="text-lg font-bold text-white mt-1 mb-2">Tribunal Review</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Atomic Anti-Doping Rule Violation (ADRV) casework, provisional hearings, disciplinary rulings, and appeals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholder Roles Overview */}
      <section id="roles" className="py-24 border-b border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">
              System Access
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
              Five Dedicated Portals
            </h3>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              Every participant enters a customized dashboard with strictly enforced role-based permission boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <h4 className="text-base font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-teal-400" />
                <span>Athletes</span>
              </h4>
              <p className="text-xs text-slate-400 mt-2">
                Check whereabouts records, view upcoming testing mission notices, and download certified negative results.
              </p>
              <Link to="/login" className="inline-flex items-center text-xs font-semibold text-teal-400 hover:text-teal-300 mt-4">
                Athlete Sign In &rarr;
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <h4 className="text-base font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <span>Doping Control Officers</span>
              </h4>
              <p className="text-xs text-slate-400 mt-2">
                Order sample collection protocols, record tamper-evident seals in the field, and log courier handoffs.
              </p>
              <Link to="/login" className="inline-flex items-center text-xs font-semibold text-teal-400 hover:text-teal-300 mt-4">
                DCO Sign In &rarr;
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <h4 className="text-base font-bold text-white flex items-center space-x-2">
                <FlaskConical className="w-5 h-5 text-purple-400" />
                <span>Laboratory Staff</span>
              </h4>
              <p className="text-xs text-slate-400 mt-2">
                Intake specimen shipments, verify security tape integrity, run spectrometry analyses, and issue certificates.
              </p>
              <Link to="/login" className="inline-flex items-center text-xs font-semibold text-teal-400 hover:text-teal-300 mt-4">
                Lab Staff Sign In &rarr;
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <h4 className="text-base font-bold text-white flex items-center space-x-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <span>Sports Authority</span>
              </h4>
              <p className="text-xs text-slate-400 mt-2">
                Review adverse analytical findings, administer disciplinary hearings, decree sanctions, and export statistics.
              </p>
              <Link to="/login" className="inline-flex items-center text-xs font-semibold text-teal-400 hover:text-teal-300 mt-4">
                Authority Sign In &rarr;
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 sm:col-span-2 lg:col-span-2">
              <h4 className="text-base font-bold text-white flex items-center space-x-2">
                <Lock className="w-5 h-5 text-rose-400" />
                <span>System Administration</span>
              </h4>
              <p className="text-xs text-slate-400 mt-2">
                Manage organization accreditations, athlete onboarding, officer credentials, and comprehensive system audit registers.
              </p>
              <Link to="/login" className="inline-flex items-center text-xs font-semibold text-teal-400 hover:text-teal-300 mt-4">
                Admin Sign In &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 text-slate-500 text-xs border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-teal-500" />
            <span className="font-semibold text-slate-400">Clearline Anti-Doping Monitoring Platform</span>
          </div>
          <p>© 2026 Sports Anti-Doping Authority. Built for WADA Code International Compliance.</p>
          <div className="flex space-x-4">
            <Link to="/login" className="hover:text-slate-300">Sign In</Link>
            <Link to="/register" className="hover:text-slate-300">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

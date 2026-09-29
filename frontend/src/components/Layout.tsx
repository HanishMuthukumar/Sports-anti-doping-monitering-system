import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../api/operationsApi';
import {
  ShieldAlert,
  Users,
  UserCheck,
  Building2,
  ClipboardList,
  TestTubes,
  FileCheck2,
  AlertTriangle,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  PlusCircle,
  FlaskConical,
  ShieldCheck,
} from 'lucide-react';

const roleBackgrounds: Record<string, string> = {
  ADMINISTRATOR: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
  ATHLETE: 'https://images.unsplash.com/photo-1486286701208-1d58e9338013?auto=format&fit=crop&w=1920&q=80',
  DOPING_CONTROL_OFFICER: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=1920&q=80',
  LABORATORY_STAFF: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1920&q=80',
  SPORTS_AUTHORITY: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80',
};

export const Layout: React.FC = () => {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationApi.unreadCount();
        setUnreadCount(res.count);
      } catch {
        // silent fail
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    switch (role) {
      case 'ADMINISTRATOR':
        return [
          { label: 'Overview', href: '/admin/dashboard', icon: BarChart3 },
          { label: 'Verifications', href: '/admin/verifications', icon: ShieldCheck },
          { label: 'Users', href: '/admin/users', icon: Users },
          { label: 'Athletes', href: '/admin/athletes', icon: UserCheck },
          { label: 'Officers', href: '/admin/officers', icon: ShieldAlert },
          { label: 'Laboratories', href: '/admin/laboratories', icon: Building2 },
          { label: 'Doping Tests', href: '/admin/tests', icon: ClipboardList },
          { label: 'Samples', href: '/admin/samples', icon: TestTubes },
          { label: 'Lab Results', href: '/admin/results', icon: FileCheck2 },
          { label: 'Violations', href: '/admin/violations', icon: AlertTriangle },
          { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
        ];
      case 'ATHLETE':
        return [
          { label: 'Dashboard', href: '/athlete/dashboard', icon: BarChart3 },
          { label: 'My Profile', href: '/athlete/profile', icon: UserIcon },
          { label: 'My Tests', href: '/athlete/tests', icon: ClipboardList },
          { label: 'Results', href: '/athlete/results', icon: FileCheck2 },
          { label: 'Violations', href: '/athlete/violations', icon: AlertTriangle },
          { label: 'Notifications', href: '/athlete/notifications', icon: Bell, count: unreadCount },
        ];
      case 'DOPING_CONTROL_OFFICER':
        return [
          { label: 'Overview', href: '/officer/dashboard', icon: BarChart3 },
          { label: 'Assigned Tests', href: '/officer/tests', icon: ClipboardList },
          { label: 'Schedule Test', href: '/officer/tests/create', icon: PlusCircle },
          { label: 'Samples', href: '/officer/samples', icon: TestTubes },
        ];
      case 'LABORATORY_STAFF':
        return [
          { label: 'Overview', href: '/laboratory/dashboard', icon: BarChart3 },
          { label: 'Sample Intake', href: '/laboratory/samples', icon: TestTubes },
          { label: 'Lab Results', href: '/laboratory/results', icon: FileCheck2 },
          { label: 'Record Result', href: '/laboratory/results/create', icon: FlaskConical },
        ];
      case 'SPORTS_AUTHORITY':
        return [
          { label: 'Overview', href: '/authority/dashboard', icon: BarChart3 },
          { label: 'Violations Review', href: '/authority/violations', icon: AlertTriangle },
          { label: 'Analytics Reports', href: '/authority/reports', icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-white select-none">
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="p-2 bg-teal-500 rounded-lg text-slate-900">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">Clearline Anti-Doping</h1>
            <span className="text-xs text-slate-400 font-mono">Clean Sport Monitor</span>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Role Context</span>
          <p className="text-sm font-semibold text-teal-400 mt-0.5">{role?.replace(/_/g, ' ')}</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="truncate">
              <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="text-sm text-slate-500 font-medium">
              Sports Anti-Doping Monitoring Platform <span className="text-slate-300">/</span>{' '}
              <span className="text-slate-800 font-semibold">{role?.replace(/_/g, ' ')}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {role === 'ATHLETE' && (
              <Link
                to="/athlete/notifications"
                className="relative p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </Link>
            )}

            <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">
                {user?.first_name?.[0] || 'U'}
              </div>
              <span className="hidden sm:inline-block text-sm font-medium text-slate-700">
                {user?.full_name}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 text-white px-4 py-3 space-y-1 border-b border-slate-800">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-rose-400 hover:bg-slate-800 rounded-lg text-left"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Content Outlet with Thematic Page Backdrop */}
        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative bg-cover bg-center bg-fixed transition-all"
          style={{
            backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.93), rgba(2, 6, 23, 0.95)), url('${
              role ? roleBackgrounds[role] : roleBackgrounds.ADMINISTRATOR
            }')`,
          }}
        >
          <div className="relative z-10 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

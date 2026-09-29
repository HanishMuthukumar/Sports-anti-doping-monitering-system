import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, roleHomeMap } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminUserCreate } from './pages/admin/AdminUserCreate';
import { AdminAthletes } from './pages/admin/AdminAthletes';
import { AdminAthleteCreate } from './pages/admin/AdminAthleteCreate';
import { AdminOfficers } from './pages/admin/AdminOfficers';
import { AdminLaboratories } from './pages/admin/AdminLaboratories';
import { AdminTests } from './pages/admin/AdminTests';
import { AdminSamples } from './pages/admin/AdminSamples';
import { AdminResults } from './pages/admin/AdminResults';
import { AdminViolations } from './pages/admin/AdminViolations';
import { AdminReports } from './pages/admin/AdminReports';

// Athlete pages
import { AthleteDashboard } from './pages/athlete/AthleteDashboard';
import { AthleteProfile } from './pages/athlete/AthleteProfile';
import { AthleteTests } from './pages/athlete/AthleteTests';
import { AthleteResults } from './pages/athlete/AthleteResults';
import { AthleteViolations } from './pages/athlete/AthleteViolations';
import { AthleteNotifications } from './pages/athlete/AthleteNotifications';

// Officer pages
import { OfficerDashboard } from './pages/officer/OfficerDashboard';
import { OfficerTests } from './pages/officer/OfficerTests';
import { OfficerTestCreate } from './pages/officer/OfficerTestCreate';
import { OfficerTestDetail } from './pages/officer/OfficerTestDetail';
import { OfficerSamples } from './pages/officer/OfficerSamples';

// Laboratory pages
import { LaboratoryDashboard } from './pages/laboratory/LaboratoryDashboard';
import { LaboratorySamples } from './pages/laboratory/LaboratorySamples';
import { LaboratorySampleDetail } from './pages/laboratory/LaboratorySampleDetail';
import { LaboratoryResults } from './pages/laboratory/LaboratoryResults';
import { LaboratoryResultCreate } from './pages/laboratory/LaboratoryResultCreate';

// Authority pages
import { AuthorityDashboard } from './pages/authority/AuthorityDashboard';
import { AuthorityViolations } from './pages/authority/AuthorityViolations';
import { AuthorityViolationDetail } from './pages/authority/AuthorityViolationDetail';
import { AuthorityReports } from './pages/authority/AuthorityReports';

const HomeRedirect: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated || !role) return <Navigate to="/login" replace />;
  return <Navigate to={roleHomeMap[role]} replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/portal" element={<HomeRedirect />} />

          {/* Administrator routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['ADMINISTRATOR']}>
                  <Layout />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/create" element={<AdminUserCreate />} />
            <Route path="athletes" element={<AdminAthletes />} />
            <Route path="athletes/create" element={<AdminAthleteCreate />} />
            <Route path="officers" element={<AdminOfficers />} />
            <Route path="laboratories" element={<AdminLaboratories />} />
            <Route path="tests" element={<AdminTests />} />
            <Route path="samples" element={<AdminSamples />} />
            <Route path="results" element={<AdminResults />} />
            <Route path="violations" element={<AdminViolations />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          {/* Athlete routes */}
          <Route
            path="/athlete"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['ATHLETE']}>
                  <Layout />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AthleteDashboard />} />
            <Route path="profile" element={<AthleteProfile />} />
            <Route path="tests" element={<AthleteTests />} />
            <Route path="results" element={<AthleteResults />} />
            <Route path="violations" element={<AthleteViolations />} />
            <Route path="notifications" element={<AthleteNotifications />} />
          </Route>

          {/* Doping Control Officer routes */}
          <Route
            path="/officer"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['DOPING_CONTROL_OFFICER']}>
                  <Layout />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<OfficerDashboard />} />
            <Route path="tests" element={<OfficerTests />} />
            <Route path="tests/create" element={<OfficerTestCreate />} />
            <Route path="tests/:id" element={<OfficerTestDetail />} />
            <Route path="samples" element={<OfficerSamples />} />
          </Route>

          {/* Laboratory Staff routes */}
          <Route
            path="/laboratory"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['LABORATORY_STAFF']}>
                  <Layout />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<LaboratoryDashboard />} />
            <Route path="samples" element={<LaboratorySamples />} />
            <Route path="samples/:id" element={<LaboratorySampleDetail />} />
            <Route path="results" element={<LaboratoryResults />} />
            <Route path="results/create" element={<LaboratoryResultCreate />} />
          </Route>

          {/* Sports Authority routes */}
          <Route
            path="/authority"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['SPORTS_AUTHORITY']}>
                  <Layout />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AuthorityDashboard />} />
            <Route path="violations" element={<AuthorityViolations />} />
            <Route path="violations/:id" element={<AuthorityViolationDetail />} />
            <Route path="reports" element={<AuthorityReports />} />
          </Route>

          {/* Catch-all 404 */}
          <Route
            path="*"
            element={
              <div className="flex h-screen flex-col items-center justify-center bg-slate-900 text-white space-y-4">
                <h1 className="text-4xl font-extrabold text-teal-400">404</h1>
                <p className="text-slate-400">The requested anti-doping portal resource could not be found.</p>
                <a
                  href="/login"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold"
                >
                  Return to Portal Login
                </a>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

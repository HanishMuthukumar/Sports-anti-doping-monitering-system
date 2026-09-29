import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, roleHomeMap } from '../context/AuthContext';
import { Role } from '../types';

export const RoleProtectedRoute: React.FC<{
  allowedRoles: Role[];
  children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!role || !allowedRoles.includes(role)) {
    // Redirect to their respective authorized home or login
    const target = role ? roleHomeMap[role] : '/login';
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
};

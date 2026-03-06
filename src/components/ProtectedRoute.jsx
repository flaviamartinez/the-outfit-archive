import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Cargando clóset...</p>
      </div>
    );
  }

  // Si no hay usuario, redirigir al Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario, renderizar las rutas hijas (Clóset, Creador, etc)
  return <Outlet />;
}

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({ children, soloAdmin = false }) {
  const { autenticado, esAdmin, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Cargando...
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" state={{ desde: location }} replace />;
  }

  if (soloAdmin && !esAdmin) {
    return <Navigate to="/acceso-denegado" replace />;
  }

  return children;
}

export default ProtectedRoute;

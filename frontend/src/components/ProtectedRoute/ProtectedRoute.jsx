import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({ children, soloAdmin = false, soloRoles = null }) {
  const { autenticado, esAdmin, usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'var(--font-family)',
        color: 'var(--color-text-secondary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" state={{ desde: location }} replace />;
  }

  if (soloAdmin && !esAdmin) {
    return <Navigate to="/app/acceso-denegado" replace />;
  }

  if (soloRoles && !soloRoles.includes(usuario.rol)) {
    return <Navigate to="/app/acceso-denegado" replace />;
  }

  return children;
}

export default ProtectedRoute;

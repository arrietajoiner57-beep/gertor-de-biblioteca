import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import Registro from './pages/Registro/Registro';
import Inicio from './pages/Inicio/Inicio';
import Usuarios from './pages/Usuarios/Usuarios';
import Libros from './pages/Libros/Libros';
import Prestamos from './pages/Prestamos/Prestamos';
import MisPrestamos from './pages/MisPrestamos/MisPrestamos';
import Perfil from './pages/Perfil/Perfil';
import Comunidad from './pages/Comunidad/Comunidad';
import AccesoDenegado from './pages/AccesoDenegado/AccesoDenegado';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <SocketProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />

              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Inicio />} />
                <Route
                  path="usuarios"
                  element={
                    <ProtectedRoute soloAdmin>
                      <Usuarios />
                    </ProtectedRoute>
                  }
                />
                <Route path="libros" element={<Libros />} />
                <Route
                  path="prestamos"
                  element={
                    <ProtectedRoute soloRoles={['admin', 'bibliotecario']}>
                      <Prestamos />
                    </ProtectedRoute>
                  }
                />
                <Route path="mis-prestamos" element={<MisPrestamos />} />
                <Route path="comunidad" element={<Comunidad />} />
                <Route path="perfil" element={<Perfil />} />
                <Route path="acceso-denegado" element={<AccesoDenegado />} />
                <Route path="*" element={<AccesoDenegado />} />
              </Route>

              <Route path="*" element={<Landing />} />
            </Routes>
          </Router>
        </SocketProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

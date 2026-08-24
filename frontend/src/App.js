import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Inicio from './pages/Inicio/Inicio';
import Usuarios from './pages/Usuarios/Usuarios';
import Libros from './pages/Libros/Libros';
import Prestamos from './pages/Prestamos/Prestamos';
import MisPrestamos from './pages/MisPrestamos/MisPrestamos';
import Perfil from './pages/Perfil/Perfil';
import Login from './pages/Login/Login';
import AccesoDenegado from './pages/AccesoDenegado/AccesoDenegado';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Inicio />} />
                    <Route
                      path="/usuarios"
                      element={
                        <ProtectedRoute soloAdmin>
                          <Usuarios />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/libros" element={<Libros />} />
                    <Route
                      path="/prestamos"
                      element={
                        <ProtectedRoute soloAdmin>
                          <Prestamos />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/mis-prestamos" element={<MisPrestamos />} />
                    <Route path="/perfil" element={<Perfil />} />
                    <Route path="/acceso-denegado" element={<AccesoDenegado />} />
                    <Route path="*" element={<AccesoDenegado />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

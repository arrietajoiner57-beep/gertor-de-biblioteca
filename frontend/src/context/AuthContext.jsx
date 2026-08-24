import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, getMe, TOKEN_KEY, USUARIO_KEY } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USUARIO_KEY));
    } catch (e) {
      return null;
    }
  });
  const [cargando, setCargando] = useState(!!localStorage.getItem(TOKEN_KEY));

  // Verifica con el backend que el token guardado siga siendo válido
  useEffect(() => {
    if (!token) {
      setCargando(false);
      return;
    }

    let activo = true;

    getMe()
      .then((response) => {
        if (!activo) return;
        setUsuario(response.data.usuario);
        localStorage.setItem(USUARIO_KEY, JSON.stringify(response.data.usuario));
      })
      .catch(() => {
        if (!activo) return;
        cerrarSesionSilenciosa();
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cerrarSesionSilenciosa() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    setToken(null);
    setUsuario(null);
  }

  async function iniciarSesion(email, contrasena) {
    const response = await loginApi({ email, contrasena });
    const { token: nuevoToken, usuario: nuevoUsuario } = response.data;

    localStorage.setItem(TOKEN_KEY, nuevoToken);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(nuevoUsuario));
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);

    return nuevoUsuario;
  }

  function cerrarSesion() {
    cerrarSesionSilenciosa();
  }

  function actualizarPerfil(nuevoUsuario) {
    setUsuario(nuevoUsuario);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(nuevoUsuario));
  }

  const valor = {
    token,
    usuario,
    cargando,
    autenticado: !!token && !!usuario,
    esAdmin: usuario ? usuario.rol === 'admin' : false,
    iniciarSesion,
    cerrarSesion,
    actualizarPerfil
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

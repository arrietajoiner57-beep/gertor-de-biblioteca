import axios from 'axios';

export const TOKEN_KEY = 'biblioteca_token';
export const USUARIO_KEY = 'biblioteca_usuario';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL
});

// Adjunta el token a cada petición si existe sesión
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si la sesión expira o es inválida, cierra la sesión automáticamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;
    const esLogin = config && config.url && config.url.includes('/auth/login');

    if (response && response.status === 401 && !esLogin) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USUARIO_KEY);
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expirada=1';
      }
    }

    return Promise.reject(error);
  }
);

// Extrae el mensaje legible que envía el backend
export function mensajeError(error, fallback = 'No se pudo completar la operación') {
  return (error.response && error.response.data && error.response.data.message) || fallback;
}

export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const cambiarContrasena = (data) => api.put('/auth/password', data);

export const getStatsAdmin = () => api.get('/stats');
export const getStatsUsuario = () => api.get('/stats/me');

export const getUsuarios = () => api.get('/usuarios');
export const getUsuario = (id) => api.get(`/usuarios/${id}`);
export const createUsuario = (data) => api.post('/usuarios', data);
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data);
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`);

export const getLibros = () => api.get('/libros');
export const getLibro = (id) => api.get(`/libros/${id}`);
export const createLibro = (data) => api.post('/libros', data);
export const updateLibro = (id, data) => api.put(`/libros/${id}`, data);
export const deleteLibro = (id) => api.delete(`/libros/${id}`);

export const getPrestamos = (estado) =>
  api.get('/prestamos', { params: estado ? { estado } : {} });
export const getMisPrestamos = (estado) =>
  api.get('/prestamos/mis', { params: estado ? { estado } : {} });
export const getPrestamo = (id) => api.get(`/prestamos/${id}`);
export const createPrestamo = (data) => api.post('/prestamos', data);
export const updatePrestamo = (id, data) => api.put(`/prestamos/${id}`, data);
export const devolverPrestamo = (id) => api.put(`/prestamos/${id}/devolver`);
export const deletePrestamo = (id) => api.delete(`/prestamos/${id}`);

export default api;

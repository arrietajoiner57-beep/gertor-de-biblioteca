import axios from 'axios';

export const TOKEN_KEY = 'biblioteca_token';
export const USUARIO_KEY = 'biblioteca_usuario';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;
    const esLogin = config && config.url && config.url.includes('/auth/login');
    const esPublico = config && config.url && (
      config.url.includes('/public/') ||
      config.url.includes('/auth/register')
    );

    if (response && response.status === 401 && !esLogin && !esPublico) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USUARIO_KEY);
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expirada=1';
      }
    }

    return Promise.reject(error);
  }
);

export function mensajeError(error, fallback = 'No se pudo completar la operación') {
  return (error.response && error.response.data && error.response.data.message) || fallback;
}

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const cambiarContrasena = (data) => api.put('/auth/password', data);

export const getPublicStats = () => api.get('/public/stats');
export const getFeaturedLibros = () => api.get('/public/featured-libros');

export const getStatsAdmin = () => api.get('/stats');
export const getStatsBibliotecario = () => api.get('/stats/bibliotecario');
export const getStatsUsuario = () => api.get('/stats/me');

export const getUsuarios = () => api.get('/usuarios');
export const getUsuario = (id) => api.get(`/usuarios/${id}`);
export const createUsuario = (data) => api.post('/usuarios', data);
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data);
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`);

export const getLibros = (q) => api.get('/libros', { params: q ? { q } : {} });
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
export const solicitarPrestamo = (data) => api.post('/prestamos/solicitar', data);
export const aprobarPrestamo = (id) => api.put(`/prestamos/${id}/aprobar`);
export const rechazarPrestamo = (id) => api.put(`/prestamos/${id}/rechazar`);
export const updatePrestamo = (id, data) => api.put(`/prestamos/${id}`, data);
export const devolverPrestamo = (id) => api.put(`/prestamos/${id}/devolver`);
export const deletePrestamo = (id) => api.delete(`/prestamos/${id}`);

export async function descargarReporte(seccion, formato) {
  const token = localStorage.getItem(TOKEN_KEY);
  const url = `${API_URL}/reportes/${seccion}/${formato}`;

  const respuesta = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  if (!respuesta.ok) {
    let msg = 'No se pudo generar el reporte';
    try {
      const data = await respuesta.json();
      msg = data.message || msg;
    } catch (e) { /* ignorar */ }
    throw new Error(msg);
  }

  const blob = await respuesta.blob();
  const nombre = `reporte_${seccion}_${Date.now()}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
  const urlObjeto = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = urlObjeto;
  link.download = nombre;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(urlObjeto);
  return nombre;
}

export default api;

import axios, { AxiosInstance } from 'axios';

// Configuración de las instancias de Axios
const API_USUARIOS_URL = import.meta.env.VITE_API_USUARIOS_URL || 'http://localhost:8001/api';
const API_CITAS_URL = import.meta.env.VITE_API_CITAS_URL || 'http://localhost:8002/api';

// Instancia para el servicio de usuarios
export const usuariosApi: AxiosInstance = axios.create({
  baseURL: API_USUARIOS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Instancia para el servicio de citas
export const citasApi: AxiosInstance = axios.create({
  baseURL: API_CITAS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT a todas las peticiones
const addAuthToken = (config: any) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

usuariosApi.interceptors.request.use(addAuthToken);
citasApi.interceptors.request.use(addAuthToken);

// Interceptor para manejar errores de autenticación
const handleAuthError = async (error: any) => {
  if (error.response?.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      try {
        // Intentar refrescar el token
        const response = await axios.post(`${API_USUARIOS_URL}/auth/token/refresh/`, {
          refresh: refreshToken
        });
        
        // Guardar el nuevo token
        localStorage.setItem('access_token', response.data.access);
        
        // Reintentar la petición original
        error.config.headers.Authorization = `Bearer ${response.data.access}`;
        return axios.request(error.config);
      } catch (refreshError) {
        // Si falla el refresh, cerrar sesión
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else {
      // No hay refresh token, redirigir a login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }
  
  return Promise.reject(error);
};

usuariosApi.interceptors.response.use(
  response => response,
  handleAuthError
);

citasApi.interceptors.response.use(
  response => response,
  handleAuthError
);

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const IP_SERVIDOR = '192.168.1.86'; // <-- Aquí cambias la IP para todo

// Configuración base para servicios en puerto 8001 (Usuarios y Mascotas)
export const authApi = axios.create({ 
  baseURL: `http://${IP_SERVIDOR}:8001`,
  headers: { 'Content-Type': 'application/json' }
});

export const mascotasApi = axios.create({ 
  baseURL: `http://${IP_SERVIDOR}:8001`,
  headers: { 'Content-Type': 'application/json' }
});

// Configuración base para servicios en puerto 8002 (Citas)
export const citasApi = axios.create({ 
  baseURL: `http://${IP_SERVIDOR}:8002`,
  headers: { 'Content-Type': 'application/json' }
});

/**
 * INTERCEPTOR DE SEGURIDAD
 * Aplicamos el token a todas las instancias para no repetir código
 */
const addTokenInterceptor = async (config: any) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Aplicar el interceptor a las instancias que lo necesiten
mascotasApi.interceptors.request.use(addTokenInterceptor);
citasApi.interceptors.request.use(addTokenInterceptor);
// En tu archivo central (donde tienes las IPs)
authApi.interceptors.request.use(addTokenInterceptor);
// authApi usualmente no lleva token en Login/Register, pero si lo necesitas:
// authApi.interceptors.request.use(addTokenInterceptor);
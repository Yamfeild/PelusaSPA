import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const IP_SERVIDOR = '192.168.1.86'; 


export const authApi = axios.create({ 
  baseURL: `http://${IP_SERVIDOR}:8001`,
  headers: { 'Content-Type': 'application/json' }
});

export const mascotasApi = axios.create({ 
  baseURL: `http://${IP_SERVIDOR}:8001`,
  headers: { 'Content-Type': 'application/json' }
});

export const citasApi = axios.create({ 
  baseURL: `http://${IP_SERVIDOR}:8002`,
  headers: { 'Content-Type': 'application/json' }
});

const addTokenInterceptor = async (config: any) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};


mascotasApi.interceptors.request.use(addTokenInterceptor);
citasApi.interceptors.request.use(addTokenInterceptor);

authApi.interceptors.request.use(addTokenInterceptor);

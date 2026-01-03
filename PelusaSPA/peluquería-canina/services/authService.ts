import { usuariosApi } from './api';

export interface LoginRequest {
  usuario: string;  // Puede ser username o email
  clave: string;
}

export interface RegisterRequest {
  username: string;
  correo: string;
  clave: string;
  clave_confirmacion: string;
  rol?: 'CLIENTE' | 'PELUQUERO' | 'ADMIN';
  nombre?: string;
  apellido?: string;
  fecha_nacimiento?: string;
  telefono?: string;
  direccion?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    rol: string;
  };
  persona?: any;
}

export interface User {
  id: number;
  username: string;
  email: string;
  rol: string;
}

export interface Profile {
  user: User;
  persona?: {
    id: number;
    nombre: string;
    apellido: string;
    telefono?: string;
    direccion?: string;
  };
  cliente?: any;
  peluquero?: any;
}

export interface Peluquero {
  id: number;
  username: string;
  email: string;
  rol: string;
  persona?: {
    nombre: string;
    apellido: string;
    telefono?: string;
  };
  perfil?: {
    especialidad?: string;
    experiencia?: string;
  };
}

// Función para extraer mensajes de error
function getErrorMessage(error: any): string {
  if (error.response?.data) {
    const data = error.response.data;
    
    // Si es un objeto con campos específicos
    if (typeof data === 'object' && !Array.isArray(data)) {
      // Buscar el primer error
      for (const key in data) {
        const value = data[key];
        if (Array.isArray(value)) {
          return value[0] || 'Error en validación';
        }
        if (typeof value === 'string') {
          return value;
        }
      }
    }
    
    // Si es un string directo
    if (typeof data === 'string') {
      return data;
    }
    
    // Si tiene un error general
    if (data.error) {
      return data.error;
    }
  }
  
  return error.message || 'Error desconocido';
}

// Servicio de autenticación
export const authService = {
  // Iniciar sesión
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await usuariosApi.post('/auth/login/', credentials);
      const data = response.data;
      
      // El backend devuelve tokens anidados, normalizarlos
      if (data.tokens) {
        return {
          access: data.tokens.access,
          refresh: data.tokens.refresh,
          user: data.user,
          persona: data.persona
        };
      }
      
      return data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Registrarse
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await usuariosApi.post('/auth/registro/', data);
      const responseData = response.data;
      
      // El backend devuelve tokens anidados, normalizarlos
      if (responseData.tokens) {
        return {
          access: responseData.tokens.access,
          refresh: responseData.tokens.refresh,
          user: responseData.user,
          persona: responseData.persona
        };
      }
      
      return responseData;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Obtener perfil del usuario autenticado
  async getProfile(): Promise<Profile> {
    try {
      const response = await usuariosApi.get('/auth/perfil/');
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Actualizar perfil del usuario autenticado
  async updateProfile(data: {
    nombre?: string;
    apellido?: string;
    telefono?: string;
    direccion?: string;
  }): Promise<Profile> {
    try {
      const response = await usuariosApi.put('/auth/perfil/', data);
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Refrescar token
  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    try {
      const response = await usuariosApi.post('/auth/token/refresh/', {
        refresh: refreshToken
      });
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Cerrar sesión (limpiar tokens locales)
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  // Obtener lista de peluqueros
  async getPeluqueros(): Promise<Peluquero[]> {
    try {
      const response = await usuariosApi.get('/usuarios/peluqueros/');
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  }
};

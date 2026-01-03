import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, LoginRequest, RegisterRequest, AuthResponse, Profile } from '../services';

interface User {
  id: number;
  username: string;
  email: string;
  rol: string;
  persona?: {
    id: number;
    nombre: string;
    apellido: string;
    telefono?: string;
    direccion?: string;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay un token al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          
          // Intentar obtener el perfil actualizado
          const profile = await authService.getProfile();
          const userData: User = {
            ...profile.user,
            persona: profile.persona
          };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Error al verificar autenticación:', error);
          // Si falla, limpiar el estado
          logout();
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response: AuthResponse = await authService.login(credentials);
      
      // Guardar tokens y datos del usuario
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      
      const userData: User = {
        ...response.user,
        persona: response.persona
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      throw new Error(error.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response: AuthResponse = await authService.register(data);
      
      // Guardar tokens y datos del usuario
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      
      const userData: User = {
        ...response.user,
        persona: response.persona
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Error al registrarse:', error);
      throw new Error(error.response?.data?.error || 'Error al registrarse');
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshProfile = async () => {
    try {
      const profile: Profile = await authService.getProfile();
      const userData: User = {
        ...profile.user,
        persona: profile.persona
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

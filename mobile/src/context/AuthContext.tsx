import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../api/client'; // <-- Corregido el nombre de la importación

interface User {
  id: number;
  username: string;
  email: string;
  rol: string;
}

interface AuthContextData {
  signed: boolean;
  token: string | null;
  user: User | null;
  signIn(credentials: object): Promise<User>;
  signOut(): void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storageToken = await SecureStore.getItemAsync('auth_token');
      const storageUser = await SecureStore.getItemAsync('auth_user');
      
      if (storageToken) {
        setToken(storageToken);
        authApi.defaults.headers.Authorization = `Bearer ${storageToken}`;
      }
      
      if (storageUser) {
        setUser(JSON.parse(storageUser));
      }
      
      setLoading(false);
    }
    loadStorageData();
  }, []);

  async function signIn(credentials: object) {
    try {
      const response = await authApi.post('/api/auth/login/', credentials);
      const tokenRecibido = response.data.tokens?.access;
      const usuarioRecibido = response.data.user;

      if (tokenRecibido) {
        setToken(tokenRecibido);
        setUser(usuarioRecibido);
        authApi.defaults.headers.Authorization = `Bearer ${tokenRecibido}`;
        
        await SecureStore.setItemAsync('auth_token', String(tokenRecibido));
        await SecureStore.setItemAsync('auth_user', JSON.stringify(usuarioRecibido));
        
        return usuarioRecibido;
      } else {
        throw new Error("No se encontró el token en la respuesta");
      }
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  }

  function signOut() {
    Promise.all([
      SecureStore.deleteItemAsync('auth_token'),
      SecureStore.deleteItemAsync('auth_user')
    ]).then(() => {
      setToken(null);
      setUser(null);
      delete authApi.defaults.headers.Authorization;
    });
  }

  return (
  <AuthContext.Provider value={{ signed: !!token, token, user, signIn, signOut, loading }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
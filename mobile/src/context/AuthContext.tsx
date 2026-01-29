import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api/client';

// Definimos la interfaz del usuario según lo que envía tu backend
interface User {
  id: number;
  username: string;
  email: string;
  rol: string;
}

interface AuthContextData {
  signed: boolean;
  token: string | null;
  user: User | null; // Nuevo: Para saber quién está conectado
  signIn(credentials: object): Promise<User>;
  signOut(): void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); // Nuevo estado
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storageToken = await SecureStore.getItemAsync('auth_token');
      const storageUser = await SecureStore.getItemAsync('auth_user');
      
      if (storageToken) {
        setToken(storageToken);
        api.defaults.headers.Authorization = `Bearer ${storageToken}`;
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
      const response = await api.post('/api/auth/login/', credentials);
      
      // Estructura detectada en tu log anterior: response.data.tokens y response.data.user
      const tokenRecibido = response.data.tokens?.access;
      const usuarioRecibido = response.data.user;

      if (tokenRecibido) {
        setToken(tokenRecibido);
        setUser(usuarioRecibido);
        
        api.defaults.headers.Authorization = `Bearer ${tokenRecibido}`;
        
        // Guardamos token y datos del usuario (convertidos a texto)
        await SecureStore.setItemAsync('auth_token', String(tokenRecibido));
        await SecureStore.setItemAsync('auth_user', JSON.stringify(usuarioRecibido));
        
        console.log("¡Sesión iniciada como:", usuarioRecibido.rol, "!");
        
        // Retornamos el usuario para que el LoginScreen pueda validarlo
        return usuarioRecibido;
      } else {
        console.error("No se encontró el token en la respuesta");
        throw new Error("No se encontró el token en la respuesta");
      }
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  }

  function signOut() {
    // Limpiamos todo el rastro de la sesión
    Promise.all([
      SecureStore.deleteItemAsync('auth_token'),
      SecureStore.deleteItemAsync('auth_user')
    ]).then(() => {
      setToken(null);
      setUser(null);
    });
  }

  return (
    // Ahora signed depende de tener el token y el usuario cargado
    <AuthContext.Provider value={{ signed: !!token, token, user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
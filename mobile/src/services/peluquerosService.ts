import { authApi } from '../api/client'; // Importamos la instancia central del puerto 8001

export interface Persona {
  nombre: string;
  apellido: string;
  fecha_nacimiento?: string;
  telefono?: string;
}

export interface Peluquero {
  id: number;
  username: string;
  email: string;
  rol: string;
  persona?: Persona;
  nombre?: string; // Campo de conveniencia que armamos nosotros
}

export const peluquerosService = {
  // Obtener todos los peluqueros
  async getPeluqueros(): Promise<Peluquero[]> {
    try {
      // Usamos authApi: ya tiene la IP, el puerto 8001 y el Token JWT inyectado
      const response = await authApi.get('/api/usuarios/?rol=PELUQUERO');
      
      // Mapeamos los datos para que sean fáciles de usar en la App
      return response.data.map((user: any) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        rol: user.rol,
        persona: user.persona,
        nombre: user.persona?.nombre 
          ? `${user.persona.nombre} ${user.persona.apellido || ''}`.trim() 
          : user.username,
      }));
    } catch (error) {
      console.error('Error al obtener peluqueros:', error);
      throw error;
    }
  },

  // Obtener un peluquero por ID
  async getPeluquero(id: number): Promise<Peluquero> {
    try {
      const response = await authApi.get(`/api/usuarios/${id}/`);
      const user = response.data;
      
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        rol: user.rol,
        persona: user.persona,
        nombre: user.persona?.nombre 
          ? `${user.persona.nombre} ${user.persona.apellido || ''}`.trim() 
          : user.username,
      };
    } catch (error) {
      console.error('Error al obtener peluquero:', error);
      throw error;
    }
  },
};
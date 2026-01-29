import { citasApi } from '../api/client';

export interface Mascota {
  id: number;
  dueno_id: number;
  nombre: string;
  raza: string;
  edad: number;
  creada_en?: string;
  actualizada_en?: string;
}

export interface MascotaCreate {
  nombre: string;
  raza: string;
  edad: number;
}

// Servicio de mascotas
export const mascotasService = {
  // Obtener todas las mascotas del usuario
  async getMascotas(): Promise<Mascota[]> {
    try {
      const response = await citasApi.get('/api/mascotas/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener mascotas:', error);
      throw error;
    }
  },

  // Obtener una mascota específica
  async getMascota(id: number): Promise<Mascota> {
    try {
      const response = await citasApi.get(`/api/mascotas/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener mascota:', error);
      throw error;
    }
  },

  // Crear una nueva mascota
  async createMascota(data: MascotaCreate): Promise<Mascota> {
    try {
      const response = await citasApi.post('/api/mascotas/', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear mascota:', error);
      throw error;
    }
  },

  // Actualizar una mascota
  async updateMascota(id: number, data: Partial<MascotaCreate>): Promise<Mascota> {
    try {
      const response = await citasApi.put(`/api/mascotas/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar mascota:', error);
      throw error;
    }
  },

  // Eliminar una mascota
  async deleteMascota(id: number): Promise<void> {
    try {
      await citasApi.delete(`/api/mascotas/${id}/`);
    } catch (error) {
      console.error('Error al eliminar mascota:', error);
      throw error;
    }
  },
};

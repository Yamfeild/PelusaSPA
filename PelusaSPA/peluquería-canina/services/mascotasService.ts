import { citasApi } from './api';

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
    const response = await citasApi.get('/mascotas/');
    return response.data;
  },

  // Obtener una mascota específica
  async getMascota(id: number): Promise<Mascota> {
    const response = await citasApi.get(`/mascotas/${id}/`);
    return response.data;
  },

  // Crear una nueva mascota
  async createMascota(data: MascotaCreate): Promise<Mascota> {
    const response = await citasApi.post('/mascotas/', data);
    return response.data;
  },

  // Actualizar una mascota
  async updateMascota(id: number, data: Partial<MascotaCreate>): Promise<Mascota> {
    const response = await citasApi.put(`/mascotas/${id}/`, data);
    return response.data;
  },

  // Actualización parcial de una mascota
  async patchMascota(id: number, data: Partial<MascotaCreate>): Promise<Mascota> {
    const response = await citasApi.patch(`/mascotas/${id}/`, data);
    return response.data;
  },

  // Eliminar una mascota
  async deleteMascota(id: number): Promise<void> {
    await citasApi.delete(`/mascotas/${id}/`);
  }
};

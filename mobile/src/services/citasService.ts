import { citasApi } from '../api/client';

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  duracion_minutos: number;
  precio: number;
  imagen_url?: string;
  activo: boolean;
}

export interface Peluquero {
  id: number;
  nombre: string;
  email?: string;
}

export interface Horario {
  id: number;
  peluquero_id: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
}

export interface Cita {
  id: number;
  mascota: number;
  servicio: number;
  peluquero_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  notas?: string;
  creada_en?: string;
  actualizada_en?: string;
}

export interface CitaCreate {
  mascota: number;
  servicio: number;
  peluquero_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  notas?: string;
}

// Servicio de citas
export const citasService = {
  // Obtener todos los servicios disponibles
  async getServicios(): Promise<Servicio[]> {
    try {
      const response = await citasApi.get('/api/servicios/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener servicios:', error);
      throw error;
    }
  },

  // Obtener un servicio específico
  async getServicio(id: number): Promise<Servicio> {
    try {
      const response = await citasApi.get(`/api/servicios/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener servicio:', error);
      throw error;
    }
  },

  // Obtener todos los horarios disponibles
  async getHorarios(peluqueroId?: number, fecha?: string): Promise<Horario[]> {
    try {
      // Construimos los parámetros de búsqueda
      const params: any = {};
      if (peluqueroId) params.peluquero_id = peluqueroId;
      if (fecha) params.fecha = fecha;

      const response = await citasApi.get('/api/horarios/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener horarios:', error);
      throw error;
    }
  },

  // Obtener horarios de un peluquero específico
  async getHorariosPeluquero(peluqueroId: number): Promise<Horario[]> {
    try {
      const response = await citasApi.get(`/api/horarios/?peluquero_id=${peluqueroId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener horarios del peluquero:', error);
      throw error;
    }
  },

  // Obtener todas las citas del usuario
  async getCitas(): Promise<Cita[]> {
    try {
      const response = await citasApi.get('/api/citas/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener citas:', error);
      throw error;
    }
  },

  // Obtener una cita específica
  async getCita(id: number): Promise<Cita> {
    try {
      const response = await citasApi.get(`/api/citas/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener cita:', error);
      throw error;
    }
  },

  // Crear una nueva cita
  async createCita(data: CitaCreate): Promise<Cita> {
    try {
      const response = await citasApi.post('/api/citas/', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear cita:', error);
      throw error;
    }
  },

  // Actualizar una cita
  async updateCita(id: number, data: Partial<CitaCreate>): Promise<Cita> {
    try {
      const response = await citasApi.put(`/api/citas/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      throw error;
    }
  },

  // Cancelar una cita
  async cancelarCita(id: number): Promise<Cita> {
    try {
      const response = await citasApi.patch(`/api/citas/${id}/`, {
        estado: 'CANCELADA'
      });
      return response.data;
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      throw error;
    }
  },

  // Eliminar una cita
  async deleteCita(id: number): Promise<void> {
    try {
      await citasApi.delete(`/api/citas/${id}/`);
    } catch (error) {
      console.error('Error al eliminar cita:', error);
      throw error;
    }
  },
};

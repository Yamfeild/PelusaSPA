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
  mascota_nombre?: string;
  servicio: number;
  servicio_nombre?: string;
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


  async getServicio(id: number): Promise<Servicio> {
    try {
      const response = await citasApi.get(`/api/servicios/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener servicio:', error);
      throw error;
    }
  },

  
  async getHorarios(peluqueroId?: number, fecha?: string): Promise<Horario[]> {
    try {
      
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

  
  async getHorariosPeluquero(peluqueroId: number): Promise<Horario[]> {
    try {
      const response = await citasApi.get(`/api/horarios/?peluquero_id=${peluqueroId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener horarios del peluquero:', error);
      throw error;
    }
  },

  
  async getCitas(): Promise<Cita[]> {
    try {
      const response = await citasApi.get('/api/citas/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener citas:', error);
      throw error;
    }
  },

 
  async getCita(id: number): Promise<Cita> {
    try {
      const response = await citasApi.get(`/api/citas/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener cita:', error);
      throw error;
    }
  },

  
  async createCita(data: CitaCreate): Promise<Cita> {
    try {
      const response = await citasApi.post('/api/citas/', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear cita:', error);
      throw error;
    }
  },

  
  async updateCita(id: number, data: Partial<CitaCreate>): Promise<Cita> {
    try {
      const response = await citasApi.put(`/api/citas/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      throw error;
    }
  },

  
  // En citasService.ts
async cancelarCita(id: number): Promise<Cita> {
    try {
      // Usamos POST y la ruta exacta que usa tu Web
      // Asegúrate de que la URL termine en / para evitar errores de redirección en Django
      const response = await citasApi.post(`/api/citas/${id}/cancelar/`);
      return response.data;
    } catch (error: any) {
      console.error('Error al cancelar cita:', error.response?.data || error.message);
      throw error;
    }
  },

  // REAGENDAR (También podrías necesitarlo igual que en la Web)
  async reagendarCita(id: number, data: { fecha: string; hora_inicio: string; hora_fin: string }): Promise<Cita> {
    try {
      const response = await citasApi.post(`/api/citas/${id}/reagendar/`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error al reagendar:', error.response?.data);
      throw error;
    }
  },

  
  async deleteCita(id: number): Promise<void> {
    try {
      await citasApi.delete(`/api/citas/${id}/`);
    } catch (error) {
      console.error('Error al eliminar cita:', error);
      throw error;
    }
  },
};

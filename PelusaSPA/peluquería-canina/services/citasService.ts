import { citasApi } from './api';

export interface Cita {
  id: number;
  mascota: number;
  mascota_nombre?: string;
  cliente_id?: number;
  peluquero_id: number;
  peluquero_nombre?: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'FINALIZADA' | 'CANCELADA';
  estado_display?: string;
  notas?: string;
  creada_en?: string;
  actualizada_en?: string;
}

export interface CitaCreate {
  mascota_id: number;
  servicio: string;
  peluquero_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  notas?: string;
}

export interface Horario {
  id: number;
  peluquero_id: number;
  peluquero_nombre?: string;
  dia_semana: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Lunes, 6=Domingo
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
}

// Servicio de citas
export const citasService = {
  // Obtener todas las citas del usuario
  async getCitas(): Promise<Cita[]> {
    const response = await citasApi.get('/citas/');
    return response.data;
  },

  // Obtener una cita específica
  async getCita(id: number): Promise<Cita> {
    const response = await citasApi.get(`/citas/${id}/`);
    return response.data;
  },

  // Crear una nueva cita
  async createCita(data: CitaCreate): Promise<Cita> {
    // El backend espera 'mascota' en lugar de 'mascota_id'
    const { mascota_id, servicio, ...rest } = data;
    const payload = {
      mascota: mascota_id,
      ...rest,
      notas: data.notas || `Servicio: ${servicio}`
    };
    const response = await citasApi.post('/citas/', payload);
    return response.data;
  },

  // Cancelar una cita
  async cancelarCita(id: number): Promise<Cita> {
    const response = await citasApi.post(`/citas/${id}/cancelar/`);
    return response.data;
  },

  // Reagendar una cita
  async reagendarCita(id: number, data: { fecha: string; hora_inicio: string; hora_fin: string }): Promise<Cita> {
    const response = await citasApi.post(`/citas/${id}/reagendar/`, data);
    return response.data;
  },

  // Obtener horarios disponibles
  async getHorarios(peluqueroId?: number): Promise<Horario[]> {
    const params = peluqueroId ? { peluquero_id: peluqueroId } : {};
    const response = await citasApi.get('/horarios/', { params });
    return response.data;
  },

  // Obtener slots disponibles para una fecha
  async getSlotsDisponibles(peluqueroId: number, fecha: string): Promise<any> {
    const response = await citasApi.get(`/citas/slots_disponibles/`, {
      params: { peluquero_id: peluqueroId, fecha }
    });
    return response.data;
  }
};

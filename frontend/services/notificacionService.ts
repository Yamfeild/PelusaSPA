import { citasApi } from './api';

export interface Notificacion {
  id: number;
  peluquero_id: number;
  cita: number;
  cita_info: {
    id: number;
    mascota_nombre: string;
    fecha: string;
    hora: string;
    estado: string;
  };
  tipo: string;
  tipo_display: string;
  mensaje: string;
  leida: boolean;
  creada_en: string;
}

export const notificacionService = {
  /**
   * Obtener todas las notificaciones del peluquero autenticado
   */
  async obtenerNotificaciones() {
    try {
      const response = await citasApi.get('/notificaciones/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      throw error;
    }
  },

  /**
   * Obtener solo notificaciones no leídas
   */
  async obtenerNotificacionesNoLeidas() {
    try {
      const response = await citasApi.get('/notificaciones/unread/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener notificaciones no leídas:', error);
      throw error;
    }
  },

  /**
   * Obtener cantidad de notificaciones no leídas
   */
  async obtenerCantidadNoLeidas() {
    try {
      const response = await citasApi.get('/notificaciones/unread_count/');
      return response.data.count;
    } catch (error) {
      console.error('Error al obtener cantidad de notificaciones no leídas:', error);
      throw error;
    }
  },

  /**
   * Marcar una notificación como leída
   */
  async marcarComoLeida(notificacionId: number) {
    try {
      const response = await citasApi.post(`/notificaciones/${notificacionId}/mark_as_read/`);
      return response.data;
    } catch (error) {
      console.error(`Error al marcar notificación ${notificacionId} como leída:`, error);
      throw error;
    }
  },

  /**
   * Marcar todas las notificaciones como leídas
   */
  async marcarTodasComoLeidas() {
    try {
      const response = await citasApi.post('/notificaciones/mark_all_read/');
      return response.data;
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      throw error;
    }
  },

  /**
   * Generar recordatorios para citas próximas (hoy/mañana)
   */
  async generarRecordatorios() {
    try {
      const response = await citasApi.post('/notificaciones/generate_upcoming_reminders/');
      return response.data;
    } catch (error) {
      console.error('Error al generar recordatorios:', error);
      throw error;
    }
  },
};

import { citasApi } from '../api/client';

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
  async obtenerNotificaciones(): Promise<Notificacion[]> {
    try {
      // Usamos la ruta completa que definiste que funciona
      const response = await citasApi.get('/api/notificaciones/');
      return response.data;
    } catch (error) {
      throw error; // Dejamos que el componente maneje el error
    }
  },

  /**
   * Obtener cantidad de notificaciones no leídas para el badge del icono
   */
 async obtenerCantidadNoLeidas(): Promise<number> {
    try {
      const response = await citasApi.get('/api/notificaciones/unread_count/');
      // Manejamos si el backend devuelve un objeto { count: X } o un número directo
      return typeof response.data === 'object' ? response.data.count : response.data;
    } catch (error) {
      console.error('Error al obtener conteo:', error);
      throw error;
    }
  },
  /**
   * Marcar una notificación específica como leída
   */
async marcarComoLeida(id: number) {
    try {
      // Corregido: eliminado la doble diagonal al final
      const response = await citasApi.post(`/api/notificaciones/${id}/mark_as_read/`);
      return response.data;
    } catch (error) {
      console.error(`Error al marcar notificación ${id}:`, error);
      throw error;
    }
  },

  async crearNotificacionCita(citaId: number) {
     try {
       // Este endpoint debería encargarse de avisar a ambas partes en el servidor
       const response = await citasApi.post(`/api/notificaciones/`, { cita: citaId, tipo: 'NUEVA_CITA' });
       return response.data;
     } catch (error) {
       console.error('Error al crear notificación de cita:', error);
     }
  },
  /**
   * Marcar absolutamente todas como leídas
   */
async marcarTodasComoLeidas() {
    try {
      const response = await citasApi.post('/api/notificaciones/mark_all_read/');
      return response.data;
    } catch (error) {
      console.error('Error al marcar todas:', error);
      throw error;
    }
  }
};
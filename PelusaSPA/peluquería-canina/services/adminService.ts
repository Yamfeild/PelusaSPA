import { usuariosApi } from './api';
import { citasApi } from './api';

export interface RegistroPeluquero {
  username: string;
  email: string;
  clave: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  especialidad?: string;
  experiencia?: number;
}

export interface Peluquero {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  persona: {
    nombre: string;
    apellido: string;
    telefono?: string;
  };
  perfil?: {
    especialidad?: string;
    experiencia?: number;
  };
}

export interface Servicio {
  id?: number;
  nombre: string;
  descripcion: string;
  duracion_minutos: number;
  precio: number;
  imagen_url?: string;
  activo: boolean;
}

export interface Horario {
  id?: number;
  peluquero_id: number;
  dia_semana: number; // 0=Lunes, 6=Domingo
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
}

export const adminService = {
  // ============ PELUQUEROS ============
  
  async registrarPeluquero(data: RegistroPeluquero): Promise<Peluquero> {
    const response = await usuariosApi.post('/auth/registro/', {
      username: data.username,
      correo: data.email,  // Backend espera 'correo' no 'email'
      clave: data.clave,
      clave_confirmacion: data.clave,  // El backend requiere confirmación
      rol: 'PELUQUERO',
      nombre: data.nombre,
      apellido: data.apellido,
      fecha_nacimiento: '1990-01-01',  // Valor por defecto, el admin puede actualizarlo después
      telefono: data.telefono || '',
      identificacion: '',  // Opcional
      especialidad: data.especialidad || '',
      experiencia: data.experiencia?.toString() || ''
    });
    return response.data;
  },

  async getPeluqueros(): Promise<Peluquero[]> {
    const response = await usuariosApi.get('/usuarios/peluqueros/');
    return response.data;
  },

  async getPeluquero(id: number): Promise<Peluquero> {
    const response = await usuariosApi.get(`/usuarios/${id}/`);
    return response.data;
  },

  async updatePeluquero(id: number, data: Partial<Peluquero>): Promise<Peluquero> {
    const response = await usuariosApi.patch(`/usuarios/${id}/`, data);
    return response.data;
  },

  async deletePeluquero(id: number, forceDelete: boolean = false): Promise<void> {
    const url = forceDelete 
      ? `/usuarios/${id}/?force_delete=true` 
      : `/usuarios/${id}/`;
    await usuariosApi.delete(url);
  },

  // ============ SERVICIOS ============
  
  async getServicios(): Promise<Servicio[]> {
    const response = await citasApi.get('/servicios/');
    return response.data;
  },

  async createServicio(data: Servicio): Promise<Servicio> {
    const response = await citasApi.post('/servicios/', data);
    return response.data;
  },

  async updateServicio(id: number, data: Partial<Servicio>): Promise<Servicio> {
    const response = await citasApi.patch(`/servicios/${id}/`, data);
    return response.data;
  },

  async deleteServicio(id: number): Promise<void> {
    await citasApi.delete(`/servicios/${id}/`);
  },

  // ============ HORARIOS ============
  
  async getHorarios(peluqueroId?: number): Promise<Horario[]> {
    const params = peluqueroId ? { peluquero_id: peluqueroId } : {};
    const response = await citasApi.get('/horarios/', { params });
    return response.data;
  },

  async createHorario(data: Horario): Promise<Horario> {
    const response = await citasApi.post('/horarios/', data);
    return response.data;
  },

  async updateHorario(id: number, data: Partial<Horario>): Promise<Horario> {
    const response = await citasApi.patch(`/horarios/${id}/`, data);
    return response.data;
  },

  async deleteHorario(id: number): Promise<void> {
    await citasApi.delete(`/horarios/${id}/`);
  }
};

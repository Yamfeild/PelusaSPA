// Servicio para gestionar notificaciones del navegador
export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Verificar si las notificaciones están soportadas
  isSupported(): boolean {
    return 'Notification' in window;
  }

  // Obtener el estado actual de los permisos
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  // Solicitar permiso para mostrar notificaciones
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('Las notificaciones no están soportadas en este navegador');
      return 'denied';
    }

    if (this.getPermission() === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('Error al solicitar permiso de notificaciones:', error);
      return 'denied';
    }
  }

  // Mostrar una notificación
  showNotification(title: string, options?: NotificationOptions): Notification | null {
    if (!this.isSupported() || this.getPermission() !== 'granted') {
      console.warn('No se pueden mostrar notificaciones');
      return null;
    }

    try {
      const notificationOptions: any = {
        icon: '/logo.png',
        badge: '/logo.png',
        ...options,
      };
      
      const notification = new Notification(title, notificationOptions);

      // Auto-cerrar después de 10 segundos
      setTimeout(() => notification.close(), 10000);

      return notification;
    } catch (error) {
      console.error('Error al mostrar notificación:', error);
      return null;
    }
  }

  // Mostrar notificación de recordatorio de cita
  showAppointmentReminder(
    mascotaNombre: string,
    servicio: string,
    fecha: string,
    hora: string
  ): void {
    this.showNotification('🐕 Recordatorio de Cita', {
      body: `Tu cita para ${mascotaNombre} (${servicio}) es el ${fecha} a las ${hora}`,
      tag: 'appointment-reminder',
      requireInteraction: false,
    });
  }

  // Mostrar notificación de cita confirmada
  showAppointmentConfirmed(mascotaNombre: string, fecha: string, hora: string): void {
    this.showNotification('✅ Cita Confirmada', {
      body: `Tu cita para ${mascotaNombre} ha sido confirmada para el ${fecha} a las ${hora}`,
      tag: 'appointment-confirmed',
    });
  }

  // Mostrar notificación de cita cancelada
  showAppointmentCancelled(mascotaNombre: string): void {
    this.showNotification('❌ Cita Cancelada', {
      body: `La cita para ${mascotaNombre} ha sido cancelada`,
      tag: 'appointment-cancelled',
    });
  }

  // Calcular tiempo hasta una fecha
  getTimeUntil(fecha: string, hora: string): number {
    const fechaCita = new Date(`${fecha}T${hora}`);
    const ahora = new Date();
    return fechaCita.getTime() - ahora.getTime();
  }

  // Verificar si una cita está próxima (menos de 24 horas)
  isAppointmentSoon(fecha: string, hora: string): boolean {
    const timeUntil = this.getTimeUntil(fecha, hora);
    const hours = timeUntil / (1000 * 60 * 60);
    return hours > 0 && hours <= 24;
  }

  // Programar recordatorio para una cita
  scheduleReminder(
    citaId: number,
    mascotaNombre: string,
    servicio: string,
    fecha: string,
    hora: string,
    horasAntes: number = 24
  ): number | null {
    const timeUntil = this.getTimeUntil(fecha, hora);
    const reminderTime = timeUntil - (horasAntes * 60 * 60 * 1000);

    if (reminderTime <= 0) {
      // La cita ya pasó o es muy pronto
      return null;
    }

    const timerId = window.setTimeout(() => {
      this.showAppointmentReminder(mascotaNombre, servicio, fecha, hora);
    }, reminderTime);

    return timerId;
  }
}

export const notificationService = NotificationService.getInstance();

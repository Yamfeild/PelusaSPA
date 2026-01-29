import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { citasService } from '../services';

interface Notificacion {
  id: number;
  tipo: 'recordatorio' | 'confirmada' | 'cancelada' | 'reprogramada';
  titulo: string;
  descripcion: string;
  mascota_nombre?: string;
  fecha_cita?: string;
  hora_cita?: string;
  fecha_creacion: string;
  leida: boolean;
}

const NotificacionesPage: React.FC = () => {
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todas' | 'proximas' | 'sin-leer'>('todas');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadNotificaciones();
  }, []);

  const loadNotificaciones = async () => {
    try {
      setLoading(true);
      // Cargar citas próximas como notificaciones
      const data = await citasService.getCitasProximas(72); // 3 días
      setNotificaciones(data.citas || []);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificacionesFiltradasess = () => {
    if (filtro === 'proximas') {
      return notificaciones.filter(n => 
        new Date(n.fecha + 'T' + n.hora_inicio) > new Date()
      );
    }
    return notificaciones;
  };

  const notificacionesFiltradas = getNotificacionesFiltradasess();

  const handleMarcarComoLeida = (id: number) => {
    // Aquí iría la lógica para marcar como leída
    console.log('Marcada como leída:', id);
  };

  const handleMarcarTodas = () => {
    // Aquí iría la lógica para marcar todas como leídas
    console.log('Marcadas todas como leídas');
  };

  const handleEliminar = (id: number) => {
    setNotificaciones(notificaciones.filter(n => n.id !== id));
  };

  const fullName = user?.persona
    ? `${user.persona.nombre || ''} ${user.persona.apellido || (user.persona as any).apellidos || ''}`.trim()
    : user?.username || 'Usuario';

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-subtext-light dark:text-subtext-dark hover:text-text-light dark:hover:text-text-dark mb-4 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-medium">Volver</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">Notificaciones</h1>
              <p className="text-subtext-light dark:text-subtext-dark mt-1">{fullName}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{notificacionesFiltradas.length}</p>
              <p className="text-xs text-subtext-light dark:text-subtext-dark">notificaciones</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar con filtros */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="font-semibold text-text-light dark:text-text-dark mb-4">Filtros</h2>
                
                <div className="space-y-2">
                  <button
                    onClick={() => setFiltro('todas')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      filtro === 'todas'
                        ? 'bg-primary/20 text-primary'
                        : 'text-text-light dark:text-text-dark hover:bg-background-light dark:hover:bg-background-dark'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">inbox</span>
                      <span className="font-medium">Todas</span>
                    </span>
                  </button>

                  <button
                    onClick={() => setFiltro('proximas')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      filtro === 'proximas'
                        ? 'bg-primary/20 text-primary'
                        : 'text-text-light dark:text-text-dark hover:bg-background-light dark:hover:bg-background-dark'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">schedule</span>
                      <span className="font-medium">Próximas</span>
                    </span>
                  </button>

                  <button
                    onClick={() => setFiltro('sin-leer')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      filtro === 'sin-leer'
                        ? 'bg-primary/20 text-primary'
                        : 'text-text-light dark:text-text-dark hover:bg-background-light dark:hover:bg-background-dark'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">mail</span>
                      <span className="font-medium">Sin leer</span>
                    </span>
                  </button>
                </div>

                <div className="border-t border-border-light dark:border-border-dark mt-4 pt-4">
                  <button
                    onClick={handleMarcarTodas}
                    className="w-full px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
                  >
                    ✓ Marcar todo como leído
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-subtext-light dark:text-subtext-dark">Cargando notificaciones...</p>
              </div>
            ) : notificacionesFiltradas.length === 0 ? (
              <div className="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">notifications_none</span>
                <p className="text-text-light dark:text-text-dark font-semibold mb-2">No hay notificaciones</p>
                <p className="text-subtext-light dark:text-subtext-dark text-sm">
                  {filtro === 'todas' ? 'No tienes notificaciones en este momento' : 'No hay notificaciones que coincidan con el filtro'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notificacionesFiltradas.map((notificacion) => (
                  <div
                    key={notificacion.id}
                    className="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* Ícono */}
                      <div className="w-12 h-12 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary">
                          {notificacion.estado === 'CONFIRMADA' ? 'check_circle' : 'calendar_today'}
                        </span>
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-text-light dark:text-text-dark">
                              {notificacion.mascota_nombre || 'Mascota'} - {notificacion.notas?.replace('Servicio: ', '') || 'Servicio'}
                            </h3>
                            <p className="text-sm text-subtext-light dark:text-subtext-dark mt-1">
                              Cita programada para el {new Date(notificacion.fecha).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })} a las {notificacion.hora_inicio}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                            notificacion.estado === 'CONFIRMADA'
                              ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                              : notificacion.estado === 'PENDIENTE'
                              ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                              : 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
                          }`}>
                            {notificacion.estado}
                          </span>
                        </div>

                        {/* Tiempo transcurrido */}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border-light dark:border-border-dark">
                          <span className="text-xs text-subtext-light dark:text-subtext-dark flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            hace {Math.floor((Date.now() - new Date(notificacion.fecha).getTime()) / (1000 * 60))} minutos
                          </span>
                          <button
                            onClick={() => handleMarcarComoLeida(notificacion.id)}
                            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                          >
                            ✓ Marcar como leída
                          </button>
                          <button
                            onClick={() => handleEliminar(notificacion.id)}
                            className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificacionesPage;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificacionService, Notificacion } from '../services/notificacionService';

export default function Notificaciones() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);

  // Redirigir si no es peluquero
  useEffect(() => {
    if (user && user.rol !== 'PELUQUERO') {
      navigate('/');
    }
  }, [user, navigate]);

  // Cargar notificaciones
  useEffect(() => {
    loadNotificaciones();
    // Auto-refresh cada 30 segundos
    const interval = setInterval(loadNotificaciones, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotificaciones = async () => {
    try {
      setLoading(true);
      const data = await notificacionService.obtenerNotificaciones();
      setNotificaciones(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarComoLeida = async (notificacionId: number) => {
    try {
      await notificacionService.marcarComoLeida(notificacionId);
      loadNotificaciones();
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  };

  const handleMarcarTodasComoLeidas = async () => {
    try {
      await notificacionService.marcarTodasComoLeidas();
      loadNotificaciones();
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
  };

  const handleGenerarRecordatorios = async () => {
    try {
      const result = await notificacionService.generarRecordatorios();
      console.log('Recordatorios generados:', result);
      loadNotificaciones();
    } catch (error) {
      console.error('Error generando recordatorios:', error);
    }
  };

  const notificacionesFiltradas = filterUnread
    ? notificaciones.filter(n => !n.leida)
    : notificaciones;

  const cantidadNoLeidas = notificaciones.filter(n => !n.leida).length;

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'NUEVA_CITA':
        return 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700';
      case 'CITA_CONFIRMADA':
        return 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700';
      case 'CITA_CANCELADA':
        return 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700';
      case 'CITA_REPROGRAMADA':
        return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700';
      case 'RECORDATORIO':
        return 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'NUEVA_CITA':
        return '📅';
      case 'CITA_CONFIRMADA':
        return '✅';
      case 'CITA_CANCELADA':
        return '❌';
      case 'CITA_REPROGRAMADA':
        return '🔄';
      case 'RECORDATORIO':
        return '🔔';
      default:
        return '📬';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">
              Notificaciones
            </h1>
            {cantidadNoLeidas > 0 && (
              <span className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                {cantidadNoLeidas}
              </span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {cantidadNoLeidas > 0 && (
              <button
                onClick={handleMarcarTodasComoLeidas}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                ✓ Marcar todas
              </button>
            )}
            <button
              onClick={handleGenerarRecordatorios}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition text-sm font-semibold"
            >
              🔔 Generar recordatorios
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex gap-3 flex-wrap">
          <button
            onClick={() => setFilterUnread(false)}
            className={`px-4 py-2 rounded-lg transition text-sm ${
              !filterUnread
                ? 'bg-primary text-white'
                : 'bg-border-light dark:bg-border-dark text-text-light dark:text-text-dark'
            }`}
          >
            Todas ({notificaciones.length})
          </button>
          <button
            onClick={() => setFilterUnread(true)}
            className={`px-4 py-2 rounded-lg transition text-sm ${
              filterUnread
                ? 'bg-primary text-white'
                : 'bg-border-light dark:bg-border-dark text-text-light dark:text-text-dark'
            }`}
          >
            No leídas ({cantidadNoLeidas})
          </button>
        </div>

        {/* Notificaciones */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : notificacionesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-light dark:text-text-dark">
              {filterUnread ? 'No hay notificaciones no leídas' : 'No hay notificaciones'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notificacionesFiltradas.map((notificacion) => (
              <div
                key={notificacion.id}
                className={`border-l-4 rounded-lg p-4 transition ${getTipoColor(
                  notificacion.tipo
                )} ${
                  notificacion.leida
                    ? 'opacity-70'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getTipoIcon(notificacion.tipo)}</span>
                      <div>
                        <h3 className="font-semibold text-text-light dark:text-text-dark">
                          {notificacion.tipo_display}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(notificacion.creada_en)}
                        </p>
                      </div>
                    </div>
                    <p className="text-text-light dark:text-text-dark mb-3">
                      {notificacion.mensaje}
                    </p>

                    {/* Detalles de la cita */}
                    {notificacion.cita_info && (
                      <div className="bg-white dark:bg-card-dark rounded p-3 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="font-semibold text-text-light dark:text-text-dark">
                              Mascota:
                            </span>
                            <p className="text-gray-600 dark:text-gray-400">
                              {notificacion.cita_info.mascota_nombre}
                            </p>
                          </div>
                          <div>
                            <span className="font-semibold text-text-light dark:text-text-dark">
                              Fecha:
                            </span>
                            <p className="text-gray-600 dark:text-gray-400">
                              {notificacion.cita_info.fecha}
                            </p>
                          </div>
                          <div>
                            <span className="font-semibold text-text-light dark:text-text-dark">
                              Hora:
                            </span>
                            <p className="text-gray-600 dark:text-gray-400">
                              {notificacion.cita_info.hora}
                            </p>
                          </div>
                          <div>
                            <span className="font-semibold text-text-light dark:text-text-dark">
                              Estado:
                            </span>
                            <p className="text-gray-600 dark:text-gray-400">
                              {notificacion.cita_info.estado}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  {!notificacion.leida && (
                    <button
                      onClick={() => handleMarcarComoLeida(notificacion.id)}
                      className="flex-shrink-0 p-2 hover:bg-white dark:hover:bg-card-dark rounded transition text-gray-600 dark:text-gray-400 hover:text-text-light dark:hover:text-text-dark"
                      title="Marcar como leída"
                    >
                      ✓
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

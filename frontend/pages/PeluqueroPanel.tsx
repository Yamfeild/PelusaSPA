import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { citasService, Cita } from '../services/citasService';
import { notificacionService } from '../services/notificacionService';
import { authService } from '../services';
import { useAuth } from '../context/AuthContext';

const PeluqueroPanel: React.FC = () => {
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'TODAS' | 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'NO_ASISTIO'>('PENDIENTE');
  const [filtroFecha, setFiltroFecha] = useState<'HOY' | 'PROXIMOS' | 'TODAS'>('PROXIMOS');
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notificacionesCount, setNotificacionesCount] = useState(0);
  const [editForm, setEditForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: ''
  });

  useEffect(() => {
    cargarCitas();
  }, []);

  useEffect(() => {
    // Cargar cantidad de notificaciones no leídas
    loadNotificacionesCount();
    // Auto-refresh cada 30 segundos
    const interval = setInterval(loadNotificacionesCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadForm = async () => {
      if (!showEditModal) return;

      if (user?.persona) {
        setEditForm({
          nombre: user.persona.nombre || '',
          apellido: user.persona.apellido || (user.persona as any).apellidos || '',
          telefono: user.persona.telefono || user.persona.celular || '',
          direccion: user.persona.direccion || ''
        });
        return;
      }

      const profile = await refreshProfile();
      if (profile?.persona) {
        setEditForm({
          nombre: profile.persona.nombre || '',
          apellido: profile.persona.apellido || (profile.persona as any).apellidos || '',
          telefono: profile.persona.telefono || (profile.persona as any).celular || '',
          direccion: (profile.persona as any).direccion || ''
        });
      }
    };

    loadForm();
  }, [showEditModal, user, refreshProfile]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('edit') === '1') {
      setShowEditModal(true);
    }
  }, [location.search]);

  useEffect(() => {
    const openModal = () => setShowEditModal(true);
    window.addEventListener('openPeluqueroProfileEdit', openModal);
    return () => window.removeEventListener('openPeluqueroProfileEdit', openModal);
  }, []);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await citasService.getCitas();
      setCitas(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar las citas');
      console.error('Error al cargar citas:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificacionesCount = async () => {
    try {
      const count = await notificacionService.obtenerCantidadNoLeidas();
      setNotificacionesCount(count);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updateProfile({
        nombre: editForm.nombre,
        apellido: editForm.apellido,
        telefono: editForm.telefono || undefined,
        direccion: editForm.direccion || undefined
      });

      const profile = await refreshProfile();
      if (profile?.persona) {
        setEditForm({
          nombre: profile.persona.nombre || '',
          apellido: profile.persona.apellido || (profile.persona as any).apellidos || '',
          telefono: profile.persona.telefono || (profile.persona as any).celular || '',
          direccion: (profile.persona as any).direccion || ''
        });
      }
      setShowEditModal(false);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmar = async (citaId: number) => {
    if (!confirm('¿Deseas confirmar esta cita?')) return;
    
    try {
      await citasService.confirmarCita(citaId);
      await cargarCitas();
      alert('Cita confirmada exitosamente');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al confirmar la cita');
      console.error('Error al confirmar:', err);
    }
  };

  const handleNoAsistio = async (citaId: number) => {
    if (!confirm('¿El cliente no asistió a esta cita?')) return;
    
    try {
      await citasService.marcarNoAsistio(citaId);
      await cargarCitas();
      alert('Cita marcada como "No Asistió"');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al marcar la cita');
      console.error('Error al marcar no asistió:', err);
    }
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CONFIRMADA':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELADA':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'NO_ASISTIO':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'FINALIZADA':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const obtenerTextoEstado = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'CONFIRMADA':
        return 'Confirmada';
      case 'CANCELADA':
        return 'Cancelada';
      case 'NO_ASISTIO':
        return 'No Asistió';
      case 'FINALIZADA':
        return 'Finalizada';
      default:
        return estado;
    }
  };

  const filtrarCitas = (citas: Cita[]) => {
    let citasFiltradas = [...citas];

    // Filtro por estado
    if (filtroEstado !== 'TODAS') {
      citasFiltradas = citasFiltradas.filter(c => c.estado === filtroEstado);
    }

    // Filtro por fecha
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (filtroFecha === 'HOY') {
      const hoyStr = hoy.toISOString().split('T')[0];
      citasFiltradas = citasFiltradas.filter(c => c.fecha === hoyStr);
    } else if (filtroFecha === 'PROXIMOS') {
      citasFiltradas = citasFiltradas.filter(c => {
        const fechaCita = new Date(c.fecha + 'T00:00:00');
        return fechaCita >= hoy;
      });
    }

    return citasFiltradas.sort((a, b) => {
      // Ordenar por fecha y hora
      const fechaA = new Date(a.fecha + 'T' + a.hora_inicio);
      const fechaB = new Date(b.fecha + 'T' + b.hora_inicio);
      return fechaA.getTime() - fechaB.getTime();
    });
  };

  const citasFiltradas = filtrarCitas(citas);
  const fullName = user?.persona
    ? `${user.persona.nombre || ''} ${user.persona.apellido || (user.persona as any).apellidos || ''}`.trim()
    : user?.username || user?.email || 'Peluquero';
  const displayEmail = user?.email || user?.username || '-';
  const displayPhone = user?.persona?.telefono || user?.persona?.celular || '';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-background-dark">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          Panel del Peluquero
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bienvenido/a, {user?.nombre || 'Peluquero'}
        </p>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-3xl">person</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 dark:text-white">{fullName}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{displayEmail}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{displayPhone}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white dark:bg-card-dark rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filtros</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtro por Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado de la Cita
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFiltroEstado('PENDIENTE')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroEstado === 'PENDIENTE'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setFiltroEstado('CONFIRMADA')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroEstado === 'CONFIRMADA'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Confirmadas
              </button>
              <button
                onClick={() => setFiltroEstado('NO_ASISTIO')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroEstado === 'NO_ASISTIO'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Completadas
              </button>
              <button
                onClick={() => setFiltroEstado('CANCELADA')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroEstado === 'CANCELADA'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Canceladas
              </button>
              <button
                onClick={() => setFiltroEstado('TODAS')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroEstado === 'TODAS'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Todas
              </button>
            </div>
          </div>

          {/* Filtro por Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Período
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFiltroFecha('HOY')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroFecha === 'HOY'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => setFiltroFecha('PROXIMOS')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroFecha === 'PROXIMOS'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Próximos
              </button>
              <button
                onClick={() => setFiltroFecha('TODAS')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroFecha === 'TODAS'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Todas
              </button>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowEditModal(false)}>
          <div className="bg-white dark:bg-card-dark rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Editar Perfil</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre *</label>
                <input
                  type="text"
                  required
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 focus:border-purple-600 focus:ring-purple-200 dark:focus:border-purple-500 dark:focus:ring-purple-900/30 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Apellido *</label>
                <input
                  type="text"
                  required
                  value={editForm.apellido}
                  onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 focus:border-purple-600 focus:ring-purple-200 dark:focus:border-purple-500 dark:focus:ring-purple-900/30 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={editForm.telefono}
                  onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 focus:border-purple-600 focus:ring-purple-200 dark:focus:border-purple-500 dark:focus:ring-purple-900/30 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dirección</label>
                <textarea
                  rows={3}
                  value={editForm.direccion}
                  onChange={(e) => setEditForm({ ...editForm, direccion: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 focus:border-purple-600 focus:ring-purple-200 dark:focus:border-purple-500 dark:focus:ring-purple-900/30 outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 h-11 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-11 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Citas */}
      <div className="space-y-4">
        {citasFiltradas.length === 0 ? (
          <div className="bg-white dark:bg-card-dark rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">No hay citas con los filtros seleccionados</p>
          </div>
        ) : (
          citasFiltradas.map((cita) => (
            <div
              key={cita.id}
              className="bg-white dark:bg-card-dark rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Información de la Cita */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${obtenerColorEstado(cita.estado)}`}>
                      {obtenerTextoEstado(cita.estado)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Cita #{cita.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">📅 Fecha y Hora</p>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {cita.hora_inicio} - {cita.hora_fin}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">🐕 Mascota</p>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {cita.mascota_nombre || `Mascota #${cita.mascota}`}
                      </p>
                    </div>

                    {cita.servicio_nombre && (
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">✂️ Servicio</p>
                        <p className="text-gray-900 dark:text-white">{cita.servicio_nombre}</p>
                      </div>
                    )}

                    {cita.notas && (
                      <div className="md:col-span-2">
                        <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">📝 Notas</p>
                        <p className="text-gray-900 dark:text-gray-300 italic">{cita.notas}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de Acción */}
                {(cita.estado === 'PENDIENTE' || cita.estado === 'CONFIRMADA') && (
                  <div className="flex flex-col gap-2 lg:w-48">
                    {cita.estado === 'PENDIENTE' && (
                      <button
                        onClick={() => handleConfirmar(cita.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <span>✓</span>
                        Confirmar
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleNoAsistio(cita.id)}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <span>✗</span>
                      No Asistió
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resumen */}
      <div className="mt-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800/30">
        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-3">Resumen</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
              {citasFiltradas.filter(c => c.estado === 'PENDIENTE').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {citasFiltradas.filter(c => c.estado === 'CONFIRMADA').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Confirmadas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {citasFiltradas.filter(c => c.estado === 'NO_ASISTIO').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">No Asistieron</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {citasFiltradas.filter(c => c.estado === 'FINALIZADA').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Finalizadas</p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default PeluqueroPanel;

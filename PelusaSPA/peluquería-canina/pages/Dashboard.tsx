import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mascotasService, citasService, authService, Mascota, Cita } from '../services';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: ''
  });
  const [saving, setSaving] = useState(false);
  
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Cargar datos del usuario en el formulario cuando se abre el modal
    if (showEditModal && user?.persona) {
      setEditForm({
        nombre: user.persona.nombre || '',
        apellido: user.persona.apellidos || '',
        telefono: user.persona.telefono || '',
        direccion: user.persona.direccion || ''
      });
    }
  }, [showEditModal, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mascotasData, citasData] = await Promise.all([
        mascotasService.getMascotas(),
        citasService.getCitas()
      ]);
      setMascotas(mascotasData);
      setCitas(citasData);
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar la información');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCancelarCita = async (citaId: number) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta cita?')) return;
    
    try {
      await citasService.cancelarCita(citaId);
      await loadData(); // Recargar datos
    } catch (err: any) {
      alert('Error al cancelar la cita');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Actualizar el perfil en el backend
      await authService.updateProfile({
        nombre: editForm.nombre,
        apellido: editForm.apellido,
        telefono: editForm.telefono || undefined,
        direccion: editForm.direccion || undefined
      });
      
      // Refrescar el perfil del usuario
      await refreshProfile();
      
      setShowEditModal(false);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const citasPendientes = citas.filter(c => c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA');
  const citasHistorial = citas.filter(c => c.estado === 'FINALIZADA' || c.estado === 'CANCELADA');

  const formatearFecha = (fecha: string, horaInicio: string) => {
    const date = new Date(fecha + 'T' + horaInicio);
    const opciones: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', opciones);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'CONFIRMADA': return 'text-green-600 dark:text-green-400';
      case 'PENDIENTE': return 'text-yellow-600 dark:text-yellow-400';
      case 'FINALIZADA': return 'text-blue-600 dark:text-blue-400';
      case 'CANCELADA': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-8 flex justify-center items-center min-h-[400px]">
        <div className="text-text-light dark:text-text-dark text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-10 lg:px-20 xl:px-40 py-8 max-w-[1400px] mx-auto">
      {/* Profile Header */}
      <div className="flex p-6 @container bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm mb-8">
        <div className="flex w-full flex-col gap-6 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex gap-4 items-center">
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 border-2 border-primary/20 flex items-center justify-center bg-primary/10">
                  <span className="material-symbols-outlined text-5xl text-primary">person</span>
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-text-light dark:text-text-dark text-xl sm:text-2xl font-bold">
                      {user?.persona?.nombre} {user?.persona?.apellido}
                    </p>
                    <p className="text-subtext-light dark:text-subtext-dark text-sm sm:text-base">{user?.email}</p>
                    {user?.persona?.telefono && (
                      <p className="text-subtext-light dark:text-subtext-dark text-sm sm:text-base">{user.persona.telefono}</p>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
                <button 
                    onClick={() => setShowEditModal(true)}
                    className="flex h-10 px-4 items-center justify-center rounded-lg bg-primary/20 text-text-light dark:text-text-dark dark:bg-primary/30 font-bold hover:bg-primary/30 transition-colors"
                >
                    Editar Perfil
                </button>
                <button onClick={handleLogout} className="flex h-10 px-4 items-center justify-center gap-2 rounded-lg bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400 font-bold hover:bg-red-500/20 transition-colors">
                    <span className="material-symbols-outlined">logout</span>
                    Cerrar Sesión
                </button>
            </div>
        </div>
      </div>

      {/* Modal de Editar Perfil */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowEditModal(false)}>
          <div className="bg-white dark:bg-card-dark rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-light dark:text-text-dark">Editar Perfil</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-subtext-light dark:text-subtext-dark hover:text-text-light"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-3 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.apellido}
                  onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                  className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-3 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={editForm.telefono}
                  onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                  className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-3 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                  Dirección
                </label>
                <textarea
                  value={editForm.direccion}
                  onChange={(e) => setEditForm({ ...editForm, direccion: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-3 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 h-12 rounded-lg border border-border-light dark:border-border-dark text-text-light dark:text-text-dark font-bold hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-12 rounded-lg bg-primary text-text-light font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Appointments Section */}
        <div className="w-full lg:w-2/3 flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-text-light dark:text-text-dark">Mis Citas</h2>
            <div className="flex border-b border-border-light dark:border-border-dark gap-8 mb-6">
                <button 
                    onClick={() => setActiveTab('upcoming')}
                    className={`pb-3 pt-2 text-sm font-bold border-b-[3px] transition-colors ${activeTab === 'upcoming' ? 'border-primary text-text-light dark:text-text-dark' : 'border-transparent text-subtext-light dark:text-subtext-dark hover:text-text-light'}`}
                >
                    Próximas Citas ({citasPendientes.length})
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`pb-3 pt-2 text-sm font-bold border-b-[3px] transition-colors ${activeTab === 'history' ? 'border-primary text-text-light dark:text-text-dark' : 'border-transparent text-subtext-light dark:text-subtext-dark hover:text-text-light'}`}
                >
                    Historial de Citas ({citasHistorial.length})
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {activeTab === 'upcoming' ? (
                  citasPendientes.length > 0 ? citasPendientes.map(cita => (
                    <div key={cita.id} className="p-4 bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                        <div className="flex flex-col sm:flex-row items-stretch justify-between gap-4">
                            <div className="flex flex-col gap-4 flex-grow">
                                <div className="flex flex-col gap-1">
                                    <p className={`text-sm font-medium ${getEstadoColor(cita.estado)}`}>{cita.estado}</p>
                                    <p className="text-text-light dark:text-text-dark text-lg font-bold">
                                      {cita.notas ? cita.notas.replace('Servicio: ', '') : 'Cita'} para {cita.mascota_nombre || `Mascota #${cita.mascota}`}
                                    </p>
                                    <p className="text-subtext-light dark:text-subtext-dark text-sm">
                                      {formatearFecha(cita.fecha, cita.hora_inicio)}
                                    </p>
                                    {cita.observaciones && (
                                      <p className="text-subtext-light dark:text-subtext-dark text-sm mt-1">
                                        Nota: {cita.observaciones}
                                      </p>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                      onClick={() => handleCancelarCita(cita.id)}
                                      className="h-8 px-4 rounded-lg bg-red-500/10 text-red-500 text-sm font-medium hover:bg-red-500/20"
                                    >
                                        Cancelar
                                    </button>
                                    <Link 
                                      to={`/reschedule/${cita.id}`}
                                      className="flex items-center justify-center h-8 px-4 rounded-lg border border-border-light dark:border-border-dark text-text-light dark:text-text-dark text-sm font-medium hover:bg-background-light dark:hover:bg-white/5"
                                    >
                                        Reprogramar
                                    </Link>
                                </div>
                            </div>
                            <div className="w-full sm:w-32 h-32 bg-primary/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                              <span className="material-symbols-outlined text-6xl text-primary">pets</span>
                            </div>
                        </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-subtext-light dark:text-subtext-dark border border-dashed border-border-light dark:border-border-dark rounded-xl">
                      <p className="mb-4">No tienes citas próximas</p>
                      <Link 
                        to="/book" 
                        className="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-primary text-text-light font-bold hover:bg-opacity-90"
                      >
                        <span className="material-symbols-outlined">add</span>
                        Agendar cita
                      </Link>
                    </div>
                  )
                ) : (
                  citasHistorial.length > 0 ? citasHistorial.map(cita => (
                    <div key={cita.id} className="p-4 bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm opacity-75">
                        <div className="flex flex-col gap-2">
                            <p className={`text-sm font-medium ${getEstadoColor(cita.estado)}`}>{cita.estado}</p>
                            <p className="text-text-light dark:text-text-dark text-lg font-bold">
                              {cita.notas ? cita.notas.replace('Servicio: ', '') : 'Cita'} para {cita.mascota_nombre || `Mascota #${cita.mascota}`}
                            </p>
                            <p className="text-subtext-light dark:text-subtext-dark text-sm">
                              {formatearFecha(cita.fecha, cita.hora_inicio)}
                            </p>
                        </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-subtext-light dark:text-subtext-dark border border-dashed border-border-light dark:border-border-dark rounded-xl">
                        No hay historial de citas.
                    </div>
                  )
                )}
            </div>
        </div>

        {/* Pets Section */}
        <div className="w-full lg:w-1/3 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">Mis Mascotas</h2>
                <Link to="/register-pet" className="flex items-center gap-1 h-9 px-3 rounded-lg bg-primary text-text-light text-sm font-bold hover:bg-opacity-90 transition-colors">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Añadir
                </Link>
            </div>
            <div className="flex flex-col gap-4">
                {mascotas.length > 0 ? mascotas.map(mascota => (
                    <div key={mascota.id} className="flex flex-col p-4 bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                        <div className="w-full bg-primary/10 aspect-video rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-8xl text-primary">pets</span>
                        </div>
                        <div className="flex justify-between items-start gap-4 mt-4">
                            <div className="flex flex-col">
                                <p className="text-text-light dark:text-text-dark text-base font-bold">{mascota.nombre}</p>
                                <p className="text-subtext-light dark:text-subtext-dark text-sm">
                                  {mascota.especie} {mascota.raza && `- ${mascota.raza}`}
                                </p>
                                {mascota.edad && (
                                  <p className="text-subtext-light dark:text-subtext-dark text-sm">{mascota.edad} años</p>
                                )}
                            </div>
                            <Link to={`/edit-pet/${mascota.id}`} className="p-2 rounded-md hover:bg-background-light dark:hover:bg-white/5 text-subtext-light dark:text-subtext-dark transition-colors">
                                <span className="material-symbols-outlined text-lg">edit</span>
                            </Link>
                        </div>
                    </div>
                )) : (
                  <div className="p-8 text-center text-subtext-light dark:text-subtext-dark border border-dashed border-border-light dark:border-border-dark rounded-xl">
                    <p className="mb-4">No tienes mascotas registradas</p>
                    <Link 
                      to="/register-pet" 
                      className="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-primary text-text-light font-bold hover:bg-opacity-90"
                    >
                      <span className="material-symbols-outlined">add</span>
                      Registrar mascota
                    </Link>
                  </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { adminService, Peluquero } from '../../services/adminService';

interface Props {
  setError: (msg: string) => void;
  setSuccess: (msg: string) => void;
}

export const PeluquerosTab: React.FC<Props> = ({ setError, setSuccess }) => {
  const [peluqueros, setPeluqueros] = useState<Peluquero[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    clave: '',
    nombre: '',
    apellido: '',
    telefono: '',
    especialidad: '',
    experiencia: ''
  });

  useEffect(() => {
    loadPeluqueros();
  }, []);

  const loadPeluqueros = async () => {
    try {
      const data = await adminService.getPeluqueros();
      setPeluqueros(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Error al cargar peluqueros');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        // Editar peluquero existente
        await adminService.updatePeluquero(editingId, {
          email: formData.email,
          persona: {
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono || undefined
          },
          perfil: {
            especialidad: formData.especialidad || undefined,
            experiencia: formData.experiencia ? parseInt(formData.experiencia) : undefined
          }
        });
        setSuccess('¡Peluquero actualizado correctamente!');
      } else {
        // Crear nuevo peluquero
        console.log('Registrando peluquero con datos:', {
          username: formData.username,
          email: formData.email,
          nombre: formData.nombre,
          apellido: formData.apellido
        });
        
        await adminService.registrarPeluquero({
          username: formData.username,
          email: formData.email,
          clave: formData.clave,
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono || undefined,
          especialidad: formData.especialidad || undefined,
          experiencia: formData.experiencia ? parseInt(formData.experiencia) : undefined
        });
        setSuccess('¡Peluquero registrado correctamente!');
      }

      resetForm();
      await loadPeluqueros();
    } catch (err: any) {
      console.error('Error completo:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
      
      // Mostrar el error más específico posible
      let errorMessage = 'Error al guardar peluquero';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else {
          // Mostrar todos los errores de validación
          const errors = Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          if (errors) errorMessage = errors;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (peluquero: Peluquero) => {
    setEditingId(peluquero.id);
    setFormData({
      username: peluquero.username,
      email: peluquero.email,
      clave: '',
      nombre: peluquero.persona.nombre,
      apellido: peluquero.persona.apellido,
      telefono: peluquero.persona.telefono || '',
      especialidad: peluquero.perfil?.especialidad || '',
      experiencia: peluquero.perfil?.experiencia?.toString() || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number, isActive: boolean) => {
    const action = isActive ? 'desactivar' : 'reactivar';
    const confirmMsg = `¿Estás seguro de ${action} este peluquero?`;
    
    if (!confirm(confirmMsg)) return;

    setTogglingId(id);
    try {
      await adminService.deletePeluquero(id);
      setSuccess(`Peluquero ${action}do correctamente ✓`);
      await loadPeluqueros();
    } catch (err: any) {
      setError(err.message || `Error al ${action} peluquero`);
    } finally {
      setTogglingId(null);
    }
  };

  const handlePermanentDelete = async (id: number, nombre: string) => {
    const confirmMsg = `⚠️ ¿ELIMINAR PERMANENTEMENTE a ${nombre}? Esta acción no se puede deshacer.`;
    
    if (!confirm(confirmMsg)) return;

    setTogglingId(id);
    try {
      await adminService.deletePeluquero(id, true);
      setSuccess(`Peluquero ${nombre} eliminado permanentemente ✓`);
      await loadPeluqueros();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar peluquero');
    } finally {
      setTogglingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      clave: '',
      nombre: '',
      apellido: '',
      telefono: '',
      especialidad: '',
      experiencia: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-primary text-text-light font-bold rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          {showForm ? 'Cancelar' : 'Registrar Nuevo Peluquero'}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6 max-w-2xl">
          <h2 className="text-2xl font-bold mb-6 text-text-light dark:text-text-dark">
            {editingId ? 'Editar Peluquero' : 'Registrar Peluquero'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!editingId && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col">
                    <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">Usuario *</span>
                    <input
                      required
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Ej: peluquero_juan"
                      className="h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50"
                    />
                  </label>

                  <label className="flex flex-col">
                    <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">Email *</span>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Ej: juan@peluqueria.com"
                      className="h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50"
                    />
                  </label>
                </div>

                <label className="flex flex-col">
                  <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">Contraseña *</span>
                  <input
                    required
                    type="password"
                    name="clave"
                    value={formData.clave}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50"
                  />
                </label>
              </>
            )}

            {editingId && (
              <label className="flex flex-col">
                <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">Email *</span>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50"
                />
              </label>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex flex-col">
                <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">Nombre *</span>
                <input
                  required
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Juan"
                  className="h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">Apellido *</span>
                <input
                  required
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  placeholder="Ej: García"
                  className="h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50"
                />
              </label>
            </div>

            <label className="flex flex-col">
              <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">Teléfono</span>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej: +34 123 456 789"
                className="h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50"
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex flex-col">
                <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">Especialidad</span>
                <select
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleChange}
                  className="h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50"
                >
                  <option value="">Selecciona una especialidad</option>
                  <option value="Baño y Secado">Baño y Secado</option>
                  <option value="Corte de Pelo">Corte de Pelo</option>
                  <option value="Combo Completo">Combo Completo</option>
                  <option value="Deslanado">Deslanado</option>
                  <option value="Limpieza de Oídos">Limpieza de Oídos</option>
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">Años de Experiencia</span>
                <input
                  type="number"
                  name="experiencia"
                  value={formData.experiencia}
                  onChange={handleChange}
                  placeholder="Ej: 5"
                  min="0"
                  max="50"
                  className="h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50"
                />
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 h-12 px-6 rounded-lg bg-primary text-text-light font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Registrar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="flex-1 h-12 px-6 rounded-lg bg-primary/20 text-text-light dark:text-text-dark font-medium hover:bg-primary/30 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-6 text-text-light dark:text-text-dark">Peluqueros Registrados</h2>
        
        <div className="mb-4">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 ${
              showInactive 
                ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/50' 
                : 'bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark'
            }`}
          >
            <span className="material-symbols-outlined">visibility</span>
            {showInactive ? 'Mostrar Activos' : 'Ver Desactivados'}
          </button>
        </div>
        
        {loading ? (
          <div className="text-text-light dark:text-text-dark">Cargando peluqueros...</div>
        ) : (() => {
          const filtrados = showInactive 
            ? peluqueros.filter(p => !p.is_active)
            : peluqueros.filter(p => p.is_active);
          
          return filtrados.length === 0 ? (
            <div className="text-center p-8 bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark">
              <span className="material-symbols-outlined text-5xl text-subtext-light dark:text-subtext-dark mb-4 block">people_outline</span>
              <p className="text-text-light dark:text-text-dark">
                {showInactive ? 'No hay peluqueros desactivados' : 'No hay peluqueros registrados aún'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtrados.map(peluquero => (
                <div key={peluquero.id} className="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-primary">person</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-text-light dark:text-text-dark">
                        {peluquero.persona.nombre} {peluquero.persona.apellido}
                      </h3>
                      <p className="text-sm text-subtext-light dark:text-subtext-dark">@{peluquero.username}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">email</span>
                      <p className="text-text-light dark:text-text-dark truncate">{peluquero.email}</p>
                    </div>
                    
                    {peluquero.persona.telefono && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">phone</span>
                        <p className="text-text-light dark:text-text-dark">{peluquero.persona.telefono}</p>
                      </div>
                    )}
                    
                    {peluquero.perfil?.especialidad && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">work</span>
                        <p className="text-text-light dark:text-text-dark">{peluquero.perfil.especialidad}</p>
                      </div>
                    )}
                    
                    {peluquero.perfil?.experiencia && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">calendar_today</span>
                        <p className="text-text-light dark:text-text-dark">{peluquero.perfil.experiencia} años exp.</p>
                      </div>
                    )}

                    {!peluquero.is_active && (
                      <div className="mt-2 px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded">
                        Desactivado
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleEdit(peluquero)}
                      disabled={togglingId !== null}
                      className="flex-1 min-w-[100px] px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(peluquero.id, peluquero.is_active)}
                      disabled={togglingId === peluquero.id}
                      className={`flex-1 min-w-[100px] px-4 py-2 rounded-lg transition-colors text-sm font-medium text-white ${
                        togglingId === peluquero.id
                          ? 'opacity-50 cursor-not-allowed'
                          : peluquero.is_active 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {togglingId === peluquero.id ? 'Procesando...' : (peluquero.is_active ? 'Desactivar' : 'Reactivar')}
                    </button>
                    
                    {!peluquero.is_active && (
                      <button
                        onClick={() => handlePermanentDelete(
                          peluquero.id, 
                          `${peluquero.persona.nombre} ${peluquero.persona.apellido}`
                        )}
                        disabled={togglingId === peluquero.id}
                        className="flex-1 min-w-[100px] px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

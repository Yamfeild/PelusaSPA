import React, { useState, useEffect } from 'react';
import { adminService, Horario, Peluquero } from '../../services/adminService';

interface Props {
  setError: (msg: string) => void;
  setSuccess: (msg: string) => void;
}

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const HorariosTab: React.FC<Props> = ({ setError, setSuccess }) => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [peluqueros, setPeluqueros] = useState<Peluquero[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPeluqueroFilter, setSelectedPeluqueroFilter] = useState<string>('');
  
  const [formData, setFormData] = useState({
    peluquero_id: '',
    dias_semana: [] as number[], // Ahora es un array
    hora_inicio: '',
    hora_fin: '',
    activo: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Cargando horarios y peluqueros...');
      const [horariosData, peluquerosData] = await Promise.all([
        adminService.getHorarios(),
        adminService.getPeluqueros()
      ]);
      console.log('Horarios cargados:', horariosData);
      console.log('Peluqueros cargados:', peluquerosData);
      
      setHorarios(horariosData);
      // Incluir todos los peluqueros, no solo los activos
      setPeluqueros(peluquerosData);
      setLoading(false);
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Error al cargar datos';
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      const dia = parseInt(name);
      
      setFormData(prev => {
        const dias = checked 
          ? [...prev.dias_semana, dia]
          : prev.dias_semana.filter(d => d !== dia);
        
        return { ...prev, dias_semana: dias.sort() };
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validar que se hayan seleccionado días
      if (formData.dias_semana.length === 0) {
        setError('Por favor selecciona al menos un día de la semana');
        setSubmitting(false);
        return;
      }

      // Crear un horario para cada día seleccionado
      const baseDays = formData.dias_semana.length;
      
      for (const dia of formData.dias_semana) {
        const data = {
          peluquero_id: parseInt(formData.peluquero_id),
          dia_semana: dia,
          hora_inicio: formData.hora_inicio,
          hora_fin: formData.hora_fin,
          activo: formData.activo
        };

        if (editingId && dia === formData.dias_semana[0]) {
          // Solo editar el primero si es edición
          await adminService.updateHorario(editingId, data);
        } else if (!editingId) {
          // Crear nuevos para cada día
          await adminService.createHorario(data);
        }
      }

      const accion = editingId ? 'actualizado' : 'creado';
      const dias = formData.dias_semana.length === 1 ? 'día' : 'días';
      setSuccess(`¡Horario ${accion} para ${formData.dias_semana.length} ${dias} correctamente!`);

      resetForm();
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al guardar horario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (horario: Horario) => {
    setEditingId(horario.id);
    setFormData({
      peluquero_id: horario.peluquero_id.toString(),
      dias_semana: [horario.dia_semana], // Convertir a array
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      activo: horario.activo
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este horario?')) return;

    try {
      await adminService.deleteHorario(id);
      setSuccess('Horario eliminado correctamente');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar horario');
    }
  };

  const resetForm = () => {
    setFormData({
      peluquero_id: '',
      dias_semana: [],
      hora_inicio: '',
      hora_fin: '',
      activo: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getPeluqueroNombre = (peluqueroId: number) => {
    const peluquero = peluqueros.find(p => p.id === peluqueroId);
    return peluquero ? `${peluquero.persona.nombre} ${peluquero.persona.apellido}` : 'Desconocido';
  };

  const filteredHorarios = selectedPeluqueroFilter 
    ? horarios.filter(h => h.peluquero_id === parseInt(selectedPeluqueroFilter))
    : horarios;

  const horariosGrouped = filteredHorarios.reduce((acc, horario) => {
    const key = horario.peluquero_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(horario);
    return acc;
  }, {} as Record<number, Horario[]>);

  return (
    <div>
      <div className="mb-8 flex gap-4 items-center">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-primary text-text-light font-bold rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          {showForm ? 'Cancelar' : 'Crear Nuevo Horario'}
        </button>

        <select
          value={selectedPeluqueroFilter}
          onChange={(e) => setSelectedPeluqueroFilter(e.target.value)}
          className="h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50"
        >
          <option value="">Todos los peluqueros</option>
          {peluqueros.map(p => (
            <option key={p.id} value={p.id}>
              {p.persona.nombre} {p.persona.apellido}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="mb-8 bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6 max-w-2xl">
          <h2 className="text-2xl font-bold mb-6 text-text-light dark:text-text-dark">
            {editingId ? 'Editar Horario' : 'Crear Horario'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <label className="flex flex-col">
              <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">Peluquero *</span>
              <select
                required
                name="peluquero_id"
                value={formData.peluquero_id}
                onChange={handleChange}
                className="h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50"
              >
                <option value="">Selecciona un peluquero</option>
                {peluqueros.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.persona.nombre} {p.persona.apellido}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-col">
              <span className="text-sm font-medium pb-3 text-text-light dark:text-text-dark">Días de la semana * (selecciona múltiples)</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {DIAS_SEMANA.map((dia, index) => (
                  <label key={index} className="flex items-center gap-2 p-3 rounded-lg border border-border-light dark:border-border-dark cursor-pointer hover:bg-primary/5 transition-colors">
                    <input
                      type="checkbox"
                      name={index.toString()}
                      checked={formData.dias_semana.includes(index)}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-text-light dark:text-text-dark">{dia}</span>
                  </label>
                ))}
              </div>
              {formData.dias_semana.length === 0 && (
                <p className="text-xs text-red-500 mt-2">Debes seleccionar al menos un día</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex flex-col">
                <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">Hora inicio *</span>
                <input
                  required
                  type="time"
                  name="hora_inicio"
                  value={formData.hora_inicio}
                  onChange={handleChange}
                  className="h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">Hora fin *</span>
                <input
                  required
                  type="time"
                  name="hora_fin"
                  value={formData.hora_fin}
                  onChange={handleChange}
                  className="h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50"
                />
              </label>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                className="w-5 h-5 text-primary bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark rounded focus:ring-primary"
              />
              <span className="text-sm font-medium text-text-light dark:text-text-dark">Horario activo</span>
            </label>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 h-12 px-6 rounded-lg bg-primary text-text-light font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
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
        <h2 className="text-2xl font-bold mb-6 text-text-light dark:text-text-dark">Horarios Configurados</h2>
        
        {loading ? (
          <div className="text-text-light dark:text-text-dark">Cargando horarios...</div>
        ) : Object.keys(horariosGrouped).length === 0 ? (
          <div className="text-center p-8 bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark">
            <span className="material-symbols-outlined text-5xl text-subtext-light dark:text-subtext-dark mb-4 block">schedule</span>
            <p className="text-text-light dark:text-text-dark">No hay horarios configurados aún</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(horariosGrouped).map(([peluqueroId, horariosList]) => {
              // Type-safe sorting
              const sortedHorarios = (horariosList as Horario[]).sort((a, b) => a.dia_semana - b.dia_semana);
              
              return (
                <div key={peluqueroId} className="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                  <h3 className="text-xl font-bold mb-4 text-text-light dark:text-text-dark flex items-center gap-2">
                    <span className="material-symbols-outlined">person</span>
                    {getPeluqueroNombre(parseInt(peluqueroId))}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedHorarios.map(horario => (
                      <div key={horario.id} className="bg-background-light dark:bg-background-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">event</span>
                            <span className="font-bold text-text-light dark:text-text-dark">
                              {DIAS_SEMANA[horario.dia_semana]}
                            </span>
                          </div>
                          {!horario.activo && (
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded">
                              Inactivo
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-subtext-light dark:text-subtext-dark mb-4">
                          <span className="material-symbols-outlined text-base">schedule</span>
                          <span>{horario.hora_inicio} - {horario.hora_fin}</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(horario)}
                            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(horario.id)}
                            className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

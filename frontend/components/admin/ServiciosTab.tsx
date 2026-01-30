import React, { useState, useEffect } from 'react';
import { adminService, Servicio } from '../../services/adminService';
import { imageUploadService } from '../../services/imageUploadService';

interface Props {
  setError: (msg: string) => void;
  setSuccess: (msg: string) => void;
}

export const ServiciosTab: React.FC<Props> = ({ setError, setSuccess }) => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracion_minutos: '',
    precio: '',
    imagen_url: '',
    activo: true
  });

  useEffect(() => {
    loadServicios();
  }, []);

  const loadServicios = async () => {
    try {
      console.log('Cargando servicios...');
      const data = await adminService.getServicios();
      console.log('Servicios cargados:', data);
      setServicios(data || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Error al cargar servicios:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      // Intentar extraer el mejor mensaje de error
      let errorMsg = 'Error al cargar servicios';
      if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      console.log('Error final:', errorMsg);
      setError(errorMsg);
      setServicios([]);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
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
      const data = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        duracion_minutos: parseInt(formData.duracion_minutos),
        precio: parseFloat(formData.precio),
        imagen_url: formData.imagen_url || undefined,
        activo: formData.activo
      };

      if (editingId) {
        await adminService.updateServicio(editingId, data);
        setSuccess('¡Servicio actualizado correctamente!');
      } else {
        await adminService.createServicio(data);
        setSuccess('¡Servicio creado correctamente!');
      }

      resetForm();
      await loadServicios();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al guardar servicio');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (servicio: Servicio) => {
    setEditingId(servicio.id);
    setFormData({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || '',
      duracion_minutos: servicio.duracion_minutos.toString(),
      precio: servicio.precio.toString(),
      imagen_url: servicio.imagen_url || '',
      activo: servicio.activo
    });
    setShowForm(true);
  };

  const handleToggleServicio = async (id: number, isActive: boolean) => {
    const action = isActive ? 'desactivar' : 'reactivar';
    const confirmMsg = `¿Estás seguro de ${action} este servicio?`;
    
    if (!confirm(confirmMsg)) return;

    try {
      await adminService.updateServicio(id, { activo: !isActive });
      setSuccess(`Servicio ${action}do correctamente`);
      await loadServicios();
      
      // Si se desactivó un servicio y estamos viendo activos, cambiar a mostrar todos
      if (isActive && showInactive === false) {
        // No cambiar automáticamente, dejar que vea el cambio
      }
    } catch (err: any) {
      setError(err.message || `Error al ${action} servicio`);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      duracion_minutos: '',
      precio: '',
      imagen_url: '',
      activo: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const renderContent = () => {
    if (loading) {
      return <div className="text-text-light dark:text-text-dark p-4">Cargando servicios...</div>;
    }
    
    // Filtrar servicios según estado
    const serviciosFiltrados = showInactive 
      ? servicios.filter(s => !s.activo)
      : servicios.filter(s => s.activo);
    
    if (!serviciosFiltrados || serviciosFiltrados.length === 0) {
      return (
        <div className="text-center p-8 bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark">
          <span className="material-symbols-outlined text-5xl text-subtext-light dark:text-subtext-dark mb-4 block">design_services</span>
          <p className="text-text-light dark:text-text-dark">
            {showInactive ? 'No hay servicios desactivados' : 'No hay servicios registrados aún'}
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviciosFiltrados.map(servicio => (
          <div key={servicio.id} className="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl text-primary">design_services</span>
                </div>
                <h3 className="font-bold text-lg text-text-light dark:text-text-dark">
                  {servicio.nombre}
                </h3>
              </div>
              {!servicio.activo && (
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded">
                  Inactivo
                </span>
              )}
            </div>
            
            {servicio.descripcion && (
              <p className="text-sm text-subtext-light dark:text-subtext-dark mb-4">
                {servicio.descripcion}
              </p>
            )}
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-subtext-light dark:text-subtext-dark">
                  <span className="material-symbols-outlined text-base">schedule</span>
                  <span>Duración</span>
                </div>
                <span className="font-medium text-text-light dark:text-text-dark">
                  {servicio.duracion_minutos} min
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-subtext-light dark:text-subtext-dark">
                  <span className="material-symbols-outlined text-base">attach_money</span>
                  <span>Precio</span>
                </div>
                <span className="text-xl font-bold text-primary">
                  ${parseFloat(servicio.precio.toString()).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(servicio)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Editar
              </button>
              <button
                onClick={() => handleToggleServicio(servicio.id, servicio.activo)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium text-white ${
                  servicio.activo 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {servicio.activo ? 'Desactivar' : 'Reactivar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8 flex gap-3 items-center flex-wrap">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-primary text-text-light font-bold rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          {showForm ? 'Cancelar' : 'Crear Nuevo Servicio'}
        </button>
        
        <button
          onClick={() => setShowInactive(!showInactive)}
          className={`px-6 py-3 font-bold rounded-lg transition-colors flex items-center gap-2 ${
            showInactive 
              ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/50' 
              : 'bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark'
          }`}
        >
          <span className="material-symbols-outlined">visibility</span>
          {showInactive ? 'Mostrar Activos' : 'Ver Desactivados'}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6 max-w-2xl">
          <h2 className="text-2xl font-bold mb-6 text-text-light dark:text-text-dark">
            {editingId ? 'Editar Servicio' : 'Crear Servicio'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <label className="flex flex-col">
              <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">Nombre *</span>
              <input
                required
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Corte de pelo"
                className="h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50"
              />
            </label>

            {/* Descripción */}
            <label className="flex flex-col">
              <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">Descripción</span>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción del servicio..."
                rows={3}
                className="rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 py-3 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50"
              />
            </label>

            {/* Duración y Precio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">Duración (minutos) *</span>
                <input
                  required
                  type="number"
                  name="duracion_minutos"
                  value={formData.duracion_minutos}
                  onChange={handleChange}
                  placeholder="Ej: 30"
                  min="1"
                  max="480"
                  className="h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">Precio ($) *</span>
                <input
                  required
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  placeholder="Ej: 25.00"
                  min="0"
                  step="0.01"
                  className="h-12 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50"
                />
              </label>
            </div>

            {/* Sección de Imagen */}
            <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
              <h3 className="text-sm font-bold text-text-light dark:text-text-dark mb-4">Imagen del Servicio</h3>
              
              {/* Opción 1: Upload a la nube */}
              <div className="mb-4">
                <label className="flex flex-col">
                  <span className="text-xs font-medium pb-2 text-text-light dark:text-text-dark">Opción 1: Subir imagen a la nube (recomendado)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      setSubmitting(true);
                      setError('');
                      
                      try {
                        const imageUrl = await imageUploadService.uploadImageOptimized(file);
                        setFormData(prev => ({ ...prev, imagen_url: imageUrl }));
                        setSuccess('Imagen subida correctamente ✓');
                      } catch (err: any) {
                        setError(err.message || 'Error al subir imagen');
                      } finally {
                        setSubmitting(false);
                        e.target.value = '';
                      }
                    }}
                    disabled={submitting}
                    className="h-10 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 text-text-light dark:text-text-dark text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 disabled:opacity-50"
                  />
                  <p className="text-xs text-subtext-light dark:text-subtext-dark mt-1">Máximo 10MB. Se sube automáticamente a Cloudinary.</p>
                </label>
              </div>

              {/* Opción 2: URL manual */}
              <div>
                <label className="flex flex-col">
                  <span className="text-xs font-medium pb-2 text-text-light dark:text-text-dark">Opción 2: O pega una URL de imagen (Google Drive, Imgur, etc.)</span>
                  <input
                    type="url"
                    name="imagen_url"
                    value={formData.imagen_url}
                    onChange={handleChange}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="h-10 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50 text-sm"
                  />
                </label>
              </div>

              {/* Preview de imagen */}
              {formData.imagen_url && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-text-light dark:text-text-dark mb-2">Vista previa:</p>
                  <div className="rounded-lg overflow-hidden border border-border-light dark:border-border-dark h-32 bg-gray-100 dark:bg-gray-800">
                    <img 
                      src={formData.imagen_url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.alt = '❌ Error al cargar imagen';
                        e.currentTarget.className = 'w-full h-full object-cover opacity-30 flex items-center justify-center';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Checkbox Activo */}
            <label className="flex items-center gap-3 p-3 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                className="w-5 h-5 text-primary bg-white dark:bg-card-dark border-border-light dark:border-border-dark rounded focus:ring-primary"
              />
              <span className="text-sm font-medium text-text-light dark:text-text-dark">Servicio activo</span>
            </label>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
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
                className="flex-1 h-12 px-6 rounded-lg bg-gray-300 dark:bg-gray-700 text-text-light dark:text-text-dark font-medium hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-6 text-text-light dark:text-text-dark">Servicios Disponibles</h2>
        {renderContent()}
      </div>
    </div>
  );
};

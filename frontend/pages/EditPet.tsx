import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mascotasService, Mascota } from '../services/mascotasService';

const EditPet: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [mascota, setMascota] = useState<Mascota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    raza: '',
    edad: 0
  });

  useEffect(() => {
    loadMascota();
  }, [id]);

  const loadMascota = async () => {
    if (!id) {
      setError('ID de mascota no válido');
      setLoading(false);
      return;
    }

    try {
      const mascotaData = await mascotasService.getMascota(parseInt(id));
      setMascota(mascotaData);
      setFormData({
        nombre: mascotaData.nombre,
        raza: mascotaData.raza,
        edad: mascotaData.edad
      });
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la mascota');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mascota) return;
    
    setSubmitting(true);
    setError('');

    try {
      await mascotasService.updateMascota(mascota.id, formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la mascota');
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'edad' ? parseInt(value) || 0 : value
    }));
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-text-light dark:text-text-dark">Cargando...</div>
      </div>
    );
  }

  if (error && !mascota) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!mascota) return null;

  return (
    <div className="flex-grow flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-lg">
        <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Editar Mascota</h1>
                <p className="text-sm text-subtext-light dark:text-subtext-dark">Actualiza la información de tu mascota.</p>
            </div>
            <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-full hover:bg-primary/20 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-text-light dark:text-text-dark">close</span>
            </button>
        </div>
        
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="p-6">
            <form id="edit-pet-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                    <label className="flex flex-col">
                        <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">Nombre de la Mascota</span>
                        <input 
                          className="h-12 w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50" 
                          type="text" 
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          required
                        />
                    </label>
                </div>
                
                <div className="sm:col-span-2">
                    <span className="text-sm font-medium pb-2 block text-text-light dark:text-text-dark">Foto de la Mascota</span>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative h-28 w-28 flex-shrink-0">
                            <div className="h-full w-full rounded-full bg-primary/20 flex items-center justify-center border-2 border-border-light dark:border-border-dark">
                              <span className="material-symbols-outlined text-5xl text-primary">pets</span>
                            </div>
                            <button type="button" className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-text-light shadow-md hover:brightness-110">
                                <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                        </div>
                        <label className="flex-grow w-full h-28 flex flex-col items-center justify-center border-2 border-dashed border-border-light dark:border-border-dark rounded-lg cursor-pointer bg-background-light dark:bg-background-dark hover:bg-primary/5 transition-colors">
                            <span className="material-symbols-outlined text-3xl text-subtext-light dark:text-subtext-dark mb-1">cloud_upload</span>
                            <span className="text-sm font-medium text-text-light dark:text-text-dark">Haz clic para subir nueva foto</span>
                            <span className="text-xs text-subtext-light dark:text-subtext-dark">(Próximamente)</span>
                            <input type="file" className="hidden" disabled />
                        </label>
                    </div>
                </div>

                <label className="flex flex-col">
                    <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">Raza</span>
                    <input 
                      className="h-12 w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50" 
                      type="text" 
                      name="raza"
                      value={formData.raza}
                      onChange={handleChange}
                      required
                    />
                </label>

                <label className="flex flex-col">
                    <span className="text-sm font-medium pb-2 text-text-light dark:text-text-dark">Edad (años)</span>
                    <input 
                      className="h-12 w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary/50" 
                      type="number" 
                      name="edad"
                      value={formData.edad}
                      onChange={handleChange}
                      min="0"
                      max="30"
                      required
                    />
                </label>
            </form>
        </div>

        <div className="flex flex-col sm:flex-row-reverse items-center gap-4 p-6 border-t border-border-light dark:border-border-dark">
            <button 
              form="edit-pet-form" 
              type="submit" 
              disabled={submitting}
              className="w-full sm:w-auto h-12 px-6 rounded-lg bg-primary text-text-light font-bold flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span className="material-symbols-outlined">save</span>
                {submitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button 
              onClick={() => navigate(-1)} 
              disabled={submitting}
              className="w-full sm:w-auto h-12 px-6 rounded-lg bg-transparent text-subtext-light dark:text-subtext-dark font-medium hover:bg-primary/10 hover:text-text-light dark:hover:text-text-dark transition-colors disabled:opacity-50"
            >
                Cancelar
            </button>
        </div>
      </div>
    </div>
  );
};

export default EditPet;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mascotasService } from '../services';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

const RegisterPet: React.FC = () => {
  const navigate = useNavigate();
  const { messages, removeToast, success, error: showError } = useToast();
  const [nombre, setNombre] = useState('');
  const [raza, setRaza] = useState('');
  const [edad, setEdad] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await mascotasService.createMascota({
        nombre,
        raza,
        edad: parseInt(edad) || 0,
      });
      success(`¡${nombre} registrada correctamente!`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err: any) {
      console.error('Error al registrar mascota:', err);
      const errorMsg = err.response?.data?.error || 'Error al registrar la mascota';
      showError(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-2xl">
      <div className="flex flex-col gap-2 mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-text-light dark:text-text-dark">Registro de Mascota</h2>
        <p className="text-subtext-light dark:text-subtext-dark text-lg">Completa los datos de tu compañero para agendar su próxima cita.</p>
      </div>

      <div className="space-y-6 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-card-dark p-6 md:p-8 shadow-sm">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-6 md:gap-8 items-start">
                <label className="flex flex-col flex-grow">
                    <span className="text-base font-medium pb-2 text-text-light dark:text-text-dark">Nombre de la mascota *</span>
                    <input 
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="h-12 w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 focus:border-primary focus:ring-primary/50 text-text-light dark:text-text-dark" 
                      placeholder="Ej: Bobby" 
                    />
                </label>
                <div className="w-full md:w-40">
                    <span className="text-base font-medium pb-2 block text-text-light dark:text-text-dark">Foto</span>
                    <label className="flex flex-col items-center justify-center h-32 w-full rounded-lg border-2 border-dashed border-border-light dark:border-border-dark hover:border-primary cursor-pointer bg-background-light dark:bg-background-dark transition-colors">
                        <span className="material-symbols-outlined text-3xl text-subtext-light dark:text-subtext-dark mb-1">upload_file</span>
                        <span className="text-xs text-subtext-light dark:text-subtext-dark font-medium">Subir foto</span>
                        <input type="file" className="hidden" disabled />
                    </label>
                    <p className="text-xs text-subtext-light dark:text-subtext-dark mt-1">(Próximamente)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col">
                    <span className="text-base font-medium pb-2 text-text-light dark:text-text-dark">Raza *</span>
                    <input 
                      required
                      value={raza}
                      onChange={(e) => setRaza(e.target.value)}
                      className="h-12 w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 focus:border-primary focus:ring-primary/50 text-text-light dark:text-text-dark" 
                      placeholder="Ej: Golden Retriever" 
                    />
                </label>
                <label className="flex flex-col">
                    <span className="text-base font-medium pb-2 text-text-light dark:text-text-dark">Edad (años) *</span>
                    <input 
                      required
                      type="number" 
                      min="0"
                      max="30"
                      step="1"
                      value={edad}
                      onChange={(e) => setEdad(e.target.value)}
                      className="h-12 w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 focus:border-primary focus:ring-primary/50 text-text-light dark:text-text-dark" 
                      placeholder="Ej: 5" 
                    />
                </label>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => navigate(-1)} 
                  disabled={loading}
                  className="w-full sm:w-auto h-12 px-6 rounded-lg bg-primary/20 text-text-light dark:text-text-dark font-bold hover:bg-primary/30 transition-colors disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full sm:flex-1 h-12 px-6 rounded-lg bg-primary text-text-light font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Guardando...' : 'Guardar Mascota'}
                </button>
            </div>
        </form>
      </div>

      {/* Toast Notifications */}
      <Toast messages={messages} onRemove={removeToast} />
    </div>
  );
};

export default RegisterPet;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { citasService, Cita } from '../services/citasService';
import { mascotasService } from '../services/mascotasService';

const Reschedule: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [cita, setCita] = useState<Cita | null>(null);
  const [mascotaNombre, setMascotaNombre] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  useEffect(() => {
    loadCita();
  }, [id]);

  const loadCita = async () => {
    if (!id) {
      setError('ID de cita no válido');
      setLoading(false);
      return;
    }

    try {
      const citaData = await citasService.getCita(parseInt(id));
      setCita(citaData);
      
      // Cargar nombre de la mascota
      try {
        const mascotas = await mascotasService.getMascotas();
        const mascota = mascotas.find(m => m.id === citaData.mascota);
        if (mascota) {
          setMascotaNombre(mascota.nombre);
        }
      } catch (err) {
        console.error('Error cargando mascota:', err);
      }
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la cita');
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !cita) {
      setError('Por favor selecciona una nueva fecha y hora');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Calcular hora_fin (asumiendo 1 hora de duración por defecto)
      const [horas, minutos] = selectedTime.split(':').map(Number);
      const totalMinutos = horas * 60 + minutos + 60; // +60 minutos
      const horaFin = `${Math.floor(totalMinutos / 60).toString().padStart(2, '0')}:${(totalMinutos % 60).toString().padStart(2, '0')}`;

      await citasService.reagendarCita(cita.id, {
        fecha: selectedDate,
        hora_inicio: selectedTime,
        hora_fin: horaFin
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al reagendar la cita');
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${dias[date.getDay()]}, ${date.getDate()} de ${meses[date.getMonth()]}`;
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-text-light dark:text-text-dark">Cargando...</div>
      </div>
    );
  }

  if (error && !cita) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!cita) return null;

  return (
    <div className="px-4 sm:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-8">
      <div className="flex flex-col w-full max-w-[1200px] flex-1">
        <div className="flex flex-col gap-2 mb-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-subtext-light dark:text-subtext-dark hover:text-primary transition-colors w-fit">
                <span className="material-symbols-outlined">arrow_back</span>
                <span>Volver a Mis Citas</span>
            </button>
            <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">Reprogramar Cita</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 mt-4">
            {/* Info Section */}
            <div className="flex-1 lg:max-w-md flex flex-col gap-6">
                <div className="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4 text-text-light dark:text-text-dark">Cita Actual</h2>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-3xl text-primary">pets</span>
                        </div>
                        <div>
                            <p className="font-bold text-text-light dark:text-text-dark">{mascotaNombre || 'Cargando...'}</p>
                            <p className="text-subtext-light dark:text-subtext-dark text-sm">
                              {cita.notas ? cita.notas.replace('Servicio: ', '') : 'Servicio no especificado'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 text-sm">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-subtext-light dark:text-subtext-dark">calendar_today</span>
                            <span className="text-text-light dark:text-text-dark">{formatDate(cita.fecha)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-subtext-light dark:text-subtext-dark">schedule</span>
                            <span className="text-text-light dark:text-text-dark">{cita.hora_inicio}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4 text-text-light dark:text-text-dark">Nueva Cita</h2>
                    {selectedDate && selectedTime ? (
                      <div className="flex flex-col gap-4 text-sm">
                        <div className="flex items-start gap-3">
                             <span className="material-symbols-outlined text-primary">calendar_month</span>
                             <div>
                                <p className="text-subtext-light dark:text-subtext-dark">Fecha</p>
                                <p className="text-text-light dark:text-text-dark font-semibold">{formatDate(selectedDate)}</p>
                             </div>
                        </div>
                        <div className="flex items-start gap-3">
                             <span className="material-symbols-outlined text-primary">schedule</span>
                             <div>
                                <p className="text-subtext-light dark:text-subtext-dark">Hora</p>
                                <p className="text-text-light dark:text-text-dark font-semibold">{selectedTime}</p>
                             </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-subtext-light dark:text-subtext-dark text-sm mb-4">
                        Selecciona una nueva fecha y hora en el calendario
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <button 
                          onClick={handleConfirm}
                          disabled={!selectedDate || !selectedTime || submitting}
                          className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary text-text-light text-sm font-bold flex-1 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Confirmando...' : 'Confirmar'}
                        </button>
                        <button 
                          onClick={() => navigate(-1)}
                          disabled={submitting}
                          className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary/20 text-text-light dark:text-text-dark dark:bg-primary/30 text-sm font-medium flex-1 hover:bg-primary/30 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Section */}
            <div className="flex-[2_2_0px]">
                <div className="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-text-light dark:text-text-dark">
                          {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex gap-2">
                             <button 
                               onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                               className="flex items-center justify-center size-8 rounded-full hover:bg-primary/20"
                             >
                               <span className="material-symbols-outlined text-lg">chevron_left</span>
                             </button>
                             <button 
                               onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                               className="flex items-center justify-center size-8 rounded-full hover:bg-primary/20"
                             >
                               <span className="material-symbols-outlined text-lg">chevron_right</span>
                             </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm mb-6">
                        {['Lu','Ma','Mi','Ju','Vi','Sá','Do'].map(d => (
                          <div key={d} className="text-subtext-light dark:text-subtext-dark font-medium py-2">{d}</div>
                        ))}
                        {Array.from({length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()}, (_, i) => {
                          const day = i + 1;
                          const year = currentMonth.getFullYear();
                          const month = currentMonth.getMonth();
                          const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const currentDate = new Date(year, month, day);
                          const isPast = currentDate < today;
                          
                          return (
                            <div key={day} className="flex items-center justify-center py-1">
                                <button 
                                  onClick={() => setSelectedDate(dateStr)}
                                  disabled={isPast}
                                  className={`size-9 rounded-full flex items-center justify-center text-sm transition-colors
                                    ${isPast ? 'text-subtext-light/30 dark:text-subtext-dark/30 cursor-not-allowed' :
                                      selectedDate === dateStr ? 'bg-primary text-text-light font-bold' :
                                      'text-text-light dark:text-text-dark hover:bg-primary/20'}`}
                                >
                                    {day}
                                </button>
                            </div>
                          );
                        })}
                    </div>

                    {selectedDate && (
                      <>
                        <h3 className="text-lg font-bold mb-4 text-text-light dark:text-text-dark">
                          Horas Disponibles para {formatDate(selectedDate)}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {["09:00", "11:00", "12:00", "16:00", "17:00", "18:00"].map(time => (
                            <button 
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                                selectedTime === time 
                                  ? 'bg-primary text-text-light border-primary font-bold' 
                                  : 'border-primary/20 dark:border-primary/30 text-text-light dark:text-text-dark hover:bg-primary/20'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Reschedule;

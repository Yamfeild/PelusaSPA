import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { citasService, Cita } from '../services/citasService';
import { mascotasService } from '../services/mascotasService';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import type { Horario, Servicio } from '../services/citasService';

const Reschedule: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { messages, removeToast, success, error: showError } = useToast();
  
  const [cita, setCita] = useState<Cita | null>(null);
  const [mascotaNombre, setMascotaNombre] = useState<string>('');
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [availableHorarios, setAvailableHorarios] = useState<{ time: string; occupied: boolean; isCurrent: boolean }[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
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

      // Cargar servicio para obtener duración
      try {
        const servicios = await citasService.getServicios();
        const servicioData = servicios.find(s => s.id === citaData.servicio);
        if (servicioData) {
          setServicio(servicioData);
        }
      } catch (err) {
        console.error('Error cargando servicio:', err);
      }

      // Cargar horarios
      try {
        const horariosData = await citasService.getHorarios();
        setHorarios(horariosData);
      } catch (err) {
        console.error('Error cargando horarios:', err);
      }
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la cita');
      setLoading(false);
    }
  };

  // Función para calcular horarios disponibles y detectar conflictos
  const calculateAvailableHorarios = async () => {
    if (!selectedDate || !cita || !servicio) {
      setAvailableHorarios([]);
      return;
    }

    setLoadingHorarios(true);

    try {
      // Obtener día de la semana
      // Crear fecha en zona horaria local para evitar desfase UTC
      const [year, month, day] = selectedDate.split('-').map(Number);
      const selectedDateObj = new Date(year, month - 1, day);
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);
      const dayOfWeek = selectedDateObj.getDay();
      const dayOfWeekAdjusted = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      console.log(`📅 Fecha seleccionada: ${selectedDate}, JS Day: ${dayOfWeek}, Backend Day: ${dayOfWeekAdjusted}`);
      console.log(`📅 Mapeo: ${['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][dayOfWeek]} (JS: ${dayOfWeek}) → ${['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'][dayOfWeekAdjusted]} (Backend: ${dayOfWeekAdjusted})`);

      // Bloquear días pasados completos
      if (selectedDateObj < todayMidnight) {
        setAvailableHorarios([]);
        return;
      }

      // Buscar horarios del peluquero para ese día
      const peluqueroHorarios = horarios.filter(h => 
        h.peluquero_id === cita.peluquero_id && 
        h.dia_semana === dayOfWeekAdjusted && 
        h.activo
      );
      
      console.log(`🔍 Buscando horarios para peluquero ${cita.peluquero_id} en día ${dayOfWeekAdjusted}`);

      if (peluqueroHorarios.length === 0) {
        console.log(`❌ Sin horarios para peluquero ${cita.peluquero_id} en día ${dayOfWeekAdjusted} (${['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'][dayOfWeekAdjusted]})`);
        console.log(`📋 Horarios disponibles del peluquero ${cita.peluquero_id}:`, horarios.filter(h => h.peluquero_id === cita.peluquero_id && h.activo));
        setAvailableHorarios([]);
        return;
      }
      
      console.log(`✅ Encontrados ${peluqueroHorarios.length} horarios:`, peluqueroHorarios);

      // Obtener citas existentes (excluyendo la actual que estamos reprogramando)
      let citasExistentes = [];
      try {
        const todasLasCitas = await citasService.getCitasPorFecha(
          cita.peluquero_id,
          selectedDate
        );
        // Filtrar la cita actual y mantener solo las que bloquean (pendiente/confirmada)
        citasExistentes = todasLasCitas.filter(c => 
          c.id !== cita.id && (c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA')
        );
        console.log(`📅 Citas existentes en ${selectedDate} (excluyendo actual y canceladas):`, citasExistentes);
      } catch (err) {
        console.error('⚠️ Error al obtener citas:', err);
      }

      // Función para convertir hora string a minutos
      const timeToMinutes = (timeStr: string): number => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
      };

      // Función para verificar si un slot está ocupado
      const isSlotOccupied = (slotTime: string, serviceDuration: number): boolean => {
        const slotMinutes = timeToMinutes(slotTime);
        const slotEndMinutes = slotMinutes + serviceDuration;

        for (const citaExistente of citasExistentes) {
          const citaStartMinutes = timeToMinutes(citaExistente.hora_inicio);
          const citaEndMinutes = timeToMinutes(citaExistente.hora_fin);

          if (slotMinutes < citaEndMinutes && slotEndMinutes > citaStartMinutes) {
            return true;
          }
        }

        return false;
      };

      // Generar slots de hora con información de ocupación
      const slots: { time: string; occupied: boolean; isCurrent: boolean }[] = [];
      const serviceDuration = servicio.duracion_minutos;
      const today = new Date();
      const isToday = selectedDateObj.toDateString() === today.toDateString();
      const currentMinutes = today.getHours() * 60 + today.getMinutes();
      
      // Verificar si la fecha seleccionada es la misma que la fecha actual de la cita
      const isCurrentDate = selectedDate === cita.fecha;
      const currentTimeStr = cita.hora_inicio.substring(0, 5); // Formato HH:MM

      for (const horario of peluqueroHorarios) {
        const [startHour, startMin] = horario.hora_inicio.split(':').map(Number);
        const [endHour, endMin] = horario.hora_fin.split(':').map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        // Generar slots cada 30 minutos
        for (let time = startMinutes; time + serviceDuration <= endMinutes; time += 30) {
          const hours = Math.floor(time / 60);
          const minutes = time % 60;
          const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

          const occupiedByPastTime = isToday && time <= currentMinutes;
          const occupied = occupiedByPastTime || isSlotOccupied(timeStr, serviceDuration);
          const isCurrent = isCurrentDate && timeStr === currentTimeStr;
          slots.push({ time: timeStr, occupied, isCurrent });
        }
      }

      // Ordenar slots por hora
      slots.sort((a, b) => a.time.localeCompare(b.time));

      console.log(`🎯 Slots calculados (${slots.length})`);
      setAvailableHorarios(slots);

      // Auto-seleccionar la primera hora disponible
      if (slots.length > 0) {
        const firstAvailable = slots.find(s => !s.occupied);
        if (firstAvailable) {
          setSelectedTime(firstAvailable.time);
        }
      }
    } catch (err) {
      console.error('❌ Error al calcular horarios:', err);
      setAvailableHorarios([]);
    } finally {
      setLoadingHorarios(false);
    }
  };

  // Recalcular horarios cuando cambie la fecha
  useEffect(() => {
    if (selectedDate && cita && servicio && horarios.length > 0) {
      calculateAvailableHorarios();
    }
  }, [selectedDate, cita, servicio, horarios]);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !cita || !servicio) {
      setError('Por favor selecciona una nueva fecha y hora');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Calcular hora_fin usando la duración del servicio
      const [horas, minutos] = selectedTime.split(':').map(Number);
      const totalMinutos = horas * 60 + minutos + servicio.duracion_minutos;
      const horaFin = `${Math.floor(totalMinutos / 60).toString().padStart(2, '0')}:${(totalMinutos % 60).toString().padStart(2, '0')}`;

      await citasService.reagendarCita(cita.id, {
        fecha: selectedDate,
        hora_inicio: selectedTime,
        hora_fin: horaFin
      });

      success('Cita reprogramada correctamente');
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
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
                        {/* Calcular espacios vacíos al inicio según el día de la semana */}
                        {(() => {
                          const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                          const dayOfWeek = firstDay.getDay();
                          // Convertir: JS usa 0=Domingo, nosotros 0=Lunes
                          const startOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                          
                          // Crear espacios vacíos
                          const emptyDays = Array.from({length: startOffset}, (_, i) => (
                            <div key={`empty-${i}`} />
                          ));
                          
                          // Crear días del mes
                          const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
                          const monthDays = Array.from({length: daysInMonth}, (_, i) => {
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
                          });
                          
                          return [...emptyDays, ...monthDays];
                        })()}
                    </div>

                    {selectedDate && (
                      <>
                        <h3 className="text-lg font-bold mb-4 text-text-light dark:text-text-dark">
                          Horas Disponibles para {formatDate(selectedDate)}
                        </h3>
                        {loadingHorarios ? (
                          <div className="flex items-center gap-2 text-subtext-light dark:text-subtext-dark">
                            <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                            Cargando horarios...
                          </div>
                        ) : availableHorarios.length === 0 ? (
                          <p className="text-subtext-light dark:text-subtext-dark text-sm">
                            No hay horarios disponibles para esta fecha
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {availableHorarios.map(slot => (
                              <button 
                                key={slot.time}
                                disabled={slot.occupied}
                                onClick={() => !slot.occupied && setSelectedTime(slot.time)}
                                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                                  slot.occupied
                                    ? 'opacity-50 cursor-not-allowed bg-red-500/10 border-red-500/30 text-red-500/50'
                                    : slot.isCurrent
                                      ? 'bg-green-500 text-white border-green-500 font-bold ring-2 ring-green-300'
                                      : selectedTime === slot.time 
                                        ? 'bg-primary text-text-light border-primary font-bold' 
                                        : 'border-primary/20 dark:border-primary/30 text-text-light dark:text-text-dark hover:bg-primary/20'
                                }`}
                                title={slot.occupied ? 'Este horario está ocupado' : slot.isCurrent ? 'Horario actual de la cita' : slot.time}
                              >
                                {slot.time}
                                {slot.occupied && <span className="text-xs ml-1">✕</span>}
                                {slot.isCurrent && <span className="text-xs ml-1">●</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                </div>
            </div>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <Toast messages={messages} onRemove={removeToast} />
    </div>
  );
};

export default Reschedule;

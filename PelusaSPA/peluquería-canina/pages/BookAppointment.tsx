import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mascotasService, citasService, authService, Mascota, Servicio } from '../services';
import type { Horario } from '../services/citasService';

const steps = ["Servicio", "Mascota", "Peluquero", "Fecha y Hora", "Confirmación"];

const BookAppointment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [peluqueros, setPeluqueros] = useState<any[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Verificar autenticación
  useEffect(() => {
    if (!user) {
      setError('Debes iniciar sesión para agendar una cita');
    }
  }, [user]);

  // Cargar mascotas del usuario
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Iniciando carga de datos...');
      
      // Cargar servicios primero (público, sin token)
      let serviciosData: Servicio[] = [];
      try {
        console.log('📡 Llamando a citasService.getServicios()...');
        serviciosData = await citasService.getServicios();
        console.log('✅ Servicios recibidos:', serviciosData);
      } catch (serviciosError: any) {
        console.error('❌ Error al obtener servicios:', serviciosError);
        console.error('Response:', serviciosError.response);
        console.error('Status:', serviciosError.response?.status);
        console.error('Data:', serviciosError.response?.data);
      }
      
      // Cargar mascotas y peluqueros (requieren autenticación)
      let mascotasData: Mascota[] = [];
      let peluquerosData: any[] = [];
      let horariosData: Horario[] = [];
      
      try {
        console.log('📡 Llamando a mascotasService.getMascotas()...');
        mascotasData = await mascotasService.getMascotas();
        console.log('✅ Mascotas recibidas:', mascotasData);
      } catch (mascotasError: any) {
        console.error('❌ Error al obtener mascotas:', mascotasError);
      }
      
      try {
        console.log('📡 Llamando a authService.getPeluqueros()...');
        peluquerosData = await authService.getPeluqueros();
        console.log('✅ Peluqueros recibidos:', peluquerosData);
      } catch (peluquerosError: any) {
        console.error('❌ Error al obtener peluqueros:', peluquerosError);
      }

      try {
        console.log('📡 Llamando a citasService.getHorarios()...');
        horariosData = await citasService.getHorarios();
        console.log('✅ Horarios recibidos:', horariosData);
      } catch (horariosError: any) {
        console.error('❌ Error al obtener horarios:', horariosError);
      }
      
      console.log('📊 Datos finales:', {
        servicios: serviciosData?.length || 0,
        mascotas: mascotasData?.length || 0,
        peluqueros: peluquerosData?.length || 0,
        horarios: horariosData?.length || 0
      });
      
      setMascotas(mascotasData);
      setServicios(serviciosData || []);
      setPeluqueros(peluquerosData || []);
      setHorarios(horariosData || []);
    } catch (error: any) {
      console.error('❌ Error general al cargar datos:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      let errorMsg = 'Error al cargar información';
      if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      } else if (error.response?.status === 401) {
        errorMsg = 'Error de autenticación. Por favor, inicia sesión nuevamente.';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setError(errorMsg);
      setServicios([]);
      setMascotas([]);
      setPeluqueros([]);
      setHorarios([]);
    } finally {
      setLoading(false);
    }
  };

  const [selectedService, setSelectedService] = useState<Servicio | null>(null);
  const [selectedPet, setSelectedPet] = useState("");
  const [selectedPeluquero, setSelectedPeluquero] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableHorarios, setAvailableHorarios] = useState<{ time: string; occupied: boolean }[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  const handleNext = async () => {
    // Validar paso 1: debe haber servicio seleccionado
    if (currentStep === 0 && !selectedService) {
      setError('Por favor, selecciona un servicio');
      return;
    }

    // Validar paso 2: debe haber mascota seleccionada
    if (currentStep === 1 && !selectedPet) {
      setError('Por favor, selecciona una mascota');
      return;
    }

    // Validar paso 3: debe haber peluquero seleccionado
    if (currentStep === 2 && !selectedPeluquero) {
      setError('Por favor, selecciona un peluquero antes de continuar');
      return;
    }

    // Validar paso 4: debe haber fecha y hora seleccionadas
    if (currentStep === 3) {
      if (!selectedDate) {
        setError('Por favor, selecciona una fecha');
        return;
      }

      if (!selectedTime) {
        setError('Por favor, selecciona una hora disponible');
        return;
      }

      // Validar que la hora tiene suficiente tiempo en el horario del peluquero
      const timeToMinutes = (timeStr: string): number => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
      };

      const selectedDateObj = new Date(selectedDate);
      const dayOfWeek = selectedDateObj.getDay();
      const dayOfWeekAdjusted = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      const peluqueroHorarios = horarios.filter(h => 
        h.peluquero_id.toString() === selectedPeluquero && 
        h.dia_semana === dayOfWeekAdjusted && 
        h.activo
      );

      const selectedTimeMinutes = timeToMinutes(selectedTime);
      const serviceDuration = selectedService?.duracion_minutos || 0;
      const endTimeMinutes = selectedTimeMinutes + serviceDuration;

      let hasValidHorario = false;
      for (const horario of peluqueroHorarios) {
        const horarioEnd = timeToMinutes(horario.hora_fin);
        if (endTimeMinutes <= horarioEnd) {
          hasValidHorario = true;
          break;
        }
      }

      if (!hasValidHorario) {
        setError(`No hay suficiente tiempo. El servicio requiere ${serviceDuration} minutos y el turno termina antes.`);
        return;
      }
    }
    
    // Limpiar error al avanzar
    setError('');
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit - crear la cita
      await handleSubmitCita();
    }
  };

  // Función para calcular horarios disponibles y detectar conflictos
  const calculateAvailableHorarios = async () => {
    if (!selectedPeluquero || !selectedDate || !selectedService) {
      setAvailableHorarios([]);
      return;
    }

    setLoadingHorarios(true);

    try {
      // Obtener día de la semana (0=Lunes, 6=Domingo)
      const selectedDateObj = new Date(selectedDate);
      const dayOfWeek = selectedDateObj.getDay();
      // Ajustar porque JS usa 0=Domingo pero nosotros usamos 0=Lunes
      const dayOfWeekAdjusted = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      // Buscar horarios del peluquero para ese día
      const peluqueroHorarios = horarios.filter(h => 
        h.peluquero_id.toString() === selectedPeluquero && 
        h.dia_semana === dayOfWeekAdjusted && 
        h.activo
      );

      if (peluqueroHorarios.length === 0) {
        console.log(`🔍 Sin horarios para peluquero ${selectedPeluquero} en día ${dayOfWeekAdjusted}`);
        setAvailableHorarios([]);
        return;
      }

      console.log(`✅ Encontrados ${peluqueroHorarios.length} horarios para peluquero ${selectedPeluquero} en día ${dayOfWeekAdjusted}:`, peluqueroHorarios);

      // Obtener citas existentes para esta fecha y peluquero
      let citasExistentes = [];
      try {
        const todasLasCitas = await citasService.getCitasPorFecha(
          parseInt(selectedPeluquero),
          selectedDate
        );
        // Filtrar solo citas activas (excluir CANCELADA)
        citasExistentes = todasLasCitas.filter(c => c.estado !== 'CANCELADA');
        console.log(`📅 Citas existentes en ${selectedDate} para peluquero ${selectedPeluquero}:`, citasExistentes);
      } catch (err) {
        console.error('⚠️ Error al obtener citas:', err);
        // Continuar sin citas si hay error
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

        // Verificar contra cada cita existente
        for (const cita of citasExistentes) {
          const citaStartMinutes = timeToMinutes(cita.hora_inicio);
          const citaEndMinutes = timeToMinutes(cita.hora_fin);

          // Hay conflicto si el slot se superpone con la cita
          if (slotMinutes < citaEndMinutes && slotEndMinutes > citaStartMinutes) {
            return true;
          }
        }

        return false;
      };

      // Generar slots de hora con información de ocupación
      const slots: { time: string; occupied: boolean }[] = [];
      const serviceDuration = selectedService.duracion_minutos;

      for (const horario of peluqueroHorarios) {
        const [startHour, startMin] = horario.hora_inicio.split(':').map(Number);
        const [endHour, endMin] = horario.hora_fin.split(':').map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        console.log(`📅 Horario: ${horario.hora_inicio}-${horario.hora_fin} (duración servicio: ${serviceDuration}min)`);

        // Generar slots cada 30 minutos
        for (let time = startMinutes; time + serviceDuration <= endMinutes; time += 30) {
          const hours = Math.floor(time / 60);
          const minutes = time % 60;
          const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          
          const occupied = isSlotOccupied(timeStr, serviceDuration);
          slots.push({ time: timeStr, occupied });
          
          if (occupied) {
            console.log(`❌ Slot ${timeStr} OCUPADO`);
          }
        }
      }

      // Ordenar slots por hora
      slots.sort((a, b) => a.time.localeCompare(b.time));

      console.log(`🎯 Slots calculados (${slots.length}): ${slots.map(s => `${s.time}${s.occupied ? '(X)' : ''}`).join(', ')}`);
      setAvailableHorarios(slots);

      // Auto-seleccionar la primera hora disponible (no ocupada)
      if (slots.length > 0) {
        const firstAvailable = slots.find(s => !s.occupied);
        if (firstAvailable) {
          console.log(`✅ Auto-seleccionando primera hora disponible: ${firstAvailable.time}`);
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

  // Recalcular horarios cuando cambien peluquero, fecha o servicio
  useEffect(() => {
    calculateAvailableHorarios();
  }, [selectedPeluquero, selectedDate, selectedService, horarios]);

  const handleSubmitCita = async () => {
    // Verificar autenticación primero
    if (!user) {
      setError('Debes iniciar sesión para agendar una cita. Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (!selectedService || !selectedPet || !selectedPeluquero || !selectedDate || !selectedTime) {
      setError('Por favor completa todos los campos');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // DEBUG: Verificar token antes de enviar
      const token = localStorage.getItem('access_token');
      console.log('🔑 Token en localStorage:', token ? `${token.substring(0, 50)}...` : 'NO EXISTE');
      console.log('👤 Usuario actual:', user);
      
      // La fecha ya está en formato YYYY-MM-DD desde el calendario
      const fecha = selectedDate;
      
      // Calcular hora_fin basada en la duración del servicio
      const horaInicio = selectedTime;
      const duracionMinutos = selectedService.duracion_minutos;
      const [horas, minutos] = horaInicio.split(':').map(Number);
      const totalMinutos = horas * 60 + minutos + duracionMinutos;
      const horaFin = `${Math.floor(totalMinutos / 60).toString().padStart(2, '0')}:${(totalMinutos % 60).toString().padStart(2, '0')}`;

      console.log('📋 Datos a enviar:', {
        mascota_id: parseInt(selectedPet),
        servicio: selectedService.id,
        peluquero_id: parseInt(selectedPeluquero),
        fecha: fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin
      });

      await citasService.createCita({
        mascota_id: parseInt(selectedPet),
        servicio: selectedService.id,
        peluquero_id: parseInt(selectedPeluquero),
        fecha: fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin
      });

      // Navegar al dashboard después de crear la cita
      navigate('/dashboard');
    } catch (err: any) {
      console.error('❌ Error al crear cita:', err);
      console.error('📄 Error response:', err.response);
      
      let errorMsg = 'Error al crear la cita';
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (Array.isArray(err.response?.data)) {
        // Si es una lista de errores
        errorMsg = err.response.data
          .map((e: any) => typeof e === 'string' ? e : Object.values(e).join(', '))
          .join('; ');
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="flex flex-1 justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col w-full max-w-6xl">
        <div className="mb-8">
            <h1 className="text-4xl font-black mb-2 text-text-light dark:text-text-dark">Reserva tu Cita</h1>
            <p className="text-subtext-light dark:text-subtext-dark">Agenda una cita para tu mascota en solo cuatro pasos.</p>
        </div>

        {/* Stepper */}
        <div className="flex flex-wrap gap-2 mb-8 text-sm sm:text-base">
            {steps.map((step, idx) => (
                <div key={idx} className="flex items-center">
                    <span className={`font-medium ${idx === currentStep ? 'text-text-light dark:text-text-dark font-bold' : 'text-subtext-light dark:text-subtext-dark'}`}>
                        {step}
                    </span>
                    {idx < steps.length - 1 && <span className="mx-2 text-subtext-light dark:text-subtext-dark">/</span>}
                </div>
            ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                {/* Step 1: Services */}
                {currentStep === 0 && (
                    <section>
                        <h2 className="text-xl font-bold mb-4 text-text-light dark:text-text-dark">1. Elige el servicio que necesitas</h2>
                        {loading ? (
                          <div className="text-center p-8 text-subtext-light dark:text-subtext-dark">Cargando servicios...</div>
                        ) : servicios.length === 0 ? (
                          <div className="text-center p-8 text-subtext-light dark:text-subtext-dark">No hay servicios disponibles</div>
                        ) : (
                          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                            {servicios.map(servicio => {
                              // Usar imagen_url del backend si existe, sino usar la imagen por defecto
                              const getImageUrl = (servicio: any) => {
                                if (servicio.imagen_url) {
                                  return servicio.imagen_url;
                                }
                                
                                // Mapeo de imágenes por defecto según el nombre del servicio
                                const nombreLower = servicio.nombre.toLowerCase();
                                if (nombreLower.includes('baño') || nombreLower.includes('higien')) {
                                  return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpZnT1TZQGqgdvWPJfTulsTilvr9wNzmN3B-PtSFg2cYshrljusCPV_NKiXjHcl8jbOs0Pxjmz6u_soc8Z5mpKWCkPRN_qYzHmrdcFdDXqFipwBCsUWrwCsDGISEjS6OJ0BqlufVjwUO_qxLHcj4DRObkXAV0ZalTkkw-PwR7-Mb__2muwwGj4MGCkLrW2uKD6mdIRWbuDtXUJF4C9PI7ybGSt2gSZuL8d9WX5YApnHtlpYM_Me-3MsxKKkmVYDFvht4b1weogMqw';
                                } else if (nombreLower.includes('corte') || nombreLower.includes('tijera')) {
                                  return 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9bsuWWLnHuLo7hcanZIX1YCSinTYVoWMjwZmRdebHoDsKZsaDHkmrbBTKMsmVSU_fIfLzYF5tXqGVMMbT06NyCdwN0UaqmmWOT3Wbf3sIiR8P8tw7UFIucQwU-8QkLomq4UmxhDBl11INvKE9kVjiy5Iq1Hl177QpI08vwFvx93BNwPubEPII3tKE2YdedMiXA6omZN40sQ0KTBZPTYLJIV9HBnn5KBJoXc64LW-ic57PAKU_Ma83n8kq0lCTA1CMFwsiz7QgAQE';
                                } else if (nombreLower.includes('tratamiento') || nombreLower.includes('antiparasit') || nombreLower.includes('especial')) {
                                  return 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7Fcpmv7A7CAQ_kHxUzjyXskylSOSWr4juLLwNJr6C6gs0_XFX02bDj798sImr5PtlG1SYJkUgyulbqfxmeeWDRYFehACk_j5TSnFNArxHEjQMvinogl6E5fmxdPZRPbA9Ynba0hYZcZp1zs75MW2jOkepVpABCrElfmChlmJHyBjfXW9RVlpVrYuWRTI2GEv7wct5vzJrxZuF5SXTvsDRu9BNr9V15xmQB_e43XkQhZThLtACqGF9zrfugG4FI0ZHwwD4k8-iKWc';
                                } else if (nombreLower.includes('completo') || nombreLower.includes('premium') || nombreLower.includes('combo')) {
                                  return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDX-vNDbY1iMsta1Ms7hY43dF_oSy_c-y3jzvestEO1dPbZYU8cgma4ggjBuQFDXYAYemIcngvRnk28eAi9_HIPF5d2q38U4WA7H3pYdgVEMY9iOpP3NMt2veWE3e01sr6VUhVje_0keeW3jilwCGJTN1nc2uvkd_KZYpaIX1IaQKa3k0w5nbn3H6xPlppjJHLPbHbEjFuMnAEsLrFBCR27DE4cEMM7wq8raPWQaIfishO2BzqWS_Efbd3xzX5ssGolmGA0PxMW6fo';
                                }
                                // Imagen por defecto para servicios que no coincidan
                                return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpZnT1TZQGqgdvWPJfTulsTilvr9wNzmN3B-PtSFg2cYshrljusCPV_NKiXjHcl8jbOs0Pxjmz6u_soc8Z5mpKWCkPRN_qYzHmrdcFdDXqFipwBCsUWrwCsDGISEjS6OJ0BqlufVjwUO_qxLHcj4DRObkXAV0ZalTkkw-PwR7-Mb__2muwwGj4MGCkLrW2uKD6mdIRWbuDtXUJF4C9PI7ybGSt2gSZuL8d9WX5YApnHtlpYM_Me-3MsxKKkmVYDFvht4b1weogMqw';
                              };

                              return (
                                <div 
                                    key={servicio.id}
                                    onClick={() => setSelectedService(servicio)}
                                    className={`flex flex-col gap-3 pb-3 rounded-xl border p-3 cursor-pointer transition-all hover:shadow-md
                                    ${selectedService?.id === servicio.id 
                                        ? 'border-primary bg-primary/10 dark:bg-primary/5' 
                                        : 'border-border-light dark:border-border-dark hover:border-primary/50'}`}
                                >
                                    <div 
                                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
                                      style={{ backgroundImage: `url(${getImageUrl(servicio)})` }}
                                    />
                                    <div>
                                        <p className="text-text-light dark:text-text-dark text-base font-bold">{servicio.nombre}</p>
                                        <p className="text-subtext-light dark:text-subtext-dark text-sm">Duración: {servicio.duracion_minutos} min - €{servicio.precio}</p>
                                        {servicio.descripcion && (
                                          <p className="text-subtext-light dark:text-subtext-dark text-xs mt-1">{servicio.descripcion}</p>
                                        )}
                                    </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                    </section>
                )}

                {/* Step 2: Pet */}
                {currentStep === 1 && (
                     <section>
                        <h2 className="text-xl font-bold mb-4 text-text-light dark:text-text-dark">2. Selecciona tu mascota</h2>
                        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-border-light dark:border-border-dark">
                             {loading ? (
                               <p className="text-center text-subtext-light dark:text-subtext-dark">Cargando mascotas...</p>
                             ) : mascotas.length === 0 ? (
                               <div className="text-center py-8">
                                 <p className="text-subtext-light dark:text-subtext-dark mb-4">No tienes mascotas registradas</p>
                                 <Link to="/register-pet" className="inline-block px-6 py-3 bg-primary text-text-light rounded-lg font-bold hover:bg-primary/90 transition-colors">
                                   Registrar mascota
                                 </Link>
                               </div>
                             ) : (
                               <>
                                 <label className="block text-sm font-medium text-subtext-light dark:text-subtext-dark mb-2" htmlFor="pet-select">Elige una de tus mascotas*</label>
                                 <select 
                                    id="pet-select" 
                                    className="w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-3 text-text-light dark:text-text-dark focus:border-primary focus:ring-primary"
                                    value={selectedPet}
                                    onChange={(e) => setSelectedPet(e.target.value)}
                                 >
                                    <option value="">Selecciona una mascota</option>
                                    {mascotas.map(m => (
                                      <option key={m.id} value={m.id}>
                                        {m.nombre} ({m.especie} - {m.raza})
                                      </option>
                                    ))}
                                 </select>
                                 <div className="mt-4 text-center text-sm text-subtext-light dark:text-subtext-dark">
                                    <span>¿No encuentras a tu mascota?</span>
                                    <Link to="/register-pet" className="ml-1 font-semibold text-primary hover:underline">Añade una nueva</Link>
                                 </div>
                               </>
                             )}
                        </div>
                     </section>
                )}

                {/* Step 3: Peluquero */}
                {currentStep === 2 && (
                     <section>
                        <h2 className="text-xl font-bold mb-4 text-text-light dark:text-text-dark">3. Selecciona un peluquero</h2>
                        <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-border-light dark:border-border-dark">
                             {loading ? (
                               <p className="text-center text-subtext-light dark:text-subtext-dark">Cargando peluqueros...</p>
                             ) : peluqueros.length === 0 ? (
                               <p className="text-center text-subtext-light dark:text-subtext-dark">No hay peluqueros disponibles</p>
                             ) : (
                               <div className="grid gap-4">
                                 {peluqueros.map(p => (
                                   <div
                                     key={p.id}
                                     onClick={() => setSelectedPeluquero(p.id.toString())}
                                     className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                                       selectedPeluquero === p.id.toString()
                                         ? 'border-primary bg-primary/10 dark:bg-primary/5'
                                         : 'border-border-light dark:border-border-dark hover:border-primary/50'
                                     }`}
                                   >
                                     <div className="flex items-center gap-3">
                                       <div className="bg-primary/20 rounded-full h-12 w-12 flex items-center justify-center">
                                         <span className="material-symbols-outlined text-primary">person</span>
                                       </div>
                                       <div className="flex-1">
                                         <p className="text-text-light dark:text-text-dark font-bold">
                                           {p.persona?.nombre} {p.persona?.apellido}
                                         </p>
                                         {p.perfil?.especialidad && (
                                           <p className="text-sm text-subtext-light dark:text-subtext-dark">
                                             {p.perfil.especialidad}
                                           </p>
                                         )}
                                         {p.perfil?.experiencia && (
                                           <p className="text-xs text-subtext-light dark:text-subtext-dark">
                                             {p.perfil.experiencia}
                                           </p>
                                         )}
                                       </div>
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             )}
                        </div>
                     </section>
                )}

                {/* Step 4: Date & Time */}
                {currentStep === 3 && (
                    <section>
                         <h2 className="text-xl font-bold mb-4 text-text-light dark:text-text-dark">4. Selecciona una fecha y hora disponible</h2>
                         <div className="grid grid-cols-1 md:grid-cols-5 gap-6 bg-white dark:bg-card-dark p-4 rounded-xl border border-border-light dark:border-border-dark">
                            <div className="md:col-span-3">
                                <div className="flex justify-between items-center mb-4">
                                    <button 
                                      type="button"
                                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                      className="p-1 hover:bg-primary/20 rounded-full"
                                    >
                                      <span className="material-symbols-outlined">chevron_left</span>
                                    </button>
                                    <span className="font-bold text-lg text-text-light dark:text-text-dark">
                                      {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                    </span>
                                    <button 
                                      type="button"
                                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                      className="p-1 hover:bg-primary/20 rounded-full"
                                    >
                                      <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </div>
                                <div className="grid grid-cols-7 text-center gap-1 text-sm mb-2">
                                    {['LU','MA','MI','JU','VI','SA','DO'].map(d => <span key={d} className="font-medium text-subtext-light dark:text-subtext-dark">{d}</span>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
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
                                          <button 
                                              key={day}
                                              type="button"
                                              disabled={isPast}
                                              onClick={() => setSelectedDate(dateStr)}
                                              className={`aspect-square rounded-full flex items-center justify-center text-sm transition-colors ${
                                                isPast 
                                                  ? 'text-subtext-light/30 dark:text-subtext-dark/30 cursor-not-allowed'
                                                  : selectedDate === dateStr 
                                                    ? 'bg-primary text-text-light font-bold' 
                                                    : 'hover:bg-primary/20 text-text-light dark:text-text-dark'
                                              }`}
                                          >
                                              {day}
                                          </button>
                                        );
                                      });
                                      
                                      return [...emptyDays, ...monthDays];
                                    })()}
                                </div>
                            </div>
                            <div className="md:col-span-2 border-l border-border-light dark:border-border-dark pl-6">
                                <p className="font-bold text-lg mb-4 text-text-light dark:text-text-dark">Horarios</p>
                                {loadingHorarios ? (
                                    <div className="flex items-center gap-2 text-subtext-light dark:text-subtext-dark">
                                        <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                                        Cargando horarios...
                                    </div>
                                ) : availableHorarios.length === 0 ? (
                                    <p className="text-subtext-light dark:text-subtext-dark text-sm">
                                        {selectedPeluquero && selectedDate && selectedService 
                                            ? 'No hay horarios disponibles para esta fecha' 
                                            : 'Selecciona un peluquero, mascota y servicio primero'}
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        {availableHorarios.map(slot => (
                                            <button 
                                                key={slot.time}
                                                type="button"
                                                disabled={slot.occupied}
                                                onClick={() => !slot.occupied && setSelectedTime(slot.time)}
                                                className={`py-2 rounded-lg border text-sm transition-all ${
                                                  slot.occupied
                                                    ? 'opacity-50 cursor-not-allowed bg-red-500/10 border-red-500/30 text-red-500/50 dark:text-red-500/40' 
                                                    : selectedTime === slot.time 
                                                      ? 'bg-primary text-text-light border-primary font-semibold' 
                                                      : 'border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:border-primary hover:text-primary'
                                                }`}
                                                title={slot.occupied ? 'Este horario está ocupado' : slot.time}
                                            >
                                                {slot.time}
                                                {slot.occupied && <span className="text-xs ml-1">✕</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                         </div>
                    </section>
                )}

                {/* Step 5: Confirmation */}
                {currentStep === 4 && (
                    <section>
                         <h2 className="text-xl font-bold mb-4 text-text-light dark:text-text-dark">5. Confirmación</h2>
                         <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-xl text-center">
                            <span className="material-symbols-outlined text-4xl text-green-600 dark:text-green-400 mb-2">check_circle</span>
                            <h3 className="text-xl font-bold text-text-light dark:text-text-dark">¡Todo listo!</h3>
                            <p className="text-subtext-light dark:text-subtext-dark">Por favor revisa los detalles a la derecha antes de confirmar.</p>
                         </div>
                    </section>
                )}
            </div>

            {/* Summary Sidebar */}
            <aside className="lg:col-span-1">
                <div className="sticky top-24 bg-white dark:bg-card-dark p-6 rounded-xl border border-border-light dark:border-border-dark flex flex-col gap-4 shadow-sm">
                    <h3 className="text-xl font-bold text-text-light dark:text-text-dark">Resumen de tu Cita</h3>
                    <div className="border-b border-border-light dark:border-border-dark pb-4 flex flex-col gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-subtext-light dark:text-subtext-dark">Servicio</span>
                          <span className="font-semibold text-text-light dark:text-text-dark">{selectedService?.nombre || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-subtext-light dark:text-subtext-dark">Mascota</span>
                          <span className="font-semibold text-text-light dark:text-text-dark">
                            {selectedPet ? mascotas.find(m => m.id.toString() === selectedPet)?.nombre : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-subtext-light dark:text-subtext-dark">Peluquero</span>
                          <span className="font-semibold text-text-light dark:text-text-dark">
                            {selectedPeluquero ? peluqueros.find(p => p.id.toString() === selectedPeluquero)?.persona?.nombre : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-subtext-light dark:text-subtext-dark">Fecha</span>
                          <span className="font-semibold text-text-light dark:text-text-dark">
                            {selectedDate ? new Date(selectedDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-subtext-light dark:text-subtext-dark">Hora</span>
                          <span className="font-semibold text-text-light dark:text-text-dark">{selectedTime || '-'}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-text-light dark:text-text-dark">Total</span>
                        <span className="font-black text-2xl text-text-light dark:text-text-dark">€{selectedService?.precio || '0'}</span>
                    </div>
                    
                    {currentStep === 4 && (
                         <div>
                            <label className="block text-sm font-medium text-subtext-light dark:text-subtext-dark mb-1">Notas (opcional)</label>
                            <textarea className="w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-2 text-sm" rows={3} placeholder="Añade peticiones especiales..."></textarea>
                         </div>
                    )}

                    <div className="flex flex-col gap-3 pt-2">
                        <button 
                            onClick={handleNext}
                            disabled={(currentStep === 0 && !selectedService) || submitting}
                            className={`w-full flex items-center justify-center rounded-lg h-12 bg-primary text-text-light font-bold transition-opacity ${(currentStep === 0 && !selectedService) || submitting ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                        >
                            {submitting ? 'Creando cita...' : (currentStep === 4 ? 'Confirmar Cita' : 'Continuar')}
                        </button>
                        {currentStep > 0 && (
                            <button 
                                onClick={handleBack}
                                disabled={submitting}
                                className="w-full flex items-center justify-center rounded-lg h-12 bg-transparent text-subtext-light dark:text-subtext-dark font-bold hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Volver
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;

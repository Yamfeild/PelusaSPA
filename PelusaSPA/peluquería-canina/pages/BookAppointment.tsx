import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mascotasService, citasService, authService, Mascota } from '../services';

const steps = ["Servicio", "Mascota", "Peluquero", "Fecha y Hora", "Confirmación"];

const BookAppointment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [peluqueros, setPeluqueros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Cargar mascotas del usuario
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mascotasData, peluquerosData] = await Promise.all([
        mascotasService.getMascotas(),
        authService.getPeluqueros()
      ]);
      setMascotas(mascotasData);
      setPeluqueros(peluquerosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar información');
    } finally {
      setLoading(false);
    }
  };

  // Mock Data de servicios (esto se mantiene hasta que tengamos endpoint de servicios)
  const services = [
    { id: 1, title: "Baño y Secado", time: "60 min", price: 25, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjVpA1DMnBx9mcS-lRhnouRPcrUCIEqSYYfKd6o2k1JApIFjpXw9OY_QPWG71wpAC81hcZN0bNoVEwHSdgdiptVw04nTKGEYw1JDSyV6gqRh-h9TXeT_sE0xt8s2zi_N6BW2inRs6IK1tpWzvg8EgOYYln2Heg3ICYjX7xoKhjS3o_vMHL0dld85dSEjOgC2WYNfV67jB0tvKg1h6O02AECsbAfiOJEtXadKYYzI18hMWxNNq8Cq_ScCTn_qJmta8AUvXYxIi1KOM" },
    { id: 2, title: "Corte de Pelo", time: "90 min", price: 35, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB46c1YNWVzcuaJWwH8_E3GzVwc5rP83v9_TqcUHJMTNk0cDLGcaU2_CCgdt6l9cqkzD5Sy3QKqGgP-QWh6q0QwS4_7qPydvuRTH86vepOOZJYOrpwXeATYB6Uzor8gaxI_r0DOBNmlZ355_Dgv6J-j8S92djWCxb4njAnDue1oG2hzS2GEkq7c1qGFAUgprbstce1mNZ-sHMdNzR7rWt4DXqOzWrmkldcfqFSkZVGh2UywiU5LywH0MkrCvw77o1Qn5OR8l3AH29E" },
    { id: 3, title: "Combo Completo", time: "120 min", price: 50, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTF5oExAC_KhhncOQJf7ulTgvRKIreoWFVM8-Xi51qpC23PjYblc2o-9vWX-lwG63T2SKimgLFM1f3AXYAxuPtj4yQ5km5gHUn46qejb0Mm9QiIAM6pH84fVWu0VTTgHooKCE4umjxPifZ-qcL0ND_pn_EsPrdc19XwjuKJ8Bu7bAtlkIXHkrcIQDkTM9h88OYcpWQdF-Yimthsa6oeLuUDUb5sbtbesbHO9dEX-hrI2smAlPbRuo33IaTz2GNkw3hYontMsiwyb0" }
  ];

  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedPet, setSelectedPet] = useState("");
  const [selectedPeluquero, setSelectedPeluquero] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit - crear la cita
      await handleSubmitCita();
    }
  };

  const handleSubmitCita = async () => {
    if (!selectedService || !selectedPet || !selectedPeluquero || !selectedDate || !selectedTime) {
      setError('Por favor completa todos los campos');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // La fecha ya está en formato YYYY-MM-DD desde el calendario
      const fecha = selectedDate;
      
      // Calcular hora_fin basada en la duración del servicio
      const horaInicio = selectedTime;
      const duracionMinutos = parseInt(selectedService.time) || 60;
      const [horas, minutos] = horaInicio.split(':').map(Number);
      const totalMinutos = horas * 60 + minutos + duracionMinutos;
      const horaFin = `${Math.floor(totalMinutos / 60).toString().padStart(2, '0')}:${(totalMinutos % 60).toString().padStart(2, '0')}`;

      await citasService.createCita({
        mascota_id: parseInt(selectedPet),
        servicio: selectedService.title,
        peluquero_id: parseInt(selectedPeluquero),
        fecha: fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin
      });

      // Navegar al dashboard después de crear la cita
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al crear la cita');
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
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                            {services.map(service => (
                                <div 
                                    key={service.id}
                                    onClick={() => setSelectedService(service)}
                                    className={`flex flex-col gap-3 pb-3 rounded-xl border p-3 cursor-pointer transition-all hover:shadow-md
                                    ${selectedService?.id === service.id 
                                        ? 'border-primary bg-primary/10 dark:bg-primary/5' 
                                        : 'border-border-light dark:border-border-dark hover:border-primary/50'}`}
                                >
                                    <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg" style={{ backgroundImage: `url("${service.img}")` }}></div>
                                    <div>
                                        <p className="text-text-light dark:text-text-dark text-base font-bold">{service.title}</p>
                                        <p className="text-subtext-light dark:text-subtext-dark text-sm">Duración: {service.time} - €{service.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                                    })}
                                </div>
                            </div>
                            <div className="md:col-span-2 border-l border-border-light dark:border-border-dark pl-6">
                                <p className="font-bold text-lg mb-4 text-text-light dark:text-text-dark">Horarios</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {["09:00", "11:00", "12:00", "16:00", "17:00", "18:00"].map(time => (
                                        <button 
                                            key={time}
                                            type="button"
                                            onClick={() => setSelectedTime(time)}
                                            className={`py-2 rounded-lg border text-sm transition-all ${
                                              selectedTime === time 
                                                ? 'bg-primary text-text-light border-primary' 
                                                : 'border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:border-primary hover:text-primary'
                                            }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
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
                          <span className="font-semibold text-text-light dark:text-text-dark">{selectedService?.title || '-'}</span>
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
                        <span className="font-black text-2xl text-text-light dark:text-text-dark">€{selectedService?.price || '0'}</span>
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

import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react'; 
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { citasService, Servicio, Horario, Cita } from '../services/citasService';
import { mascotasService } from '../services/mascotasService';
import { peluquerosService, Peluquero } from '../services/peluquerosService';
import { useTheme } from '../context/ThemeContext'; // Importar tema
import { notificacionService } from '../services/notificacionesService';

interface Pet {
  id: number;
  nombre: string;
  raza: string;
  edad: number;
}

export const BookingScreen = ({ navigation, route }: any) => {
  const { isDarkMode } = useTheme();
  const [step, setStep] = useState(1); 
  const [pets, setPets] = useState<Pet[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [peluqueros, setPeluqueros] = useState<Peluquero[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [selectedPeluquero, setSelectedPeluquero] = useState<Peluquero | null>(null);
  const [selectedFecha, setSelectedFecha] = useState<string>('');
  const [selectedHora, setSelectedHora] = useState<{ inicio: string; fin: string } | null>(null);
  const [notas, setNotas] = useState('');
  const [workingDays, setWorkingDays] = useState<number[]>([]);

  // Colores Dinámicos
  const dynamicColors = {
    bg: isDarkMode ? '#121212' : '#f8faf8',
    card: isDarkMode ? '#1e1e1e' : '#FFFFFF',
    header: isDarkMode ? '#1a1a1a' : '#FFFFFF',
    border: isDarkMode ? '#333333' : '#e0e0e0',
    text: isDarkMode ? '#FFFFFF' : '#0e1b12',
    subtext: isDarkMode ? '#AAAAAA' : '#666666',
    inputBg: isDarkMode ? '#252525' : '#FFFFFF',
  };

  const reprogramarId = route.params?.reprogramarCitaId;
  const preSelectedMascotaId = route.params?.mascotaId;
  const preSelectedServicioId = route.params?.servicioId;
  const preSelectedPeluqueroId = route.params?.peluqueroId;

  const resetForm = () => {
    setStep(1);
    setSelectedPet(null);
    setSelectedServicio(null);
    setSelectedPeluquero(null);
    setSelectedFecha('');
    setSelectedHora(null);
    setNotas('');
    navigation.setParams({ 
      reprogramarCitaId: undefined, 
      mascotaId: undefined, 
      servicioId: undefined, 
      peluqueroId: undefined 
    });
  };

  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [])
  );
  
useEffect(() => {
  // Solo disparamos si estamos en el paso 4 y tenemos los datos mínimos
  if (step === 4 && selectedPeluquero && selectedFecha) {
    fetchHorariosDisponibles();
  }
}, [selectedFecha, selectedPeluquero, step]);

  useEffect(() => {
    const initReprogramacion = () => {
      if (reprogramarId && pets.length > 0 && servicios.length > 0 && peluqueros.length > 0) {
        const pet = pets.find(p => p.id === preSelectedMascotaId);
        const serv = servicios.find(s => s.id === preSelectedServicioId);
        const pelu = peluqueros.find(p => p.id === preSelectedPeluqueroId);

        if (pet) setSelectedPet(pet);
        if (serv) setSelectedServicio(serv);
        if (pelu) setSelectedPeluquero(pelu);
        setStep(4);
      }
    };
    initReprogramacion();
  }, [reprogramarId, pets, servicios, peluqueros]);

  useEffect(() => {
  if (selectedPeluquero && step === 4) {
    fetchHorariosDisponibles();
  }
}, [selectedPeluquero, step]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [petsData, serviciosData, peluquerosData] = await Promise.all([
        mascotasService.getMascotas(),
        citasService.getServicios(),
        peluquerosService.getPeluqueros(),
      ]);
      setPets(petsData);
      setServicios(serviciosData.filter(s => s.activo));
      setPeluqueros(peluquerosData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const fetchHorariosDisponibles = async () => {
    
  if (!selectedPeluquero || !selectedFecha) return;

  setLoading(true);
  try {
    // 1. Cargamos simultáneamente los horarios configurados y todas las citas
    const [horariosData, todasLasCitas] = await Promise.all([
      citasService.getHorarios(selectedPeluquero.id),
      citasService.getCitas() 
    ]);

    // 2. Filtramos las citas que ya existen para este peluquero en la fecha seleccionada
    // IMPORTANTE: Solo consideramos citas que NO estén canceladas
    const citasOcupadas = todasLasCitas.filter(cita => 
      cita.peluquero_id === selectedPeluquero.id && 
      cita.fecha === selectedFecha &&
      cita.estado !== 'cancelada'
    );

    // 3. Obtener días laborables para el selector de fechas
    const days = [...new Set(horariosData.filter(h => h.activo).map(h => h.dia_semana))];
    setWorkingDays(days);

    // 4. Calcular el día de la semana actual (ajuste para backend 0-6)
    const [year, month, day] = selectedFecha.split('-').map(Number);
    const fechaObj = new Date(year, month - 1, day);
    let dayOfWeek = fechaObj.getDay(); 
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const rangosBase = horariosData.filter(h => h.dia_semana === dayIndex && h.activo);
    
    // 5. Función para generar slots y marcar los ocupados
      const generarSlots = (horaInicio: string, horaFin: string) => {
      const slots = [];
      // Usamos una fecha base cualquiera para manipular las horas
      let current = new Date(`2026-01-01T${horaInicio}`);
      const end = new Date(`2026-01-01T${horaFin}`);

      while (current < end) {
        // 1. Definimos la hora de inicio del slot actual
        const inicioStr = current.toTimeString().substring(0, 5);
        
        // 2. Calculamos la hora de fin (sumando 60 min)
        current.setMinutes(current.getMinutes() + 60);
        const finStr = current.toTimeString().substring(0, 5);
        
        if (current <= end) {
          // 3. Verificamos disponibilidad comparando SOLO HH:mm
          const ocupado = citasOcupadas.some(cita => {
            // Cortamos la hora de la cita por si trae segundos (00:00:00 -> 00:00)
            const horaCitaNormalizada = cita.hora_inicio.substring(0, 5);
            return horaCitaNormalizada === inicioStr;
          });

          slots.push({
            hora_inicio: inicioStr,
            hora_fin: finStr,
            activo: !ocupado // Si está ocupado, activo es false
          });
        }
      }
      return slots;
    };

    let todosLosHorarios: any[] = [];
    rangosBase.forEach(rango => {
      const slotsDelRango = generarSlots(rango.hora_inicio, rango.hora_fin);
      todosLosHorarios = [...todosLosHorarios, ...slotsDelRango];
    });

    setHorarios(todosLosHorarios);
  } catch (error) {
    console.error("Error cargando horarios y disponibilidad:", error);
    Alert.alert("Error", "No se pudo verificar la disponibilidad.");
  } finally {
    setLoading(false);
  }
};

  const handleNextStep = () => {
    if (step === 1 && !selectedPet) return Alert.alert('Error', 'Selecciona una mascota');
    if (step === 2 && !selectedServicio) return Alert.alert('Error', 'Selecciona un servicio');
    if (step === 3 && !selectedPeluquero) return Alert.alert('Error', 'Selecciona un peluquero');
    if (step === 4 && (!selectedFecha || !selectedHora)) return Alert.alert('Error', 'Selecciona fecha y hora');

    setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (reprogramarId && step === 4) {
      resetForm();
      navigation.navigate('Inicio');
    } else {
      setStep(step - 1);
    }
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      let citaData: any;
      if (reprogramarId) {
        await citasService.reagendarCita(reprogramarId, {
          fecha: selectedFecha,
          hora_inicio: selectedHora!.inicio,
          hora_fin: selectedHora!.fin,
        });
        Alert.alert('Éxito', 'Cita reprogramada correctamente');
      } else {
        const response = await citasService.createCita({
          mascota: selectedPet!.id,
          servicio: selectedServicio!.id,
          peluquero_id: selectedPeluquero!.id,
          fecha: selectedFecha,
          hora_inicio: selectedHora!.inicio,
          hora_fin: selectedHora!.fin,
          notas: notas || undefined,
        });

        citaData = response;

        const citaId = citaData?.id;

            if (citaId) {
              // Llamamos a tu servicio con el prefijo /api que pusimos arriba
              await notificacionService.crearNotificacionCita(citaId);
            }
        Alert.alert('¡Cita Confirmada!', `Hemos enviado una notificación a ${selectedPeluquero?.nombre} y se ha agendado para ${selectedPet!.nombre}.`);
      }
      resetForm();
      navigation.navigate('Inicio');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'No se pudo procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

 const availableDates = React.useMemo(() => {
  return [...Array(14)].map((_, i) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0); 
    date.setDate(date.getDate() + i);
    return {
      dateString: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase(),
      dayNum: date.getDate(),
      // Añadimos el mes (ej: "FEB" o "MAR")
      month: date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase().replace('.', ''),
    };
  });
}, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicColors.bg }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: dynamicColors.header, borderBottomColor: dynamicColors.border }]}>
        <Text style={[styles.headerTitle, { color: dynamicColors.text }]}>
          {reprogramarId ? 'Cambiar Horario' : 'Reservar Cita'}
        </Text>
        <Text style={[styles.stepIndicator, { color: dynamicColors.subtext }]}>
          {reprogramarId ? 'Selecciona tu nuevo horario' : `Paso ${step} de 5`}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* PASO 1: MASCOTAS */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: dynamicColors.text }]}>Selecciona tu mascota</Text>
            {pets.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.optionCard,
                  { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border },
                  selectedPet?.id === item.id && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedPet(item)}
              >
                <MaterialIcons name="pets" size={24} color={COLORS.primary} />
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, { color: dynamicColors.text }]}>{item.nombre}</Text>
                  <Text style={[styles.optionSubtitle, { color: dynamicColors.subtext }]}>{item.raza} • {item.edad} años</Text>
                </View>
                {selectedPet?.id === item.id && <MaterialIcons name="check-circle" size={24} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* PASO 2: SERVICIOS */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: dynamicColors.text }]}>Selecciona un servicio</Text>
            {servicios.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.optionCard,
                  { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border },
                  selectedServicio?.id === item.id && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedServicio(item)}
              >
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, { color: dynamicColors.text }]}>{item.nombre}</Text>
                  <Text style={[styles.optionSubtitle, { color: COLORS.primary, fontWeight: 'bold' }]}>
                    {item.duracion_minutos} min • ${item.precio}
                  </Text>
                </View>
                {selectedServicio?.id === item.id && <MaterialIcons name="check-circle" size={24} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* PASO 3: PELUQUEROS */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: dynamicColors.text }]}>Selecciona un peluquero</Text>
            {peluqueros.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.optionCard,
                  { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border },
                  selectedPeluquero?.id === item.id && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedPeluquero(item)}
              >
                <MaterialIcons name="person" size={24} color={COLORS.primary} />
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, { color: dynamicColors.text }]}>{item.nombre}</Text>
                  <Text style={[styles.optionSubtitle, { color: dynamicColors.subtext }]}>{item.email}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: dynamicColors.text }]}>Fecha y Hora</Text>
            
            {/* Selector de Fecha */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.dateSelector}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {availableDates.map((item) => {
                const isSelected = selectedFecha === item.dateString;
                const [y, m, d] = item.dateString.split('-').map(Number);
                const dateObj = new Date(y, m - 1, d);
                let dayOfWeek = dateObj.getDay(); 
                const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Ajuste a tu lógica de backend
                
                const isWorkingDay = workingDays.includes(dayIndex);
                return (
                  <TouchableOpacity 
                    key={item.dateString}
                    style={[
                      styles.dateCard, 
                      { 
                        backgroundColor: isSelected ? COLORS.primary : dynamicColors.card, 
                        borderColor: isSelected ? COLORS.primary : dynamicColors.border,
                        // Si no trabaja, le bajamos la opacidad y quitamos color
                        opacity: isWorkingDay ? 1 : 0.4 
                      },
                      // Colorcito suave si es día laboral pero no está seleccionado
                      isWorkingDay && !isSelected && { backgroundColor: isDarkMode ? '#1a2e1f' : '#f0fdf4', borderColor: COLORS.primary + '40' }
                    ]}
                    onPress={() => { setSelectedFecha(item.dateString); setSelectedHora(null); }}
                  >
                    <Text style={[
                      { fontSize: 9, fontWeight: '700' }, 
                      isSelected ? styles.textWhite : { color: isWorkingDay ? COLORS.primary : dynamicColors.subtext }
                    ]}>
                      {item.month}
                    </Text>
                    
                    <Text style={[styles.dateDayName, isSelected ? styles.textWhite : { color: dynamicColors.subtext }]}>
                      {item.dayName}
                    </Text>
                    
                    <Text style={[
                      styles.dateDayNum, 
                      isSelected ? styles.textWhite : { color: dynamicColors.text },
                      !isWorkingDay && { color: dynamicColors.subtext } // Gris si no trabaja
                    ]}>
                      {item.dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Grid de Horarios */}
            <View style={styles.timeGrid}>
              <Text style={[
                    styles.emptyText, 
                    { 
                      width: '100%', 
                      marginTop: 10, 
                      color: dynamicColors.text
                    }
                  ]}>
                  Elije un horario:
                </Text>
              {horarios.length > 0 ? (
                
                horarios.map((item, index) => {
                  const isSelected = selectedHora?.inicio === item.hora_inicio;
                  const isDisabled = !item.activo;
                  
                  return (
                    
                    <TouchableOpacity
                      key={`${item.hora_inicio}-${index}`}
                      disabled={isDisabled}
                      style={[
                        styles.timeSlot,
                        { 
                          backgroundColor: isSelected 
                            ? COLORS.primary 
                            : (isDisabled ? (isDarkMode ? '#2a2a2a' : '#f0f0f0') : dynamicColors.card), 
                          borderColor: isSelected ? COLORS.primary : dynamicColors.border 
                        },
                        isDisabled && { opacity: 0.5, borderStyle: 'dashed' } // Estilo visual de bloqueado
                      ]}
                      onPress={() => setSelectedHora({ inicio: item.hora_inicio, fin: item.hora_fin })}
                    >
                      <Text style={[
                        styles.timeSlotText, 
                        { color: isSelected ? '#fff' : (isDisabled ? '#888' : dynamicColors.text) },
                        isDisabled && { textDecorationLine: 'line-through' }
                      ]}>
                        {item.hora_inicio.substring(0, 5)}
                      </Text>
                      {/* Opcional: Un pequeño texto que diga "Ocupado" */}
                      {isDisabled && (
                        <Text style={{ fontSize: 8, color: 'red', fontWeight: 'bold' }}>OCUPADO</Text>
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={{ width: '100%', padding: 20, alignItems: 'center' }}>
                  <MaterialIcons name="event-busy" size={40} color={dynamicColors.subtext} />
                  <Text style={[styles.emptyText, { textAlign: 'center', color: dynamicColors.text, marginTop: 10 }]}>
                    No hay turnos disponibles para este día.
                  </Text>
                </View>
              )}
              <Text style={[
                    styles.emptyText, 
                    { 
                      width: '100%', 
                      marginTop: 10, 
                      color: dynamicColors.text
                    }
                  ]}>
                  Escribe un comentario:
                </Text>
            </View>
            {/* Notas */}
            <TextInput
              style={[
                styles.textArea, 
                { backgroundColor: dynamicColors.inputBg, borderColor: dynamicColors.border, color: dynamicColors.text }
              ]}
              placeholder="Comentario (opcional)..."
              placeholderTextColor={isDarkMode ? '#555' : '#999'}
              multiline
              numberOfLines={3}
              value={notas}
              onChangeText={setNotas}
            />
          </View>
        )}

        {/* PASO 5: CONFIRMACIÓN COMPLETA */}
          {step === 5 && (
            <View style={styles.stepContainer}>
              <Text style={[styles.stepTitle, { color: dynamicColors.text }]}>Resumen de tu cita</Text>
              
              <View style={[
                styles.confirmationBox, 
                { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border }
              ]}>
                
                {/* SECCIÓN: MASCOTA Y SERVICIO */}
                <View style={styles.summarySection}>
                  <MaterialIcons name="pets" size={20} color={COLORS.primary} />
                  <View style={styles.summaryTextContainer}>
                    <Text style={[styles.confirmLabel, { color: dynamicColors.subtext }]}>Mascota y Servicio</Text>
                    <Text style={[styles.confirmValue, { color: dynamicColors.text }]}>
                      {selectedPet?.nombre} — {selectedServicio?.nombre}
                    </Text>
                    {selectedServicio?.descripcion && (
                      <Text style={[styles.confirmDescription, { color: dynamicColors.subtext }]}>
                        {selectedServicio.descripcion}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={[styles.confirmDivider, { backgroundColor: dynamicColors.border }]} />

                {/* SECCIÓN: PELUQUERO */}
                <View style={styles.summarySection}>
                  <MaterialIcons name="person" size={20} color={COLORS.primary} />
                  <View style={styles.summaryTextContainer}>
                    <Text style={[styles.confirmLabel, { color: dynamicColors.subtext }]}>Peluquero asignado</Text>
                    <Text style={[styles.confirmValue, { color: dynamicColors.text }]}>{selectedPeluquero?.nombre}</Text>
                  </View>
                </View>

                <View style={[styles.confirmDivider, { backgroundColor: dynamicColors.border }]} />

                {/* SECCIÓN: FECHA Y HORA */}
                <View style={styles.summarySection}>
                  <MaterialIcons name="event" size={20} color={COLORS.primary} />
                  <View style={styles.summaryTextContainer}>
                    <Text style={[styles.confirmLabel, { color: dynamicColors.subtext }]}>Fecha y Hora</Text>
                    <Text style={[styles.confirmValue, { color: dynamicColors.text }]}>
                      {new Date(selectedFecha + 'T12:00:00').toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </Text>
                    <Text style={[styles.confirmValue, { color: COLORS.primary }]}>
                      {selectedHora?.inicio.substring(0, 5)} - {selectedHora?.fin.substring(0, 5)}
                    </Text>
                  </View>
                </View>

                {/* SECCIÓN: NOTAS (Solo si existen) */}
                {notas.trim() !== '' && (
                  <>
                    <View style={[styles.confirmDivider, { backgroundColor: dynamicColors.border }]} />
                    <View style={styles.summarySection}>
                      <MaterialIcons name="chat-bubble-outline" size={20} color={COLORS.primary} />
                      <View style={styles.summaryTextContainer}>
                        <Text style={[styles.confirmLabel, { color: dynamicColors.subtext }]}>Notas adicionales</Text>
                        <Text style={[styles.confirmDescription, { color: dynamicColors.text }]}>{notas}</Text>
                      </View>
                    </View>
                  </>
                )}

                {/* SECCIÓN: PRECIO TOTAL */}
                <View style={[styles.priceTag, { backgroundColor: isDarkMode ? '#252525' : '#f0f7f1' }]}>
                  <Text style={[styles.confirmLabel, { color: dynamicColors.text }]}>Total a pagar:</Text>
                  <Text style={styles.confirmPrice}>${selectedServicio?.precio}</Text>
                </View>
              </View>

              
            </View>
          )}
      </ScrollView>

      {/* FOOTER FIX */}
      <View style={[styles.footer, { backgroundColor: dynamicColors.header, borderTopColor: dynamicColors.border }]}>
        {step > 1 && (
          <TouchableOpacity style={[styles.buttonSecondary, { backgroundColor: isDarkMode ? '#333' : '#e0e0e0' }]} onPress={handlePrevStep}>
            <Text style={[styles.buttonSecondaryText, { color: isDarkMode ? '#fff' : '#333' }]}>Atrás</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.buttonPrimary} onPress={step === 5 ? handleConfirmBooking : handleNextStep}>
          <Text style={styles.buttonText}>{step === 5 ? 'Confirmar' : 'Siguiente'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Componente auxiliar para la tabla de confirmación
const ConfirmRow = ({ label, value, color, isBold }: any) => (
  <View style={styles.confirmRow}>
    <Text style={styles.confirmLabel}>{label}:</Text>
    <Text style={[styles.confirmValue, { color, fontWeight: isBold ? '800' : '600' }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyText: { 
    color: 'gray',
    fontSize: 16,
  },
  header: { padding: 20, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  stepIndicator: { fontSize: 13, marginTop: 4 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  stepContainer: { marginBottom: 20 },
  stepTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15 },
  optionCard: {
    flexDirection: 'row', borderRadius: 12, padding: 15,
    marginBottom: 10, borderWidth: 2, alignItems: 'center', gap: 12,
  },
  optionCardSelected: { borderColor: COLORS.primary, backgroundColor: 'rgba(51, 119, 64, 0.1)' },
  optionContent: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '600' },
  optionSubtitle: { fontSize: 13, marginTop: 2 },
  dateSelector: { marginBottom: 20 },
  dateCard: { width: 65, height: 80, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1 },
  dateCardSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dateDayName: { fontSize: 10, fontWeight: 'bold' },
  dateDayNum: { fontSize: 18, fontWeight: '800' },
  timeGrid: { 
  flexDirection: 'row', 
  flexWrap: 'wrap', 
  justifyContent: 'flex-start', // Alinea a la izquierda
  width: '100%',
  gap: 10, 
  marginBottom: 20 
},
  timeSlot: { 
  width: '30%', // Esto garantiza 3 columnas
  paddingVertical: 15, // Más espacio para tocar con el dedo
  borderRadius: 10, 
  borderWidth: 1, 
  alignItems: 'center',
  marginBottom: 5 // Espacio inferior extra
},
  timeSlotSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeSlotDisabled: { opacity: 0.3 },
  timeSlotText: { fontWeight: '700' },
  textWhite: { color: '#fff' },
  textDisabled: { textDecorationLine: 'line-through' },
  textArea: { borderRadius: 12, padding: 12, borderWidth: 1, height: 80, marginTop: 10, textAlignVertical: 'top' },
  confirmationBox: { borderRadius: 12, padding: 15, borderWidth: 1 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  confirmLabel: { fontSize: 14, color: '#888', fontWeight: '600' },
  confirmValue: { fontSize: 14 },
  footer: { flexDirection: 'row', gap: 10, padding: 20, borderTopWidth: 1 },
  buttonPrimary: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, flex: 1, alignItems: 'center' },
  buttonSecondary: { padding: 16, borderRadius: 12, flex: 0.4, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  buttonSecondaryText: { fontSize: 16, fontWeight: '600' },
  summarySection: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 12,
  paddingVertical: 10,
},
summaryTextContainer: {
  flex: 1,
},
priceTag: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 15,
  borderRadius: 12,
  marginTop: 15,
},
confirmDivider: {
  height: 1,
  marginVertical: 8,
},
confirmDescription: {
  fontSize: 13,
  fontStyle: 'italic',
  marginTop: 2,
},
confirmPrice: {
  fontSize: 22,
  fontWeight: '800',
  color: COLORS.primary,
},
disclaimer: {
  fontSize: 12,
  textAlign: 'center',
  marginTop: 20,
  lineHeight: 18,
},
});
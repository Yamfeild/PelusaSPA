import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { citasService, Servicio, Horario, Cita } from '../services/citasService';
import { mascotasService } from '../services/mascotasService';
import { peluquerosService, Peluquero } from '../services/peluquerosService';

interface Pet {
  id: number;
  nombre: string;
  raza: string;
  edad: number;
}

export const BookingScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(1); // 1: Mascota, 2: Servicio, 3: Peluquero, 4: Fecha/Hora, 5: Confirmación
  const [pets, setPets] = useState<Pet[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [peluqueros, setPeluqueros] = useState<Peluquero[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);

  // State del formulario
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [selectedPeluquero, setSelectedPeluquero] = useState<Peluquero | null>(null);
  const [selectedFecha, setSelectedFecha] = useState<string>('');
  const [selectedHora, setSelectedHora] = useState<{ inicio: string; fin: string } | null>(null);
  const [notas, setNotas] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);
  useEffect(() => {
  if (selectedPeluquero && selectedFecha && step === 4) {
    fetchHorariosDisponibles();
  }
  }, [selectedFecha, selectedPeluquero]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [petsData, serviciosData, citasData, peluquerosData] = await Promise.all([
        mascotasService.getMascotas(),
        citasService.getServicios(),
        citasService.getCitas(),
        peluquerosService.getPeluqueros(),
      ]);
      setPets(petsData);
      setServicios(serviciosData.filter(s => s.activo));
      setCitas(citasData);
      setPeluqueros(peluquerosData);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadHorarios = async () => {
    try {
      const data = await citasService.getHorarios();
      setHorarios(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los horarios');
    }
  };

  const fetchHorariosDisponibles = async () => {
    setLoading(true);
    try {
      // 1. Traemos los horarios del peluquero desde el servicio
      const data = await citasService.getHorarios(selectedPeluquero?.id);
      
      // 2. Calculamos el día de la semana de la fecha seleccionada
      // JS: 0 (Dom) - 6 (Sab). Django suele ser 0 (Lun) - 6 (Dom)
      // Ajuste para que 0 sea Lunes:
      const fechaObj = new Date(selectedFecha + 'T00:00:00');
      let dayOfWeek = fechaObj.getDay() - 1; 
      if (dayOfWeek === -1) dayOfWeek = 6; // Domingo

      // 3. Filtramos los horarios que correspondan a ese día
      const horariosFiltrados = data.filter(h => h.dia_semana === dayOfWeek && h.activo);
      
      setHorarios(horariosFiltrados);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedPet) {
      Alert.alert('Error', 'Selecciona una mascota');
      return;
    }
    if (step === 2 && !selectedServicio) {
      Alert.alert('Error', 'Selecciona un servicio');
      return;
    }
    if (step === 3 && !selectedPeluquero) {
      Alert.alert('Error', 'Selecciona un peluquero');
      return;
      
    }
    // CORRECCIÓN: Si pasamos del paso 3 al 4, cargamos los horarios
    if (step === 3) {
      // Si ya hay una fecha seleccionada por defecto, cargamos horarios de una vez
      if (selectedFecha) {
        fetchHorariosDisponibles();
      }
    }
    if (step === 4 && (!selectedFecha || !selectedHora)) {
      Alert.alert('Error', 'Selecciona fecha y hora');
      return;
    }

    // Cargar horarios cuando se va al paso 3 (antes de mostrar peluqueros)
    if (step === 2) {
      loadHorarios();
    }

    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleConfirmBooking = async () => {
    if (!selectedPet || !selectedServicio || !selectedPeluquero || !selectedFecha || !selectedHora) {
      Alert.alert('Error', 'Faltan datos para completar la reserva');
      return;
    }

    setLoading(true);
    try {
      await citasService.createCita({
        mascota: selectedPet.id,
        servicio: selectedServicio.id,
        peluquero_id: selectedPeluquero.id,
        fecha: selectedFecha,
        hora_inicio: selectedHora.inicio,
        hora_fin: selectedHora.fin,
        notas: notas || undefined,
      });

      Alert.alert(
        'Éxito',
        `Cita reservada para ${selectedPet.nombre} el ${selectedFecha} a las ${selectedHora.inicio}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setStep(1);
              setSelectedPet(null);
              setSelectedServicio(null);
              setSelectedPeluquero(null);
              setSelectedFecha('');
              setSelectedHora(null);
              setNotas('');
              loadInitialData();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error al crear cita:', error);
      Alert.alert('Error', error.response?.data?.error || 'No se pudo crear la cita');
    } finally {
      setLoading(false);
    }
  };

  if (loading && step === 1) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reservar Cita</Text>
        <Text style={styles.stepIndicator}>Paso {step} de 5</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* PASO 1: Seleccionar Mascota */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Selecciona tu mascota</Text>
            {pets.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="pets" size={50} color={COLORS.primary} />
                <Text style={styles.emptyText}>No tienes mascotas registradas</Text>
              </View>
            ) : (
              <FlatList
                scrollEnabled={false}
                data={pets}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionCard,
                      selectedPet?.id === item.id && styles.optionCardSelected,
                    ]}
                    onPress={() => setSelectedPet(item)}
                  >
                    <MaterialIcons name="pets" size={24} color={COLORS.primary} />
                    <View style={styles.optionContent}>
                      <Text style={styles.optionTitle}>{item.nombre}</Text>
                      <Text style={styles.optionSubtitle}>{item.raza} • {item.edad} años</Text>
                    </View>
                    {selectedPet?.id === item.id && (
                      <MaterialIcons name="check-circle" size={24} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
              />
            )}
          </View>
        )}

        {/* PASO 2: Seleccionar Servicio */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Selecciona un servicio</Text>
            <FlatList
              scrollEnabled={false}
              data={servicios}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    selectedServicio?.id === item.id && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedServicio(item)}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>{item.nombre}</Text>
                    <Text style={styles.optionSubtitle}>{item.duracion_minutos} min • ${item.precio}</Text>
                    {item.descripcion && <Text style={styles.optionDescription}>{item.descripcion}</Text>}
                  </View>
                  {selectedServicio?.id === item.id && (
                    <MaterialIcons name="check-circle" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        )}

        {/* PASO 3: Seleccionar Peluquero */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Selecciona un peluquero</Text>
            <FlatList
              scrollEnabled={false}
              data={peluqueros}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    selectedPeluquero?.id === item.id && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedPeluquero(item)}
                >
                  <MaterialIcons name="person" size={24} color={COLORS.primary} />
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>{item.nombre}</Text>
                    <Text style={styles.optionSubtitle}>{item.email}</Text>
                  </View>
                  {selectedPeluquero?.id === item.id && (
                    <MaterialIcons name="check-circle" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        )}

        {/* PASO 4: Seleccionar Fecha y Hora */}
        {step === 4 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Selecciona fecha y hora</Text>
          
          {/* Selector de Fecha Horizontal */}
          <Text style={styles.bookingLabel}>Fecha disponible</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.dateSelector}
          >
            {[...Array(7)].map((_, i) => {
              const date = new Date();
              date.setDate(date.getDate() + i);
              const dateString = date.toISOString().split('T')[0];
              const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
              const dayNum = date.getDate();
              const isSelected = selectedFecha === dateString;

              return (
                <TouchableOpacity 
                  key={dateString}
                  style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                  onPress={() => {
                      setSelectedFecha(dateString);
                      setSelectedHora(null); // Resetear hora al cambiar fecha
                  }}
                >
                  <Text style={[styles.dateDayName, isSelected && styles.textWhite]}>{dayName}</Text>
                  <Text style={[styles.dateDayNum, isSelected && styles.textWhite]}>{dayNum}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Selector de Horarios en Grid */}
          <Text style={[styles.bookingLabel, { marginTop: 20 }]}>
            Horarios para {selectedPeluquero?.nombre}
          </Text>
          
          <View style={styles.timeGrid}>
            {horarios.length === 0 ? (
              <Text style={styles.emptyText}>No hay horarios disponibles para esta fecha</Text>
            ) : (
              horarios.map((item, index) => {
                const isSelected = selectedHora?.inicio === item.hora_inicio;
                // USAMOS 'activo' EN LUGAR DE 'disponible'
                const estaDisponible = item.activo; 

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeSlot,
                      isSelected && styles.timeSlotSelected,
                      !estaDisponible && styles.timeSlotDisabled
                    ]}
                    disabled={!estaDisponible}
                    onPress={() => setSelectedHora({ inicio: item.hora_inicio, fin: item.hora_fin })}
                  >
                    <Text style={[
                      styles.timeSlotText, 
                      isSelected && styles.textWhite,
                      !estaDisponible && styles.textDisabled
                    ]}>
                      {item.hora_inicio.substring(0, 5)}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <Text style={[styles.bookingLabel, { marginTop: 25 }]}>Notas (opcional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Ej: Mi mascota es alérgica a ciertos tipos de shampoo..."
            multiline
            numberOfLines={4}
            value={notas}
            onChangeText={setNotas}
          />
        </View>
      )}

        {/* PASO 5: Confirmación */}
        {step === 5 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Confirma tu reserva</Text>
            <View style={styles.confirmationBox}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Mascota:</Text>
                <Text style={styles.confirmValue}>{selectedPet?.nombre} ({selectedPet?.raza})</Text>
              </View>
              <View style={styles.confirmDivider} />
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Servicio:</Text>
                <Text style={styles.confirmValue}>{selectedServicio?.nombre}</Text>
              </View>
              {selectedServicio?.descripcion && (
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Descripción:</Text>
                  <Text style={styles.confirmDescription}>{selectedServicio?.descripcion}</Text>
                </View>
              )}
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Duración:</Text>
                <Text style={styles.confirmValue}>{selectedServicio?.duracion_minutos} minutos</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Precio:</Text>
                <Text style={styles.confirmPrice}>${selectedServicio?.precio}</Text>
              </View>
              <View style={styles.confirmDivider} />
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Peluquero:</Text>
                <View>
                  <Text style={styles.confirmValue}>{selectedPeluquero?.nombre}</Text>
                  <Text style={styles.confirmSubtext}>{selectedPeluquero?.email}</Text>
                </View>
              </View>
              <View style={styles.confirmDivider} />
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Fecha:</Text>
                <Text style={styles.confirmValue}>{selectedFecha}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Hora:</Text>
                <Text style={styles.confirmValue}>{selectedHora?.inicio} - {selectedHora?.fin}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Botones de navegación */}
      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity style={styles.buttonSecondary} onPress={handlePrevStep}>
            <Text style={styles.buttonSecondaryText}>Atrás</Text>
          </TouchableOpacity>
        )}
        {step < 5 ? (
          <TouchableOpacity
            style={[styles.buttonPrimary, step === 1 && { flex: 1 }]}
            onPress={handleNextStep}
          >
            <Text style={styles.buttonText}>Siguiente</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.buttonPrimary, { flex: 1 }]}
            onPress={handleConfirmBooking}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Confirmar Reserva</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faf8',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0e1b12',
  },
  stepIndicator: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 150,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0e1b12',
    marginBottom: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  optionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    gap: 12,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(51, 119, 64, 0.05)',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0e1b12',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  optionDescription: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
    fontStyle: 'italic',
  },
  bookingInfo: {
    marginBottom: 20,
  },
  bookingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0e1b12',
    marginBottom: 8,
  },
  bookingSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 10,
  },
  inputValue: {
    fontSize: 14,
    color: '#666',
  },
  horaSelected: {
    flexDirection: 'row',
    backgroundColor: 'rgba(51, 119, 64, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 10,
  },
  horaSelectedText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  confirmationBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  confirmDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
  },
  confirmLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    flex: 0.35,
  },
  confirmValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0e1b12',
    flex: 0.65,
    textAlign: 'right',
  },
  confirmPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    flex: 0.65,
    textAlign: 'right',
  },
  confirmDescription: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    flex: 0.65,
    textAlign: 'right',
  },
  confirmSubtext: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonSecondary: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },

  dateSelector: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dateCard: {
    width: 65,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    elevation: 4,
  },
  dateDayName: { fontSize: 10, color: '#666', fontWeight: 'bold' },
  dateDayNum: { fontSize: 18, fontWeight: '800', color: '#0e1b12' },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  timeSlot: {
    width: '30%',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeSlotDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#f0f0f0',
  },
  timeSlotText: { fontWeight: '700', color: '#333' },
  textWhite: { color: '#fff' },
  textDisabled: { color: '#bbb' },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    textAlignVertical: 'top',
    height: 80,
  },
});
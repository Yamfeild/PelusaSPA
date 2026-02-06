import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext'; 
import { peluquerosService, Peluquero } from '../services/peluquerosService';
import { notificacionService, Notificacion } from '../services/notificacionesService';
import { mascotasService } from '../services/mascotasService';
import { citasService, Cita } from '../services/citasService';

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [pets, setPets] = useState<any[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('TODOS');
  const [peluqueros, setPeluqueros] = useState<Peluquero[]>([]);
  const PRIORIDAD_ESTADO: Record<string, number> = {
    'PENDIENTE': 1,
    'ACEPTADA': 2,
    'CONFIRMADA': 2,
    'CANCELADA': 3,
    'FINALIZADA': 4,
    'COMPLETADA': 4,
    'TERMINADA': 4
  };

  const dynamicColors = {
  bg: isDarkMode ? '#121212' : '#FFFFFF',
  card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
  text: isDarkMode ? '#FFFFFF' : '#333333', 
  subText: isDarkMode ? '#AAAAAA' : '#888888',
  border: isDarkMode ? '#333333' : '#F0F0F0',
  tabInactive: isDarkMode ? '#333' : '#F0F0F0',
};

const loadData = async () => {
  
  try {
      // Usamos allSettled para que si peluqueros o mascotas fallan, las citas se carguen igual
      const results = await Promise.allSettled([
        mascotasService.getMascotas(),
        citasService.getCitas(),
        peluquerosService.getPeluqueros(),
      ]);

      if (results[0].status === 'fulfilled') setPets(results[0].value);
      if (results[1].status === 'fulfilled') setCitas(results[1].value);
      if (results[2].status === 'fulfilled') setPeluqueros(results[2].value);

    } catch (error) {
      console.error("Error crítico en Home:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
};

  useFocusEffect(
  useCallback(() => {
    loadData();
  }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

const citasFiltradas = citas
  .filter(cita => {
    if (activeFilter === 'TODOS') return true;
    const estadoCita = (cita.estado || '').toUpperCase();
    
    if (activeFilter === 'ACEPTADA') {
      return estadoCita === 'ACEPTADA' || estadoCita === 'CONFIRMADA';
    }
    if (activeFilter === 'FINALIZADA') {
      return estadoCita === 'FINALIZADA' || estadoCita === 'COMPLETADA' || estadoCita === 'TERMINADA';
    }
    return estadoCita === activeFilter;
  })
  .sort((a, b) => {
    // Normalizamos los estados a Mayúsculas
    const estadoA = (a.estado || 'PENDIENTE').toUpperCase();
    const estadoB = (b.estado || 'PENDIENTE').toUpperCase();

    // Accedemos a la prioridad usando el tipado Record definido arriba
    const prioridadA = PRIORIDAD_ESTADO[estadoA] ?? 99;
    const prioridadB = PRIORIDAD_ESTADO[estadoB] ?? 99;

    // 1. Comparar por estado primero
    if (prioridadA !== prioridadB) {
      return prioridadA - prioridadB;
    }

    // 2. Si el estado es el mismo, comparar por fecha/hora
    const fechaA = new Date(`${a.fecha}T${a.hora_inicio}`).getTime();
    const fechaB = new Date(`${b.fecha}T${b.hora_inicio}`).getTime();
    
    return fechaA - fechaB;
  });

  const handleCancelarCita = (cita: Cita) => {
    // VALIDACIÓN DE SEGURIDAD ANTES DE ENVIAR AL BACKEND
    const fechaCita = new Date(`${cita.fecha}T${cita.hora_inicio}`);
    const ahora = new Date();

    // Si la cita es en menos de 2 horas (por ejemplo), avisar al usuario
    const diferenciaHoras = (fechaCita.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    if (diferenciaHoras < 0) {
      Alert.alert("Acción no permitida", "No puedes cancelar una cita que ya ha pasado.");
      return;
    }
  Alert.alert(
    "Confirmar Cancelación",
    `¿Estás seguro de que deseas cancelar la cita de ${cita.mascota_nombre}?`,
    [
      { text: "No", style: "cancel" },
      { 
        text: "Sí, cancelar", 
        style: "destructive", 
        onPress: async () => {
          try {
            // 1. Mostramos indicador de carga
            setLoading(true);
            
            await citasService.cancelarCita(cita.id);
            
            Alert.alert("Éxito", "La cita ha sido procesada correctamente.");

            await loadData(); 
            
          } catch (error: any) {
            // Capturamos el error 403 o cualquier otro detalle del backend
            const serverMsg = error.response?.data?.error || 
                             error.response?.data?.detail || 
                             "No se pudo completar la acción.";
            
            Alert.alert("Error", serverMsg);
            console.error("Error al cancelar:", error.response?.data);
          } finally {
            setLoading(false);
          }
        }
      }
    ]
  );
};

const handleReprogramar = (cita: Cita) => {
  Alert.alert(
    "Reprogramar Cita",
    `¿Deseas cambiar la fecha de la cita para ${cita.mascota_nombre}? \n\nSe mantendrán los detalles del servicio y podrás elegir un nuevo horario.`,
    [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Continuar", 
        onPress: () => {
          navigation.navigate('Reservar', { 
            reprogramarCitaId: cita.id,
            mascotaId: cita.mascota, // ID de la mascota
            servicioId: cita.servicio, // ID del servicio
            peluqueroId: cita.peluquero_id
          });
        } 
      }
    ]
  );
};

const getNombrePeluquero = (id: number) => {
  const p = peluqueros.find(item => item.id === id);
  return p ? p.nombre : `ID: ${id}`; 
};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicColors.bg }]}>
 
      <View style={[styles.header, { borderBottomColor: dynamicColors.border, backgroundColor: dynamicColors.bg }]}>
        <View style={styles.userInfo}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.primary + '20' }]}>
          
          <Text style={styles.avatarInitial}>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          
        </View>
          <View>
            <Text style={styles.welcomeText}>BIENVENIDO</Text>
            <Text style={[styles.userName, { color: dynamicColors.text }]}>
              {user?.username || 'Usuario'}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
            style={[styles.notifButton, { backgroundColor: isDarkMode ? '#2c2c2c' : '#f5f5f5' }]}
            onPress={() => navigation.navigate('Notificaciones')}
          >
            <MaterialIcons name="notifications-none" size={24} color={COLORS.primary} />
            
            {/* ELIMINA TODO ESTE BLOQUE DE ABAJO */}
            {/* unreadCount > 0 && ( ... ) */}
          </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
      >
        
        
        {/* SECCIÓN MASCOTAS */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: dynamicColors.text }]}>Mis Mascotas</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Mascotas')}>
            <Text style={styles.verTodas}>Ver Todas</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {pets.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}> 
              <Text style={[styles.emptyText, { color: dynamicColors.subText }]}>No tienes mascotas registradas</Text>
            </View>
          ) : (
            pets.map((pet) => (
              <View key={pet.id} style={[styles.petCard, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border }]}>
                <View style={[styles.petIconCircle, { borderColor: COLORS.primary + '30' }]}>
                  <MaterialIcons name="pets" size={30} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  {/* AQUÍ ESTABA EL ERROR: Forzamos el color del texto */}
                  <Text style={[styles.petName, { color: dynamicColors.text }]} numberOfLines={1}>
                    {pet.nombre}
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={[styles.statusText, { color: COLORS.primary }]} numberOfLines={1}>{pet.raza}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        
        <View style={[styles.sectionHeader, { marginTop: 25 }]}>
          <Text 
            style={[
              styles.sectionTitle, 
              { color: dynamicColors.text } // Esto hará que pase de negro a blanco
            ]}
          >
            Próximas Citas
          </Text>
        </View>

        {/* TABS DE FILTRADO */}
        <View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.filterTabs}
          >
            {['TODOS', 'PENDIENTE', 'ACEPTADA', 'CANCELADA', 'FINALIZADA'].map((filter) => (
              <TouchableOpacity 
                key={filter} 
                onPress={() => setActiveFilter(filter)}
                style={[
                  styles.filterTabContainer,
                  { 
                    backgroundColor: activeFilter === filter ? COLORS.primary : dynamicColors.tabInactive, 
                    borderColor: dynamicColors.border 
                  },
                  activeFilter === filter && styles.activeTabContainer
                ]}
              >
                <Text style={[
                  styles.filterTabText, 
                  { color: activeFilter === filter ? '#fff' : dynamicColors.subText },
                  activeFilter === filter && styles.activeFilterText
                ]}>
                  {filter === 'ACEPTADA' ? 'CONFIRMADAS' : filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
          {/* ... dentro del ScrollView principal ... */}

          {citasFiltradas.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              {/* Color de icono dinámico */}
              <MaterialIcons name="event-busy" size={50} color={isDarkMode ? '#333' : '#eee'} />
              <Text style={{ color: dynamicColors.subText, marginTop: 10 }}>No hay citas en esta categoría</Text>
            </View>
          ) : (
            citasFiltradas.map((cita) => (
              /* TARJETA CON FONDO DINÁMICO */
              <View 
                key={cita.id} 
                style={[
                  styles.appointmentCard, 
                  { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border }
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.badgeAceptada, { 
                      backgroundColor: cita.estado.toLowerCase() === 'cancelada' ? '#FF4444' 
                      : cita.estado.toLowerCase() === 'pendiente' ? '#FFA500' 
                      : (cita.estado.toLowerCase() === 'finalizada' || cita.estado.toLowerCase() === 'completada') ? '#455A64' 
                      : COLORS.primary 
                  }]}>
                    <Text style={styles.badgeText}>{cita.estado.toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.petLabel, { color: dynamicColors.subText }]}> • {cita.mascota_nombre}</Text>
                </View>
                
                <View style={styles.cardBody}>
                  <View style={{ flex: 1 }}>
                    {/* TÍTULO DEL SERVICIO DINÁMICO */}
                    <Text style={[styles.serviceTitle, { color: dynamicColors.text }]}>{cita.servicio_nombre}</Text>
                    
                    <View style={styles.infoRow}>
                      <MaterialIcons name="calendar-today" size={16} color={COLORS.primary} />
                      <Text style={[styles.infoText, { color: dynamicColors.subText }]}>{cita.fecha} • {cita.hora_inicio.substring(0,5)}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <MaterialIcons name="person" size={16} color={COLORS.primary} />
                      <Text style={[styles.infoText, { color: dynamicColors.subText }]}>
                        {/* Aquí usamos la función de búsqueda */}
                        Peluquero: {getNombrePeluquero(cita.peluquero_id)}
                      </Text>
                    </View>
                  </View>

                  {/* CONTENEDOR DE ICONO CON OPACIDAD DINÁMICA */}
                  <View style={[styles.serviceIconContainer, { backgroundColor: isDarkMode ? '#2c2c2c' : COLORS.primary + '15' }]}>
                    <MaterialIcons 
                      name={cita.servicio_nombre?.toLowerCase().includes('baño') ? 'waves' : 'content-cut'} 
                      size={28} 
                      color={COLORS.primary} 
                    />
                  </View>
                </View>

                {/* FOOTER DE LA TARJETA */}
                {cita.estado.toUpperCase() === 'PENDIENTE' && (
                  <View style={[styles.cardFooter, { borderTopColor: dynamicColors.border }]}>
                    <TouchableOpacity 
                      style={[styles.btnDetalles, { borderColor: COLORS.primary + '40' }]}
                      // Llamamos a la función de confirmación pasando la cita actual
                      onPress={() => handleReprogramar(cita)} 
                    >
                      <MaterialIcons name="event" size={18} color={COLORS.primary} />
                      <Text style={styles.btnTextPrimary}> Reprogramar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.btnDetalles, styles.btnCancelar]} 
                      onPress={() => handleCancelarCita(cita)} 
                    >
                      <MaterialIcons name="cancel" size={18} color="#FF4444" />
                      <Text style={styles.btnTextCancelar}> Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
      </ScrollView>

      
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Reservar')}>
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.fabText}>Reservar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 }, // Quitamos backgroundColor fijo
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1 
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  welcomeText: { fontSize: 10, color: '#888', fontWeight: '700' },
  userName: { fontSize: 18, fontWeight: 'bold' },
  notifButton: { 
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginTop: 20 
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' }, // Color se maneja dinámico
  verTodas: { color: COLORS.primary, fontWeight: 'bold' },
  horizontalScroll: { paddingLeft: 20, marginTop: 15 },
  petCard: { 
    width: 180, 
    padding: 12, 
    borderRadius: 16, 
    borderWidth: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 15, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  petName: { 
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1, 
  },
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 5,
    flex: 1, 
  },
  statusText: { 
    fontSize: 10, 
    color: COLORS.primary, 
    fontWeight: 'bold', 
    marginLeft: 4,
    flexShrink: 1,
  },
  filterTabs: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    marginTop: 20, 
    marginBottom: 5  
  },
  appointmentCard: { 
    margin: 10, 
    padding: 15, 
    borderRadius: 20, 
    borderWidth: 1, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  badgeAceptada: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  petLabel: { marginLeft: 5, fontSize: 12 },
  serviceTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoText: { 
  marginLeft: 8, 
  fontSize: 14 
},
emptyText: { // <--- Asegúrate que este nombre coincida
    color: 'gray',
    fontSize: 16,
  },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between' },
  cardFooter: { 
    flexDirection: 'row', 
    marginTop: 15, 
    borderTopWidth: 1, 
    paddingTop: 15 
  },
  btnDetalles: { 
    flex: 1, 
    height: 45, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: 12, 
    borderWidth: 1, 
    marginRight: 10 
  },
  btnTextPrimary: { color: COLORS.primary, fontWeight: 'bold', marginLeft: 5 },
  fab: { 
    position: 'absolute', 
    bottom: 20, 
    right: 20, 
    backgroundColor: COLORS.primary, 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    borderRadius: 20, 
    alignItems: 'center', 
    elevation: 5 
  },
  fabText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 },
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginRight: 12,
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  petIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginLeft: 10,
  },
  btnCancelar: {
    borderColor: '#FF444433',
    marginRight: 0,
  },
  btnTextCancelar: {
    color: '#FF4444',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  filterTabText: { 
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  activeFilterText: { 
    color: '#fff' 
  },
  filterTabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    marginBottom: 5
  },
  activeTabContainer: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    elevation: 3,
  },
  badgeContainer: {
  position: 'absolute',
  top: 5,
  right: 5,
  backgroundColor: '#FF4444',
  borderRadius: 10,
  width: 18,
  height: 18,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 2,
  borderColor: '#fff', // O usa dynamicColors.bg si quieres que se mezcle
},
badgeTextCount: {
  color: 'white',
  fontSize: 10,
  fontWeight: 'bold',
},
});
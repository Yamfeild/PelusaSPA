import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import { useFocusEffect } from '@react-navigation/native';



import { mascotasService } from '../services/mascotasService';
import { citasService, Cita } from '../services/citasService';

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [pets, setPets] = useState<any[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [petsData, citasData] = await Promise.all([
        mascotasService.getMascotas(),
        citasService.getCitas()
      ]);
      setPets(petsData);
      setCitas(citasData);
    } catch (error) {
      console.error("Error cargando datos del Home:", error);
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

  return (
    <SafeAreaView style={styles.container}>
 
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
          
          <Text style={styles.avatarInitial}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </Text>
          
        </View>
          <View>
            <Text style={styles.welcomeText}>BIENVENIDO</Text>
            <Text style={styles.userName}>{user?.username || 'Usuario'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifButton}>
          <MaterialIcons name="notifications-none" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={COLORS.primary} />}
      >
        
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mis Mascotas</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Mascotas')}>
            <Text style={styles.verTodas}>Ver Todas</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {pets.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}> 
              <Text style={styles.emptyText}>No tienes mascotas registradas</Text>
            </View>
          ) : (
            pets.map((pet) => (
              <View key={pet.id} style={styles.petCard}>
                {/* Contenedor circular con icono en lugar de Image */}
                <View style={styles.petIconCircle}>
                  <MaterialIcons name="pets" size={30} color={COLORS.primary} />
                </View>

                <View>
                  <Text style={styles.petName}>{pet.nombre}</Text>
                  <View style={styles.statusBadge}>
                    <MaterialIcons name="pets" size={12} color={COLORS.primary} />
                    <Text style={styles.statusText}>{pet.raza}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
          </ScrollView>

        
        <Text style={[styles.sectionTitle, { marginHorizontal: 20, marginTop: 25 }]}>Próximas Citas</Text>
        
        {citas.slice(0, 3).map((cita) => (
          <View key={cita.id} style={styles.appointmentCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.badgeAceptada, { backgroundColor: cita.estado === 'pendiente' ? '#FFA500' : COLORS.primary }]}>
                <Text style={styles.badgeText}>{cita.estado.toUpperCase()}</Text>
              </View>
              <Text style={styles.petLabel}> • {cita.mascota_nombre}</Text>
            </View>
            
            {/* AQUÍ ESTÁ EL TRUCO: El icono entra en el cardBody */}
            <View style={styles.cardBody}>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceTitle}>{cita.servicio_nombre}</Text>
                <View style={styles.infoRow}>
                  <MaterialIcons name="calendar-today" size={16} color={COLORS.primary} />
                  <Text style={styles.infoText}>{cita.fecha} • {cita.hora_inicio.substring(0,5)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="person" size={16} color={COLORS.primary} />
                  <Text style={styles.infoText}>Peluquero: {cita.peluquero_id}</Text>
                </View>
              </View>

              {/* Este View ahora es hermano del View con flex:1, por eso sale a la derecha */}
              <View style={styles.serviceIconContainer}>
                <MaterialIcons 
                  name={cita.servicio_nombre.toLowerCase().includes('baño') ? 'waves' : 'content-cut'} 
                  size={28} 
                  color={COLORS.primary} 
                />
              </View>
            </View>

            <View style={styles.cardFooter}>
              <TouchableOpacity style={styles.btnDetalles}>
                <MaterialIcons name="info-outline" size={18} color={COLORS.primary} />
                <Text style={styles.btnTextPrimary}> Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('Reservar')} // Asegúrate que el nombre coincida con tu Stack
      >
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.fabText}>Reservar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 45, height: 45, borderRadius: 22.5, borderWidth: 2, borderColor: COLORS.primary },
  welcomeText: { fontSize: 10, color: '#888', fontWeight: '700' },
  userName: { fontSize: 18, fontWeight: 'bold' },
  notifButton: { width: 45, height: 45, backgroundColor: '#f5f5f5', borderRadius: 22.5, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  verTodas: { color: COLORS.primary, fontWeight: 'bold' },
  horizontalScroll: { paddingLeft: 20, marginTop: 15 },
  petCard: { 
    width: 200, // Un poco más angosta para que se vean varias
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#f0f0f0', 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 15, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  petImageContainer: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  petImageInternal: { width: 62, height: 62, borderRadius: 31 },
  petName: { fontSize: 16, fontWeight: 'bold' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  statusText: { fontSize: 9, color: COLORS.primary, fontWeight: 'bold', marginLeft: 4 },
  filterTabs: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  filterTab: { paddingBottom: 10, marginRight: 20, color: '#aaa', fontWeight: 'bold' },
  activeFilter: { color: COLORS.primary, borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  appointmentCard: { margin: 20, padding: 15, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#f0f0f0', elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  badgeAceptada: { backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  petLabel: { marginLeft: 5, color: '#888', fontSize: 12 },
  serviceTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoText: { marginLeft: 8, color: '#555', fontSize: 14 },
  serviceImage: { width: 80, height: 80, borderRadius: 12 },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between' },
  cardFooter: { flexDirection: 'row', marginTop: 15, borderTopWidth: 1, borderTopColor: '#f9f9f9', paddingTop: 15 },
  btnDetalles: { flex: 1, height: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#33774033', marginRight: 10 },
  btnReagendar: { flex: 1, height: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: COLORS.primary },
  btnTextPrimary: { color: COLORS.primary, fontWeight: 'bold', marginLeft: 5 },
  btnTextWhite: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: COLORS.primary, flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 20, alignItems: 'center', elevation: 5 },
  fabText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 },
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: COLORS.primary + '20', 
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginRight: 12, // Espacio entre círculo y texto de bienvenida
  },
  avatarInitial: {
    fontSize: 20, // Bajamos de 30 a 20 para que quepa bien
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  petIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '15', // Verde muy clarito
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15, // Espacio con el nombre de la mascota
    borderWidth: 1,
    borderColor: COLORS.primary + '30', // Borde sutil
  },
  serviceIconContainer: {
  width: 120, // Lo bajé un poco de 60 para que no sea tan grande
  height: 80,
  borderRadius: 30,
  backgroundColor: COLORS.primary + '15',
  justifyContent: 'center',
  alignItems: 'center',
  alignSelf: 'center', // <--- Importante para que se centre verticalmente con el texto
  marginLeft: 10,
  },
});
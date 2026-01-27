import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
// Importamos SafeAreaView de la librería recomendada para evitar el WARN
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

export const HomeScreen = () => {
  const { user } = useAuth(); // Usamos los datos reales del login

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/150' }} 
            style={styles.avatar} 
          />
          <View>
            <Text style={styles.welcomeText}>BIENVENIDO,</Text>
            {/* Cambiamos Sarah Jenkins por el nombre real del usuario */}
            <Text style={styles.userName}>{user?.username || 'Usuario'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifButton}>
          <MaterialIcons name="notifications-none" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* SECCIÓN MIS MASCOTAS */}
        <View style={styles.sectionHeader}>
          {/* CAMBIADO: h3 por Text */}
          <Text style={styles.sectionTitle}>Mis Mascotas</Text>
          <TouchableOpacity>
            <Text style={styles.verTodas}>Ver Todas</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          <View style={styles.petCard}>
            <View style={styles.petImageContainer}>
               <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.petImageInternal} />
            </View>
            <View>
              <Text style={styles.petName}>Buddy</Text>
              <View style={styles.statusBadge}>
                <MaterialIcons name="check-circle" size={12} color={COLORS.primary} />
                <Text style={styles.statusText}>LISTO PARA RECOGIDA</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* SECCIÓN CITAS */}
        <Text style={[styles.sectionTitle, { marginHorizontal: 20, marginTop: 25 }]}>Citas</Text>
        
        <View style={styles.filterTabs}>
          <Text style={styles.filterTab}>Registradas</Text>
          <Text style={[styles.filterTab, styles.activeFilter]}>Aceptadas</Text>
          <Text style={styles.filterTab}>Canceladas</Text>
        </View>

        {/* CARD DE CITA */}
        <View style={styles.appointmentCard}>
          <View style={styles.cardHeader}>
            <View style={styles.badgeAceptada}>
              <Text style={styles.badgeText}>ACEPTADA</Text>
            </View>
            {/* CAMBIADO: El punto de la lista debe estar dentro de un Text */}
            <Text style={styles.petLabel}> • Buddy</Text>
          </View>
          
          <View style={styles.cardBody}>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>Corte Completo & Spa</Text>
              <View style={styles.infoRow}>
                <MaterialIcons name="calendar-today" size={16} color={COLORS.primary} />
                <Text style={styles.infoText}>24 Oct, 2023 • 10:00 AM</Text>
              </View>
            </View>
            <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.serviceImage} />
          </View>

          <View style={styles.cardFooter}>
            <TouchableOpacity style={styles.btnDetalles}>
              <MaterialIcons name="info-outline" size={18} color={COLORS.primary} />
              <Text style={styles.btnTextPrimary}> Detalles</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnReagendar}>
              <MaterialIcons name="event-repeat" size={18} color="#fff" />
              <Text style={styles.btnTextWhite}> Reagendar</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* BOTÓN FLOTANTE RESERVAR */}
      <TouchableOpacity style={styles.fab}>
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.fabText}>Reservar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// ... (Los estilos se mantienen igual que antes, solo asegúrate de borrar ringColor)
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
  petCard: { width: 260, backgroundColor: '#fff', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#f0f0f0', flexDirection: 'row', alignItems: 'center', marginRight: 15, elevation: 2 },
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
  fabText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 }
});
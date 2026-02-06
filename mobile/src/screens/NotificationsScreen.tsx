import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { notificacionService, Notificacion } from '../services/notificacionesService';
import { useNavigation } from '@react-navigation/native'; 
import { citasService, Cita } from '../services/citasService';

export const NotificationsScreen = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();

  const theme = {
    bg: isDarkMode ? '#121212' : '#fff',
    text: isDarkMode ? '#fff' : '#0d1b17',
    subText: isDarkMode ? '#aaa' : '#888',
    card: isDarkMode ? '#1e1e1e' : '#fff',
    unread: isDarkMode ? '#1a2421' : '#f0f9f6', // Usaremos este para las próximas
    border: isDarkMode ? '#333' : '#f0f0f0'
  };

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificacionesFake, setNotificacionesFake] = useState<any[]>([]);

  // 1. Unificamos la función de carga
  const cargarDatos = async () => {
    try {
      const citas = await citasService.getCitas();
      const ahora = new Date();
      const limite24h = new Date(ahora.getTime() + (24 * 60 * 60 * 1000));

      const proximas = citas.filter(cita => {
        const fechaCita = new Date(`${cita.fecha}T${cita.hora_inicio}`);
        return fechaCita >= ahora && fechaCita <= limite24h;
      });

      const formatoNotif = proximas.map(cita => ({
        id: cita.id,
        mensaje: `Recordatorio: Tienes una cita de ${cita.servicio_nombre} para tu mascota ${cita.mascota_nombre}.`,
        fecha: cita.fecha,
        hora: cita.hora_inicio,
        mascota: cita.mascota_nombre,
        tipo: 'RECORDATORIO',
        leida: false // Al ser locales, siempre se verán como nuevas al entrar
      }));

      setNotificacionesFake(formatoNotif);
    } catch (error) {
      console.error("Error al generar notificaciones locales:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color="#4c9a80" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.bg }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Notificaciones</Text>
        </View>
        
        {/* Quitamos la llamada al servicio que daba 403 y solo refrescamos */}
        <TouchableOpacity onPress={cargarDatos}>
          <MaterialIcons name="refresh" size={20} color="#4c9a80" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notificacionesFake} // USAR EL NUEVO ESTADO
        style={{ backgroundColor: theme.bg }}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View // Quitamos el TouchableOpacity porque no hay endpoint para marcar como leída
            style={[
              styles.card, 
              { 
                backgroundColor: theme.unread, // Resaltamos porque son próximas
                borderBottomColor: theme.border 
              }
            ]}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons name="alarm" size={24} color="#4c9a80" />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.mensaje, { color: theme.text, fontWeight: 'bold' }]}>
                {item.mensaje}
              </Text>
              <Text style={[styles.fecha, { color: theme.subText }]}>
                {item.mascota} • {item.fecha} a las {item.hora.substring(0,5)}
              </Text>
            </View>
            <View style={styles.dot} />
          </View>
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); cargarDatos(); }} 
            tintColor={theme.text} 
            colors={['#4c9a80']}
          />
        }
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: theme.bg }]}>
            <MaterialIcons name="notifications-none" size={64} color={isDarkMode ? '#444' : '#ccc'} />
            <Text style={[styles.emptyText, { color: theme.subText, textAlign: 'center', paddingHorizontal: 40 }]}>
               No tienes citas programadas para las próximas 24 horas.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
    padding: 5,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  clearAll: { color: '#4c9a80', fontWeight: '600', fontSize: 13 },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center'
  },
  iconContainer: { marginRight: 15 },
  textContainer: { flex: 1 },
  mensaje: { fontSize: 15, lineHeight: 20 },
  unreadText: { fontWeight: 'bold' },
  fecha: { fontSize: 12, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4c9a80', marginLeft: 10 },
  emptyContainer: { alignItems: 'center', marginTop: 100, flex: 1 },
  emptyText: { marginTop: 10, fontSize: 16 }
});
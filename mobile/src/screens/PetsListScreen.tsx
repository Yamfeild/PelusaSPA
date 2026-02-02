import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { mascotasService } from '../services/mascotasService';
import { useTheme } from '../context/ThemeContext'; // Importamos el tema

interface Pet {
  id: number;
  nombre: string;
  raza: string;
  edad: number;
}

export const PetsListScreen = ({ navigation }: any) => {
  const { isDarkMode } = useTheme(); // Obtenemos el estado del modo oscuro
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Paleta de colores dinámica
  const dynamicColors = {
    bg: isDarkMode ? '#121212' : '#f8faf8',
    card: isDarkMode ? '#1e1e1e' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#0e1b12',
    subText: isDarkMode ? '#AAAAAA' : '#666666',
    border: isDarkMode ? '#333333' : '#e0e0e0',
    headerBg: isDarkMode ? '#1e1e1e' : '#FFFFFF',
  };

  const loadPets = async () => {
    if (!refreshing) setLoading(true);
    try {
      const data = await mascotasService.getMascotas();
      setPets(data);
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
      Alert.alert("Error", "No se pudieron cargar las mascotas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadPets();
  };

  const handleDeletePet = async (petId: number) => {
    Alert.alert(
      "Eliminar mascota",
      "¿Estás seguro de que deseas eliminar esta mascota?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await mascotasService.deleteMascota(petId);
              setPets(pets.filter(p => p.id !== petId));
              Alert.alert("Éxito", "Mascota eliminada");
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar la mascota");
            }
          },
        },
      ]
    );
  };

  const renderPetItem = ({ item }: { item: Pet }) => (
    <View style={[styles.petCard, { backgroundColor: dynamicColors.card, borderColor: dynamicColors.border }]}>
      <View style={[styles.petIconCircle, { backgroundColor: COLORS.primary + '15' }]}>
        <MaterialIcons name="pets" size={28} color={COLORS.primary} />
      </View>

      <View style={styles.petDetailsMain}>
        <Text style={[styles.petName, { color: dynamicColors.text }]}>{item.nombre}</Text>
        <View style={styles.breedRow}>
          <Text style={styles.petBreed}>{item.raza}</Text>
          <Text style={[styles.dotSeparator, { color: dynamicColors.subText }]}> • </Text>
          <Text style={[styles.petAge, { color: dynamicColors.subText }]}>{item.edad} años</Text>
        </View>
      </View>

      <View style={styles.actionColumn}>
          <TouchableOpacity 
          style={{ padding: 8 }} // Sin fondo, solo espacio para tocar
          onPress={() => handleDeletePet(item.id)}
        >
          <MaterialIcons 
            name="delete-outline" 
            size={22} 
            color={isDarkMode ? '#FF6B6B' : '#ef4444'} // Un rojo más suave en modo oscuro
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.editButtonSmall, { padding: 8  }]}
          onPress={() => navigation.navigate('EditPet', {
            petId: item.id,
            petName: item.nombre,
            petBreed: item.raza,
            petAge: item.edad
          })}
        >
          <MaterialIcons name="edit" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicColors.bg }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: dynamicColors.headerBg, borderBottomColor: dynamicColors.border }]}>
        <Text style={[styles.headerTitle, { color: dynamicColors.text }]}>Mis Mascotas</Text>
        <TouchableOpacity onPress={onRefresh}>
          <MaterialIcons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={pets}
          renderItem={renderPetItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="pets" size={80} color={isDarkMode ? '#333' : '#eee'} />
              <Text style={[styles.emptyText, { color: dynamicColors.subText }]}>No tienes mascotas registradas</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('CreatePet')}
              >
                <MaterialIcons name="add" size={24} color="#fff" />
                <Text style={styles.addButtonText}>Añadir Mascota</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {pets.length > 0 && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('CreatePet')}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.fabText}>Añadir Nueva</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 20, 
    alignItems: 'center', 
    borderBottomWidth: 1 
  },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  listContent: { padding: 20, paddingBottom: 120 },
  petCard: { 
    borderRadius: 20, 
    padding: 15, 
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  petName: { fontSize: 18, fontWeight: 'bold' },
  petBreed: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  petAge: { fontSize: 14 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 100,
    paddingHorizontal: 20 
  },
  emptyText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  addButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8
  },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  fab: { 
    position: 'absolute', 
    bottom: 30, 
    alignSelf: 'center',
    flexDirection: 'row', 
    backgroundColor: COLORS.primary, 
    paddingHorizontal: 25, 
    paddingVertical: 15, 
    borderRadius: 30,
    alignItems: 'center',
    gap: 8,
    elevation: 5
  },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  petIconCircle: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', marginRight: 15,
  },
  petDetailsMain: { flex: 1, justifyContent: 'center' },
  breedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dotSeparator: { marginHorizontal: 4 },
  actionColumn: { alignItems: 'center', gap: 10 },
  editButtonSmall: { padding: 8, borderRadius: 10 },
  deleteButtonSmall: { padding: 8, backgroundColor: '#fee2e2', borderRadius: 10 },
});
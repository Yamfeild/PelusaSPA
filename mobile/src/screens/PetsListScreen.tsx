import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { mascotasService } from '../services/mascotasService';

interface Pet {
  id: number;
  nombre: string;
  raza: string;
  edad: number;
}

export const PetsListScreen = ({ navigation }: any) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadPets();
    }, [])
  );

  const loadPets = async () => {
    setLoading(true);
    try {
      const data = await mascotasService.getMascotas();
      setPets(data);
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
      Alert.alert("Error", "No se pudieron cargar las mascotas");
    } finally {
      setLoading(false);
    }
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
    <View style={styles.petCard}>
      {/* 1. Icono circular a la izquierda */}
      <View style={styles.petIconCircle}>
        <MaterialIcons name="pets" size={28} color={COLORS.primary} />
      </View>

      {/* 2. Información central (nombre, raza, edad) */}
      <View style={styles.petDetailsMain}>
        <Text style={styles.petName}>{item.nombre}</Text>
        <View style={styles.breedRow}>
          <Text style={styles.petBreed}>{item.raza}</Text>
          <Text style={styles.dotSeparator}> • </Text>
          <Text style={styles.petAge}>{item.edad} años</Text>
        </View>
      </View>

      {/* 3. Botones de acción a la derecha */}
      <View style={styles.actionColumn}>
        <TouchableOpacity 
          style={styles.deleteButtonSmall}
          onPress={() => handleDeletePet(item.id)}
        >
          <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.editButtonSmall}
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Mascotas</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => loadPets()}>
            <MaterialIcons name="refresh" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : pets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="pets" size={60} color={COLORS.primary} />
          <Text style={styles.emptyText}>No tienes mascotas registradas</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('CreatePet')}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Añadir Mascota</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={pets}
            renderItem={renderPetItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
          />
          <TouchableOpacity 
            style={styles.fab}
            onPress={() => navigation.navigate('CreatePet')}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
            <Text style={styles.fabText}>Añadir Nueva Mascota</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8faf8' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 20, 
    alignItems: 'center', 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#0e1b12' 
  },
  headerIcons: { 
    flexDirection: 'row' 
  },
  listContent: { 
    padding: 20, 
    paddingBottom: 120 
  },
  petCard: { 
    backgroundColor: '#fff', 
    borderRadius: 20, // Más redondeado como el Home
    padding: 15, 
    marginBottom: 15,
    flexDirection: 'row', // Alineación horizontal
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f2f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  petInfo: { 
    gap: 10
  },
  petDetails: {
    gap: 4
  },
  petName: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1a1a1a' 
  },
  petBreed: { 
    fontSize: 14, 
    color: COLORS.primary, 
    fontWeight: '600' 
  },
  petAge: {
    fontSize: 14,
    color: '#777',
  },
  actionButtons: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 8
  },
  editButton: { 
    flexDirection: 'row', 
    backgroundColor: '#337740', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8, 
    alignItems: 'center',
    gap: 5
  },
  editButtonText: { 
    color: '#fff', 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  deleteButton: { 
    padding: 6,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ef4444'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#337740',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  fab: { 
    position: 'absolute', 
    bottom: 30, 
    alignSelf: 'center',
    flexDirection: 'row', 
    backgroundColor: '#337740', 
    paddingHorizontal: 25, 
    paddingVertical: 15, 
    borderRadius: 30,
    alignItems: 'center',
    gap: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  fabText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16 
  },
  petIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary + '15', // Fondo verde suave
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  petDetailsMain: {
    flex: 1, // Ocupa todo el espacio central
    justifyContent: 'center',
  },
  breedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dotSeparator: {
    color: '#ccc',
    marginHorizontal: 4,
  },
  actionColumn: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  editButtonSmall: {
    padding: 8,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 10,
  },
  deleteButtonSmall: {
    padding: 8,
    backgroundColor: '#fee2e2', // Fondo rojo suave
    borderRadius: 10,
  },
});
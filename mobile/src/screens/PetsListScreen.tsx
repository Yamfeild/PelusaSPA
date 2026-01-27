import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// Datos de prueba basados en tu captura
const MOCK_PETS = [
  { id: '1', nombre: 'Bella', raza: 'Golden Retriever', image: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_3004.jpg' },
  { id: '2', nombre: 'Max', raza: 'Caniche Estándar', image: 'https://images.dog.ceo/breeds/poodle-standard/n02113799_2280.jpg' },
];

export const PetsListScreen = ({ navigation }: any) => {
  const renderPetItem = ({ item }: any) => (
    <View style={styles.petCard}>
      <View style={styles.petInfo}>
        <View>
          <Text style={styles.petName}>{item.nombre}</Text>
          <Text style={styles.petBreed}>{item.raza}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton}>
            <MaterialIcons name="edit" size={18} color="#fff" />
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton}>
            <MaterialIcons name="delete-outline" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </View>
      <Image source={{ uri: item.image }} style={styles.petImage} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Mascotas</Text>
        <View style={styles.headerIcons}>
          <MaterialIcons name="notifications-none" size={24} color={COLORS.textMain} />
          <MaterialIcons name="settings" size={24} color={COLORS.textMain} style={{ marginLeft: 15 }} />
        </View>
      </View>

      <FlatList
        data={MOCK_PETS}
        renderItem={renderPetItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePet')}
      >
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.fabText}>Añadir Nueva Mascota</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faf8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0e1b12' },
  headerIcons: { flexDirection: 'row' },
  listContent: { padding: 20, paddingBottom: 100 },
  petCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 15, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(51, 119, 64, 0.1)',
    elevation: 2
  },
  petInfo: { flex: 1, justifyContent: 'space-between' },
  petName: { fontSize: 18, fontWeight: 'bold', color: '#0e1b12' },
  petBreed: { fontSize: 14, color: '#337740', fontWeight: '600' },
  actionButtons: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  editButton: { 
    flexDirection: 'row', 
    backgroundColor: '#337740', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  editButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 5 },
  deleteButton: { marginLeft: 10, padding: 5 },
  petImage: { width: 90, height: 90, borderRadius: 15 },
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
    elevation: 5
  },
  fabText: { color: '#fff', fontWeight: 'bold', marginLeft: 10, fontSize: 16 }
});
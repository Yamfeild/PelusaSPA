import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { mascotasService } from '../services/mascotasService';

export const CreatePetScreen = ({ navigation }: any) => {
  const [petData, setPetData] = useState({
    nombre: '',
    raza: 'Golden Retriever',
    edad: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    
    if (!petData.nombre.trim()) {
      Alert.alert("Error", "El nombre de la mascota es requerido");
      return;
    }

    if (!petData.raza.trim()) {
      Alert.alert("Error", "La raza es requerida");
      return;
    }

    if (!petData.edad.trim()) {
      Alert.alert("Error", "La edad es requerida");
      return;
    }

    setLoading(true);

    try {
      await mascotasService.createMascota({
        nombre: petData.nombre,
        raza: petData.raza,
        edad: parseInt(petData.edad) || 0,
      });

      Alert.alert("Éxito", `${petData.nombre} ha sido registrado correctamente.`, [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Error al crear mascota:', error);
      Alert.alert("Error", error.response?.data?.error || "No se pudo registrar la mascota");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#337740" />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Mascota</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.photoSection}>
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="pets" size={50} color="rgba(51, 119, 64, 0.2)" />
            <TouchableOpacity style={styles.addPhotoBadge}>
              <MaterialIcons name="add-a-photo" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.photoTitle}>Perfil de {petData.nombre || '...'}</Text>
          <Text style={styles.photoSubtitle}>Toca para cambiar foto</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nombre *</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Nombre de la mascota" 
            value={petData.nombre}
            onChangeText={(val) => setPetData({...petData, nombre: val})}
            editable={!loading}
          />

          <Text style={styles.label}>Raza *</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Raza de la mascota"
            value={petData.raza}
            onChangeText={(val) => setPetData({...petData, raza: val})}
            editable={!loading}
          />

          <Text style={styles.label}>Edad (años) *</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Edad en años" 
            keyboardType="numeric"
            value={petData.edad}
            onChangeText={(val) => setPetData({...petData, edad: val})}
            editable={!loading}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Mascota</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0' 
  },
  backButton: { flexDirection: 'row', alignItems: 'center', position: 'absolute', left: 20, zIndex: 1 },
  backText: { color: '#337740', fontSize: 16, marginLeft: -5 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  photoSection: { alignItems: 'center', marginBottom: 30 },
  imagePlaceholder: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: 'rgba(51, 119, 64, 0.05)', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(51, 119, 64, 0.1)'
  },
  addPhotoBadge: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    backgroundColor: '#337740', 
    padding: 8, 
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff'
  },
  photoTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 15 },
  photoSubtitle: { color: '#337740', fontSize: 14, fontWeight: '500' },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, color: '#1a2e1f' },
  input: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#d0e7d7', 
    borderRadius: 15, 
    padding: 15, 
    fontSize: 16, 
    marginBottom: 20 
  },
  inputContainer: { flexDirection: 'row', alignItems: 'center' },
  selectIcon: { position: 'absolute', right: 15, top: 15 },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveButton: { 
    backgroundColor: '#337740', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 10,
    shadowColor: '#337740',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
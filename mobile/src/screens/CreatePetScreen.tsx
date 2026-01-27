import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export const CreatePetScreen = ({ navigation }: any) => {
  const [petData, setPetData] = useState({
    nombre: '',
    raza: 'Golden Retriever',
    edad: '',
    notas: ''
  });

  const handleSave = () => {
    // Aquí conectarás con tu API de Django más tarde
    Alert.alert("Éxito", `${petData.nombre} ha sido registrado.`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#337740" />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles de la Mascota</Text>
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
          <Text style={styles.label}>Nombre</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Nombre de la mascota" 
            onChangeText={(val) => setPetData({...petData, nombre: val})}
          />

          <Text style={styles.label}>Raza</Text>
          <View style={styles.inputContainer}>
             <TextInput 
              style={[styles.input, { flex: 1 }]} 
              value={petData.raza}
              editable={false}
            />
            <MaterialIcons name="unfold-more" size={24} color="#337740" style={styles.selectIcon} />
          </View>

          <Text style={styles.label}>Edad</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Edad en años" 
            keyboardType="numeric"
            onChangeText={(val) => setPetData({...petData, edad: val})}
          />

          <Text style={styles.label}>Notas médicas</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="Mencione alergias o condiciones..." 
            multiline
            numberOfLines={4}
            onChangeText={(val) => setPetData({...petData, notas: val})}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
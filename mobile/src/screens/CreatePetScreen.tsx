import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { mascotasService } from '../services/mascotasService';
import { useTheme } from '../context/ThemeContext'; // Importar el tema

export const CreatePetScreen = ({ navigation }: any) => {
  const { isDarkMode } = useTheme();
  const [petData, setPetData] = useState({
    nombre: '',
    raza: '',
    edad: '',
  });
  const [loading, setLoading] = useState(false);

  // Colores dinámicos para el formulario
  const dynamicColors = {
    bg: isDarkMode ? '#121212' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1a2e1f',
    inputBg: isDarkMode ? '#1e1e1e' : '#FFFFFF',
    inputBorder: isDarkMode ? '#333333' : '#d0e7d7',
    subText: isDarkMode ? '#AAAAAA' : '#666666',
    placeholder: isDarkMode ? '#555555' : '#999999',
    headerBorder: isDarkMode ? '#222222' : '#f0f0f0',
  };

  const handleSave = async () => {
    if (!petData.nombre.trim() || !petData.raza.trim() || !petData.edad.trim()) {
      Alert.alert("Error", "Todos los campos marcados con * son obligatorios");
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
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.error || "No se pudo registrar la mascota");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicColors.bg }]} edges={['top']}>
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: dynamicColors.headerBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={20} color={COLORS.primary} />
          <Text style={[styles.backText, { color: COLORS.primary }]}>Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: dynamicColors.text }]}>Nueva Mascota</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* SECCIÓN FOTO PERFIL */}
        <View style={styles.photoSection}>
          <View style={[styles.imagePlaceholder, { 
            backgroundColor: isDarkMode ? '#1e1e1e' : 'rgba(51, 119, 64, 0.05)',
            borderColor: isDarkMode ? '#333' : 'rgba(51, 119, 64, 0.1)'
          }]}>
            <MaterialIcons name="pets" size={50} color={isDarkMode ? '#333' : 'rgba(51, 119, 64, 0.2)'} />
            <TouchableOpacity style={styles.addPhotoBadge}>
              <MaterialIcons name="add-a-photo" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.photoTitle, { color: dynamicColors.text }]}>
            Perfil de {petData.nombre || '...'}
          </Text>
          <Text style={[styles.photoSubtitle, { color: COLORS.primary }]}>Toca para cambiar foto</Text>
        </View>

        {/* FORMULARIO */}
        <View style={styles.form}>
          <Text style={[styles.label, { color: dynamicColors.text }]}>Nombre *</Text>
          <TextInput 
            style={[styles.input, { 
              backgroundColor: dynamicColors.inputBg, 
              borderColor: dynamicColors.inputBorder,
              color: dynamicColors.text 
            }]} 
            placeholder="Nombre de la mascota" 
            placeholderTextColor={dynamicColors.placeholder}
            value={petData.nombre}
            onChangeText={(val) => setPetData({...petData, nombre: val})}
            editable={!loading}
          />

          <Text style={[styles.label, { color: dynamicColors.text }]}>Raza *</Text>
          <TextInput 
            style={[styles.input, { 
              backgroundColor: dynamicColors.inputBg, 
              borderColor: dynamicColors.inputBorder,
              color: dynamicColors.text 
            }]} 
            placeholder="Raza de la mascota"
            placeholderTextColor={dynamicColors.placeholder}
            value={petData.raza}
            onChangeText={(val) => setPetData({...petData, raza: val})}
            editable={!loading}
          />

          <Text style={[styles.label, { color: dynamicColors.text }]}>Edad (años) *</Text>
          <TextInput 
            style={[styles.input, { 
              backgroundColor: dynamicColors.inputBg, 
              borderColor: dynamicColors.inputBorder,
              color: dynamicColors.text 
            }]} 
            placeholder="Edad en años" 
            placeholderTextColor={dynamicColors.placeholder}
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
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1, 
    height: 70 
  },
  backButton: { flexDirection: 'row', alignItems: 'center', position: 'absolute', left: 20, zIndex: 1 },
  backText: { fontSize: 16, marginLeft: -5, fontWeight: '500' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  photoSection: { alignItems: 'center', marginBottom: 30 },
  imagePlaceholder: { 
    width: 120, height: 120, borderRadius: 60, 
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 4,
  },
  addPhotoBadge: { 
    position: 'absolute', bottom: 0, right: 0, 
    backgroundColor: COLORS.primary, padding: 8, 
    borderRadius: 20, borderWidth: 2, borderColor: '#fff'
  },
  photoTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 15 },
  photoSubtitle: { fontSize: 14, fontWeight: '500' },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  input: { 
    borderWidth: 1, 
    borderRadius: 15, 
    padding: 15, 
    fontSize: 16, 
    marginBottom: 20 
  },
  saveButton: { 
    backgroundColor: COLORS.primary, 
    padding: 18, borderRadius: 15, 
    alignItems: 'center', marginTop: 10,
    elevation: 4, shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 5
  },
  saveButtonDisabled: { backgroundColor: '#9ca3af', opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { mascotasService } from '../services/mascotasService';
import { useTheme } from '../context/ThemeContext'; // Importamos el tema

interface PetData {
  nombre: string;
  raza: string;
  edad: string;
}

export const EditPetScreen = ({ navigation, route }: any) => {
  const { isDarkMode } = useTheme();
  const { petId, petName, petBreed, petAge } = route.params;
  
  const [petData, setPetData] = useState<PetData>({
    nombre: petName || '',
    raza: petBreed || '',
    edad: petAge?.toString() || '',
  });
  const [loading, setLoading] = useState(false);

  // Paleta dinámica para edición
  const dynamicColors = {
    bg: isDarkMode ? '#121212' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#0e1b12',
    inputBg: isDarkMode ? '#1e1e1e' : '#FFFFFF',
    inputBorder: isDarkMode ? '#333333' : '#d0e7d7',
    placeholder: isDarkMode ? '#555555' : '#999999',
    headerBorder: isDarkMode ? '#222222' : '#e0e0e0',
  };

  const validateData = () => {
    const { nombre, raza, edad } = petData;
    
    if (!nombre.trim() || !raza.trim() || !edad.trim()) {
      Alert.alert("Campos incompletos", "Por favor rellena todos los campos.");
      return false;
    }

    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(nombre)) {
      Alert.alert("Nombre no válido", "El nombre solo debe contener letras.");
      return false;
    }

    const edadNum = parseInt(edad);
    if (isNaN(edadNum) || edadNum < 0 || edadNum > 30) {
      Alert.alert("Edad no válida", "La edad debe estar entre 0 y 30 años.");
      return false;
    }

    return true;
  };

const handleSave = async () => {
    if (!validateData()) return;

    setLoading(true);
    try {
      await mascotasService.updateMascota(petId, {
        nombre: petData.nombre.trim(),
        raza: petData.raza.trim(),
        edad: parseInt(petData.edad),
      });

      Alert.alert("¡Hecho!", "La información se ha actualizado correctamente.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const serverError = error.response?.data?.error || "No se pudo actualizar la mascota";
      Alert.alert("Error", serverError);
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
        <Text style={[styles.headerTitle, { color: dynamicColors.text }]}>Editar Mascota</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* AVATAR SECTION */}
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
            {petData.nombre || 'Sin nombre'}
          </Text>
          <Text style={[styles.photoSubtitle, { color: COLORS.primary }]}>Editar foto de perfil</Text>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          <Text style={[styles.label, { color: dynamicColors.text }]}>Nombre *</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: dynamicColors.inputBg, borderColor: dynamicColors.inputBorder, color: dynamicColors.text }]} 
            autoCapitalize="words"
            maxLength={20}
            value={petData.nombre}
            onChangeText={(val) => setPetData({...petData, nombre: val})}
            editable={!loading}
          />

          <Text style={[styles.label, { color: dynamicColors.text }]}>Raza *</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: dynamicColors.inputBg, borderColor: dynamicColors.inputBorder, color: dynamicColors.text }]} 
            value={petData.raza}
            onChangeText={(val) => {
              // RESTRICCIÓN: Solo letras en Raza
              const soloLetras = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
              setPetData({...petData, raza: soloLetras});
            }}
            editable={!loading}
          />

          <Text style={[styles.label, { color: dynamicColors.text }]}>Edad (años) *</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: dynamicColors.inputBg, borderColor: dynamicColors.inputBorder, color: dynamicColors.text }]} 
            keyboardType="numeric"
            maxLength={2}
            value={petData.edad}
            onChangeText={(val) => {
              // RESTRICCIÓN: Solo números y máximo 30
              const num = val.replace(/[^0-9]/g, '');
              if (parseInt(num) > 30) {
                setPetData({...petData, edad: '30'});
              } else {
                setPetData({...petData, edad: num});
              }
            }}
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
            <Text style={styles.saveButtonText}>Actualizar Datos</Text>
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
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 16, fontWeight: '600', marginLeft: 5 },
  headerTitle: { fontSize: 19, fontWeight: '700', marginLeft: 15 },
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
    borderWidth: 1, borderRadius: 15, 
    padding: 15, fontSize: 16, marginBottom: 20 
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
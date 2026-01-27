import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, ScrollView, Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { api } from '../api/client';

export const RegisterScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState({
    username: '',
    correo: '',
    clave: '',
    clave_confirmacion: '',
    nombre: '',
    apellido: '',
    fecha_nacimiento: '2000-01-01', 
    telefono: '',
    identificacion: '',
    rol: 'CLIENTE', 
    direccion: '',
  });

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
    if (formData.clave !== formData.clave_confirmacion) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await api.post('/api/auth/registro/', formData);
      if (response.status === 201 || response.status === 200) {
        Alert.alert("¡Bienvenido!", "Registro exitoso.");
        navigation.navigate('Login');
      }
    } catch (error: any) {
      console.error("Detalle del error:", error.response?.data);
      Alert.alert("Error", "No se pudo registrar. Revisa que los datos sean únicos.");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 10 }}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>

        <Text style={styles.title}>Registro</Text>
        <Text style={styles.subtitle}>Completa todos los campos obligatorios</Text>

        {/* --- DATOS DE CUENTA --- */}
        <Text style={styles.label}>Nombre de Usuario *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="ej: maria_canina" 
          autoCapitalize="none"
          onChangeText={(val) => handleChange('username', val)} 
        />

        <Text style={styles.label}>Correo Electrónico *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="email@ejemplo.com" 
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(val) => handleChange('correo', val)} 
        />

        {/* --- DATOS PERSONALES --- */}
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput style={styles.input} placeholder="Maria" onChangeText={(val) => handleChange('nombre', val)} />
          </View>
          <View style={[styles.flex1, { marginLeft: 10 }]}>
            <Text style={styles.label}>Apellido *</Text>
            <TextInput style={styles.input} placeholder="García" onChangeText={(val) => handleChange('apellido', val)} />
          </View>
        </View>

        <Text style={styles.label}>Identificación *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Cédula o DNI" 
          keyboardType="numeric"
          onChangeText={(val) => handleChange('identificacion', val)} 
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput 
          style={styles.input} 
          placeholder="099..." 
          keyboardType="phone-pad"
          onChangeText={(val) => handleChange('telefono', val)} 
        />

        <Text style={styles.label}>Dirección</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Calle y número de casa" 
          onChangeText={(val) => handleChange('direccion', val)} 
        />

        {/* --- SEGURIDAD --- */}
        <Text style={styles.label}>Contraseña *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="••••••••" 
          secureTextEntry 
          onChangeText={(val) => handleChange('clave', val)} 
        />

        <Text style={styles.label}>Confirmar Contraseña *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="••••••••" 
          secureTextEntry 
          onChangeText={(val) => handleChange('clave_confirmacion', val)} 
        />

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Crear Cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerText}>
            ¿Ya tienes cuenta? <Text style={styles.linkText}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 30, paddingTop: 10 },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.textMain, marginBottom: 5 },
  subtitle: { fontSize: 16, color: COLORS.textMuted, marginBottom: 25 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textMain, marginBottom: 8, marginLeft: 4 },
  input: { height: 50, borderWidth: 1, borderColor: COLORS.inputBorder, borderRadius: 12, paddingHorizontal: 15, fontSize: 16, backgroundColor: '#f9f9f9', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  flex1: { flex: 1 },
  registerButton: { backgroundColor: COLORS.primary, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 15, elevation: 4 },
  registerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerText: { textAlign: 'center', marginTop: 25, color: COLORS.textMuted, fontSize: 15 },
  linkText: { color: COLORS.primary, fontWeight: 'bold' }
});
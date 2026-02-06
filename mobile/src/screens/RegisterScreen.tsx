import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, ScrollView, Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { authApi} from '../api/client';

export const RegisterScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    const { 
      username, correo, clave, clave_confirmacion, 
      nombre, apellido, identificacion, telefono 
    } = formData;

    // 1. Validar campos obligatorios
    if (!username || !correo || !clave || !nombre || !apellido || !identificacion) {
      Alert.alert("Campos incompletos", "Por favor, llena todos los campos marcados con *");
      return;
    }

    // 2. Validar Email (Regex básico)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      Alert.alert("Email no válido", "Introduce un correo electrónico correcto.");
      return;
    }

    // 3. Validar Seguridad de Contraseña (Mínimo 8 caracteres)
    if (clave.length < 8) {
      Alert.alert("Seguridad", "La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    // 4. Confirmar coincidencia
    if (clave !== clave_confirmacion) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    // 5. Validar Identificación (Solo números y longitud mínima, ej: 10 para cédula)
    if (identificacion.length < 8) {
      Alert.alert("Identificación", "Introduce un número de identificación válido.");
      return;
    }

    try {
      // Usamos .trim() en los strings para limpiar espacios accidentales
      const dataToSend = {
        ...formData,
        username: username.trim().toLowerCase(),
        correo: correo.trim().toLowerCase(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
      };

      const response = await authApi.post('/api/auth/registro/', dataToSend);
      if (response.status === 201 || response.status === 200) {
        Alert.alert("¡Bienvenido!", "Registro exitoso. Ya puedes iniciar sesión.", [
          { text: "Ir al Login", onPress: () => navigation.navigate('Login') }
        ]);
      }
    } catch (error: any) {
      // Capturamos el error específico del backend si existe
      const backendMessage = error.response?.data?.error || error.response?.data?.detail;
      Alert.alert(
        "Error de Registro", 
        backendMessage || "El usuario o correo ya están registrados."
      );
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
          placeholder="Usuario" 
          value={formData.username}
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
          maxLength={10} 
          value={formData.identificacion}
          onChangeText={(val) => {
            const num = val.replace(/[^0-9]/g, '');
            handleChange('identificacion', num);
          }} 
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput 
          style={styles.input} 
          placeholder="099..." 
          keyboardType="phone-pad"
          maxLength={10}
          value={formData.telefono}
          onChangeText={(val) => {
            const num = val.replace(/[^0-9]/g, '');
            handleChange('telefono', num);
          }}
         />       

        <Text style={styles.label}>Dirección</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Calle y número de casa" 
          onChangeText={(val) => handleChange('direccion', val)} 
        />

        {/* --- SEGURIDAD --- */}
        <Text style={styles.label}>Contraseña *</Text>
        <View style={styles.passwordContainer}>
          <TextInput 
            style={styles.inputPassword} 
            placeholder="••••••••" 
            secureTextEntry={!showPassword} // Si showPassword es false, se oculta
            onChangeText={(val) => handleChange('clave', val)} 
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialIcons 
              name={showPassword ? "visibility" : "visibility-off"} 
              size={24} 
              color={COLORS.textMuted} 
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirmar Contraseña *</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.inputPassword} 
              placeholder="••••••••" 
              secureTextEntry={!showConfirmPassword} 
              onChangeText={(val) => handleChange('clave_confirmacion', val)} 
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <MaterialIcons 
                name={showConfirmPassword ? "visibility" : "visibility-off"} 
                size={24} 
                color={COLORS.textMuted} 
              />
            </TouchableOpacity>
          </View>

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
  linkText: { color: COLORS.primary, fontWeight: 'bold' },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    marginBottom: 15,
    paddingRight: 15, // Espacio para el icono
  },
  inputPassword: {
    flex: 1, // Toma todo el espacio sobrante
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.textMain,
  },
  eyeIcon: {
    padding: 5,
  },
});
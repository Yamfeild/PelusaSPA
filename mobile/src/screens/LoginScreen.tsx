import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, Alert
} from 'react-native'; 
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

export const LoginScreen = ({ navigation }: any) => {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validación básica antes de llamar a la API
    if (!usuario.trim() || !clave.trim()) {
      Alert.alert("Campos incompletos", "Por favor ingresa tu usuario y contraseña.");
      return;
    }

    setLoading(true);
    try {
      const usuarioAutenticado = await signIn({ usuario: usuario.trim(), clave });
      
      // Control de Rol
      if (usuarioAutenticado?.rol && usuarioAutenticado.rol !== 'CLIENTE') {
        Alert.alert(
          "Acceso denegado",
          "Esta aplicación es solo para clientes. Usa la web para otros roles.",
          [{ text: "OK", onPress: () => signOut() }]
        );
      }
    } catch (error: any) {
    // Aquí controlamos que no salga el error de Axios crudo
    console.log("Error completo:", error);

    if (!error.response) {
      // Si no hay respuesta, es un error de conexión/red
      Alert.alert("Error de conexión", "No se pudo conectar con el servidor. Revisa tu internet.");
    } else if (error.response.status === 401) {
      // Credenciales mal escritas
      Alert.alert("Acceso denegado", "Usuario o contraseña incorrectos.");
    } else {
      // Otros errores (500, 404, etc)
      Alert.alert("Acceso denegado", "Usuario o contraseña incorrectos.");
    }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <StatusBar hidden={true} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        <View style={styles.header}>
          <MaterialIcons  size={24} color={COLORS.textMain} />
          <Text style={styles.headerTitle}></Text>
          <View style={{ width: 24 }} /> 
        </View>

        <View style={styles.content}>
          
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <MaterialIcons name="pets" size={50} color={COLORS.primary} />
            </View>
          </View>

          
          <Text style={styles.welcomeTitle}>PelusaSPA</Text>
          <Text style={styles.welcomeSubtitle}>Reserva tu cita con elegancia</Text>

          
          <View style={styles.form}>
            <Text style={styles.label}>Usuario o correo</Text>
            <TextInput 
              style={styles.input}
              placeholder="Tu usuario"
              onChangeText={setUsuario}
              autoCapitalize="none"
            />

            <View style={styles.passwordHeader}>
              <Text style={styles.label}>Contraseña</Text>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </View>
            
            <View style={styles.passwordContainer}>
              <TextInput 
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="••••••••"
                secureTextEntry={!showPassword} 
                onChangeText={setClave}
              />
              
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <MaterialIcons 
                  name={showPassword ? "visibility" : "visibility-off"} 
                  size={24} 
                  color={COLORS.textMuted} 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Entrar</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Register')}
            style={{ marginTop: 40 }}
          >
            <Text style={{ color: COLORS.textMuted }}>
              ¿No tienes una cuenta? <Text style={styles.linkText}>Crear cuenta</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundLight },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textMain },
  content: { flex: 1, paddingHorizontal: 30, alignItems: 'center', paddingTop: 30 },
  logoContainer: { marginBottom: 30 },
  logoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#3377401a', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#33774033' },
  welcomeTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.textMain, textAlign: 'center' },
  welcomeSubtitle: { fontSize: 16, color: COLORS.textMuted, marginTop: 10, textAlign: 'center' },
  form: { width: '100%', marginTop: 40 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.textMain, marginBottom: 8, marginLeft: 4 },
  input: { height: 56, borderWidth: 1, borderColor: COLORS.inputBorder, borderRadius: 12, paddingHorizontal: 15, fontSize: 16, backgroundColor: '#fff', marginBottom: 20 },
  passwordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgotText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, position: 'relative' },
  eyeIcon: { position: 'absolute', right: 15, zIndex: 1, padding: 10 }, // Agregamos zIndex y padding para facilitar el click
  loginButton: { backgroundColor: COLORS.primary, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerText: { marginTop: 40, color: COLORS.textMuted },
  linkText: { color: COLORS.primary, fontWeight: 'bold' }
});
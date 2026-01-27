import React from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

export const ProfileScreen = () => {
  const { user, signOut } = useAuth(); // Obtenemos el usuario y la función de salida

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={20} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajustes de Perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Foto de Perfil */}
        <View style={styles.profileImageSection}>
          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/150' }} 
              style={styles.profileImage} 
            />
            <TouchableOpacity style={styles.cameraButton}>
              <MaterialIcons name="photo-camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{user?.username || 'Sarah Jenkins'}</Text>
          <Text style={styles.membershipText}>Miembro Gold desde 2023</Text>
        </View>

        {/* Información Personal */}
        <Text style={styles.sectionTitle}>Información Personal</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre Completo</Text>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.input} 
              value={user?.username} 
              editable={false} 
            />
            <MaterialIcons name="person" size={20} color={COLORS.primary} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.input} 
              value={user?.email} 
              editable={false} 
            />
            <MaterialIcons name="email" size={20} color={COLORS.primary} />
          </View>
        </View>

        {/* Seguridad y Preferencias */}
        <Text style={styles.sectionTitle}>Seguridad y Preferencias</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.iconBox, { backgroundColor: '#3377401a' }]}>
            <MaterialIcons name="lock" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.menuText}>Cambiar Contraseña</Text>
          <MaterialIcons name="chevron-right" size={24} color="#aaa" />
        </TouchableOpacity>

        <View style={styles.menuItem}>
          <View style={[styles.iconBox, { backgroundColor: '#3377401a' }]}>
            <MaterialIcons name="notifications" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.menuText}>Notificaciones Push</Text>
          <Switch value={true} trackColor={{ false: "#767577", true: COLORS.primary }} />
        </View>

        {/* Botones de Acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <MaterialIcons name="logout" size={20} color={COLORS.primary} />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  backButton: { padding: 10 },
  scrollContent: { padding: 20 },
  profileImageSection: { alignItems: 'center', marginBottom: 30 },
  imageWrapper: { position: 'relative', marginBottom: 15 },
  profileImage: { 
  width: 120, 
  height: 120, 
  borderRadius: 60,
  borderWidth: 4,
  borderColor: '#3377401a' 
},
  cameraButton: { 
  position: 'absolute', 
  bottom: 5, 
  right: 5, 
  backgroundColor: COLORS.primary, 
  padding: 8, 
  borderRadius: 20, 
  borderWidth: 2, 
  borderColor: '#fff',
  alignItems: 'center',
  justifyContent: 'center'
},
  profileName: { fontSize: 22, fontWeight: 'bold' },
  membershipText: { color: COLORS.primary, fontWeight: '600', marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 25, marginBottom: 15 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8e7', borderRadius: 12, paddingHorizontal: 15, height: 56, backgroundColor: '#fff' },
  input: { flex: 1, fontSize: 16, color: '#333' },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 15, borderRadius: 12, marginBottom: 10 },
  iconBox: { 
  padding: 8, 
  borderRadius: 10, 
  marginRight: 15,
  alignItems: 'center',
  justifyContent: 'center'
},
  menuText: { flex: 1, fontSize: 16, fontWeight: '500' },
  actionButtons: { marginTop: 30, gap: 15 },
  saveButton: { backgroundColor: COLORS.primary, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logoutButton: { flexDirection: 'row', height: 56, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', gap: 10 },
  logoutText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' }
});
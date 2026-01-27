import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Importa tus componentes
import { ProfileScreen } from './src/screens/ProfileScreen';
import { RegisterScreen } from './src/screens/RegisterScreen'; // 2. Importar tu nueva pantalla
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { COLORS } from './src/constants/theme';
import { PetsListScreen } from './src/screens/PetsListScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator(); // 3. Crear el Stack

// Navegación para cuando NO están logueados
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const ClientTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color }) => {
          let iconName: any;
          if (route.name === 'Inicio') iconName = 'dashboard';
          else if (route.name === 'Mascotas') iconName = 'pets';
          else if (route.name === 'Reservar') iconName = 'calendar-month';
          else if (route.name === 'Perfil') iconName = 'account-circle';
          return <MaterialIcons name={iconName} size={26} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { height: 70, paddingBottom: 10 },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Mascotas" component={PetsListScreen} />
      <Tab.Screen name="Reservar" component={HomeScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const Root = () => {
  const { signed, user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!signed ? (
        // Si no está firmado, mostramos el Stack de Auth (Login + Register)
        <AuthNavigator />
      ) : user?.rol === 'CLIENTE' ? (
        // Si es cliente, mostramos las pestañas
        <ClientTabs />
      ) : (
        // Si entra alguien que no es cliente (Admin/Peluquero)
        (() => {
          Alert.alert("Acceso denegado", "Esta aplicación es solo para clientes.");
          signOut();
          return <AuthNavigator />;
        })()
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
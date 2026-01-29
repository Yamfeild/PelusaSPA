import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { View, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Contextos
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext'; // <--- IMPORTANTE

// Pantallas
import { ProfileScreen } from './src/screens/ProfileScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { CreatePetScreen } from './src/screens/CreatePetScreen';
import { EditPetScreen } from './src/screens/EditPetScreen';
import { PetsListScreen } from './src/screens/PetsListScreen';
import { BookingScreen } from './src/screens/BookingScreen';
import { COLORS } from './src/constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
          else if (route.name === 'Reservar') iconName = 'calendar-month'; // <--- ESTE NOMBRE
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
      <Tab.Screen name="Reservar" component={BookingScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const ClientNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ClientTabs" component={ClientTabs} />
    <Stack.Screen name="CreatePet" component={CreatePetScreen} />
    <Stack.Screen name="EditPet" component={EditPetScreen} />
  </Stack.Navigator>
);

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
        <AuthNavigator />
      ) : user?.rol === 'CLIENTE' ? (
        <ClientNavigator />
      ) : (
        // Lógica de alerta para no-clientes...
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider> {/* <--- ENVUELVE TODO PARA EL MODO OSCURO */}
        <AuthProvider>
          <Root />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
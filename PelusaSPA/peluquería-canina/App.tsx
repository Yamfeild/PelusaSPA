import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BookAppointment from './pages/BookAppointment';
import RegisterPet from './pages/RegisterPet';
import EditPet from './pages/EditPet';
import Services from './pages/Services';
import Reschedule from './pages/Reschedule';
import AdminPanel from './pages/AdminPanel';
import PeluqueroPanel from './pages/PeluqueroPanel';
import { AuthProvider, useAuth } from './context/AuthContext';

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-text-light dark:text-text-dark text-lg">Cargando...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Componente para ruta de login con redirección si ya hay sesión
const LoginRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-text-light dark:text-text-dark text-lg">Cargando...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.rol === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user?.rol === 'PELUQUERO') return <Navigate to="/peluquero" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Componente para rutas solo admin
const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-text-light dark:text-text-dark text-lg">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.rol !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Componente para rutas solo peluquero
const PeluqueroRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-text-light dark:text-text-dark text-lg">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.rol !== 'PELUQUERO') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginRoute><Login /></LoginRoute>} />
        <Route path="/services" element={<Services />} />
        
        {/* Rutas protegidas */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/book" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
        <Route path="/book-appointment" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
        <Route path="/register-pet" element={<ProtectedRoute><RegisterPet /></ProtectedRoute>} />
        <Route path="/edit-pet/:id" element={<ProtectedRoute><EditPet /></ProtectedRoute>} />
        <Route path="/edit-pet" element={<ProtectedRoute><EditPet /></ProtectedRoute>} />
        <Route path="/reschedule/:id" element={<ProtectedRoute><Reschedule /></ProtectedRoute>} />
        <Route path="/reschedule" element={<ProtectedRoute><Reschedule /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/peluquero" element={<PeluqueroRoute><PeluqueroPanel /></PeluqueroRoute>} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;

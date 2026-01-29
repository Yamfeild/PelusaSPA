import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { citasService } from '../services';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const profilePath = user?.rol === 'ADMIN'
    ? '/admin'
    : user?.rol === 'PELUQUERO'
      ? '/peluquero'
      : '/dashboard';

  const handleAvatarClick = () => {
    if (!isAuthenticated) return;
    setShowUserMenu((prev) => !prev);
  };

  const goToProfile = () => {
    setShowUserMenu(false);
    navigate(profilePath);
  };

  const goToEditProfile = () => {
    setShowUserMenu(false);
    navigate('/edit-profile');
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  // Cargar citas próximas
  useEffect(() => {
    if (isAuthenticated && (user?.rol === 'CLIENTE' || user?.rol === 'PELUQUERO')) {
      loadUpcomingAppointments();
      
      // Recargar cada minuto
      const interval = setInterval(loadUpcomingAppointments, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  const loadUpcomingAppointments = async () => {
    try {
      const data = await citasService.getCitasProximas(24);
      setUpcomingCount(data.count);
      setUpcomingAppointments(data.citas || []);
    } catch (error) {
      console.error('Error cargando citas próximas:', error);
    }
  };

  useEffect(() => {
    if (!showUserMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Cerrar notificaciones al hacer clic afuera
  useEffect(() => {
    if (!showNotifications) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-[#10221c]/80 backdrop-blur-lg border-border-light dark:border-border-dark">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
            <div className="text-primary size-7">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fillRule="evenodd"></path>
              </svg>
            </div>
            <span className="font-bold text-lg text-text-light dark:text-text-dark">Peluquería Canina</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="text-subtext-light dark:text-subtext-dark hover:text-text-light dark:hover:text-text-dark transition-colors">Inicio</Link>
            <Link to="/services" className="text-subtext-light dark:text-subtext-dark hover:text-text-light dark:hover:text-text-dark transition-colors">Nuestros Servicios</Link>
            {user?.rol === 'ADMIN' && (
              <Link to="/admin" className="text-subtext-light dark:text-subtext-dark hover:text-text-light dark:hover:text-text-dark transition-colors font-semibold">Panel Admin</Link>
            )}
            {user?.rol === 'PELUQUERO' && (
              <Link to="/peluquero" className="text-subtext-light dark:text-subtext-dark hover:text-text-light dark:hover:text-text-dark transition-colors font-semibold">Panel Peluquero</Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <div className="relative" ref={notificationsRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    upcomingCount > 0
                      ? 'text-primary hover:bg-primary/20'
                      : 'text-subtext-light dark:text-subtext-dark hover:bg-primary/20 hover:text-primary'
                  }`}
                  title={upcomingCount > 0 ? `${upcomingCount} cita(s) próxima(s)` : 'Sin notificaciones'}
                >
                  <span className="material-symbols-outlined">
                    {upcomingCount > 0 ? 'notifications_active' : 'notifications_none'}
                  </span>
                  {upcomingCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                      {upcomingCount > 9 ? '9+' : upcomingCount}
                    </span>
                  )}
                </button>

                {/* Panel de notificaciones */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark shadow-lg z-50 overflow-hidden">
                    <div className="bg-primary/10 dark:bg-primary/20 px-4 py-3 border-b border-border-light dark:border-border-dark">
                      <h3 className="font-semibold text-text-light dark:text-text-dark">
                        Citas Próximas ({upcomingCount})
                      </h3>
                      <p className="text-xs text-subtext-light dark:text-subtext-dark mt-1">
                        Próximas 24 horas
                      </p>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {upcomingAppointments && upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map((cita) => (
                          <div key={cita.id} className="border-b border-border-light dark:border-border-dark px-4 py-3 hover:bg-background-light dark:hover:bg-background-dark transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-primary text-lg">pets</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-text-light dark:text-text-dark truncate">
                                  {cita.mascota_nombre || 'Mascota'}
                                </p>
                                <p className="text-xs text-subtext-light dark:text-subtext-dark mt-1">
                                  {cita.notas?.replace('Servicio: ', '') || 'Servicio'}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="material-symbols-outlined text-xs text-primary">schedule</span>
                                  <span className="text-xs text-subtext-light dark:text-subtext-dark">
                                    {(() => {
                                      const date = new Date(cita.fecha + 'T' + cita.hora_inicio);
                                      const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                                      const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
                                      return `${dateStr} ${timeStr}`;
                                    })()}
                                  </span>
                                </div>
                                <span className={`inline-block text-xs font-semibold mt-2 px-2 py-1 rounded ${
                                  cita.estado === 'CONFIRMADA' 
                                    ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                                    : cita.estado === 'PENDIENTE'
                                    ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                                    : 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
                                }`}>
                                  {cita.estado}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-subtext-light dark:text-subtext-dark">
                          <p className="text-sm">No hay citas próximas</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-background-light dark:bg-background-dark px-4 py-3 border-t border-border-light dark:border-border-dark flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setUpcomingAppointments([]);
                          setUpcomingCount(0);
                          setShowNotifications(false);
                        }}
                        className="flex-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors py-2 px-2 rounded hover:bg-primary/10"
                        title="Marcar todas como leídas"
                      >
                        ✓ Visto
                      </button>
                      <button
                        onClick={() => {
                          navigate('/notificaciones');
                          setShowNotifications(false);
                        }}
                        className="flex-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors py-2 px-2 rounded hover:bg-primary/10"
                      >
                        Ver todo →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <button 
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full text-subtext-light dark:text-subtext-dark hover:bg-primary/20 hover:text-text-light dark:hover:text-text-dark transition-colors"
            >
              <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>
            
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-text-light dark:text-text-dark dark:bg-primary/30"
                >
                   <span className="material-symbols-outlined">person</span>
                </button>
                 {showUserMenu && (
                   <div className="absolute right-0 mt-4 w-48 rounded-lg border border-border-light bg-white text-text-light shadow-lg z-50">
                      <button onClick={goToProfile} className="w-full text-left px-4 py-2 text-sm hover:bg-primary/10">Perfil</button>
                      <button onClick={goToEditProfile} className="w-full text-left px-4 py-2 text-sm hover:bg-primary/10">Editar perfil</button>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Cerrar sesión</button>
                   </div>
                 )}
              </div>
            ) : (
              <Link to="/login" className="flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-text-light transition-colors hover:bg-primary/90">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-text-light dark:text-white dark:bg-primary/30"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-4">
           <nav className="flex flex-col gap-4 text-base font-medium">
            <Link to="/" className="text-text-light dark:text-text-dark" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
            <Link to="/services" className="text-text-light dark:text-text-dark" onClick={() => setIsMenuOpen(false)}>Nuestros Servicios</Link>
            {user?.rol === 'ADMIN' && (
              <Link to="/admin" className="text-text-light dark:text-text-dark font-semibold" onClick={() => setIsMenuOpen(false)}>Panel Admin</Link>
            )}
            {user?.rol === 'PELUQUERO' && (
              <Link to="/peluquero" className="text-text-light dark:text-text-dark font-semibold" onClick={() => setIsMenuOpen(false)}>Panel Peluquero</Link>
            )}
            <div className="h-px bg-border-light dark:bg-border-dark my-2"></div>
             <button onClick={() => { toggleTheme(); setIsMenuOpen(false); }} className="flex items-center gap-2 text-text-light dark:text-text-dark">
                <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
                <span>{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>
             </button>
            {isAuthenticated ? (
               <>
                 <button onClick={() => { goToProfile(); setIsMenuOpen(false); }} className="flex items-center gap-2 text-text-light dark:text-text-dark">
                   <span className="material-symbols-outlined">person</span>
                   <span>Mi Perfil</span>
                 </button>
                 <button onClick={() => { goToEditProfile(); setIsMenuOpen(false); }} className="flex items-center gap-2 text-text-light dark:text-text-dark">
                   <span className="material-symbols-outlined">edit</span>
                   <span>Editar perfil</span>
                 </button>
                 <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="flex items-center gap-2 text-red-600">
                   <span className="material-symbols-outlined">logout</span>
                   <span>Cerrar sesión</span>
                 </button>
               </>
            ) : (
              <Link to="/login" className="text-primary font-bold" onClick={() => setIsMenuOpen(false)}>Iniciar Sesión</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

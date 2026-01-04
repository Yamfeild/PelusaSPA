import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
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
    const isOnPeluqueroPanel = user?.rol === 'PELUQUERO' && location.pathname.includes('/peluquero');
    if (isOnPeluqueroPanel) {
      window.dispatchEvent(new CustomEvent('openPeluqueroProfileEdit'));
      return;
    }
    navigate(`${profilePath}?edit=1`);
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

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

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
          </nav>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full text-subtext-light dark:text-subtext-dark hover:bg-primary/20 hover:text-text-light dark:hover:text-text-dark transition-colors"
            >
              <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>
            
            {isAuthenticated ? (
              <Link to="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-text-light dark:text-text-dark dark:bg-primary/30">
                 <span className="material-symbols-outlined">person</span>
              </Link>
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
            <div className="h-px bg-border-light dark:bg-border-dark my-2"></div>
             <button onClick={() => { toggleTheme(); setIsMenuOpen(false); }} className="flex items-center gap-2 text-text-light dark:text-text-dark">
                <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
                <span>{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>
             </button>
            {isAuthenticated ? (
               <Link to="/dashboard" className="flex items-center gap-2 text-text-light dark:text-text-dark" onClick={() => setIsMenuOpen(false)}>
                 <span className="material-symbols-outlined">person</span>
                 <span>Mi Perfil</span>
               </Link>
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

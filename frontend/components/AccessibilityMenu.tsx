import React, { useState, useEffect, useRef } from 'react';

const AccessibilityMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100); // Porcentaje del tamaño base
  const [highContrast, setHighContrast] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cargar preferencias guardadas
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility-fontSize');
    const savedHighContrast = localStorage.getItem('accessibility-highContrast');
    const savedGrayscale = localStorage.getItem('accessibility-grayscale');

    if (savedFontSize) {
      const size = parseInt(savedFontSize);
      setFontSize(size);
      applyFontSize(size);
    }
    if (savedHighContrast === 'true') {
      setHighContrast(true);
      applyHighContrast(true);
    }
    if (savedGrayscale === 'true') {
      setGrayscale(true);
      applyGrayscale(true);
    }
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const applyFontSize = (size: number) => {
    document.documentElement.style.fontSize = `${size}%`;
  };

  const applyHighContrast = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  const applyGrayscale = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.style.filter = 'grayscale(100%)';
    } else {
      document.documentElement.style.filter = 'none';
    }
  };

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 10, 150);
    setFontSize(newSize);
    applyFontSize(newSize);
    localStorage.setItem('accessibility-fontSize', newSize.toString());
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 10, 80);
    setFontSize(newSize);
    applyFontSize(newSize);
    localStorage.setItem('accessibility-fontSize', newSize.toString());
  };

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    applyHighContrast(newValue);
    localStorage.setItem('accessibility-highContrast', newValue.toString());
  };

  const toggleGrayscale = () => {
    const newValue = !grayscale;
    setGrayscale(newValue);
    applyGrayscale(newValue);
    localStorage.setItem('accessibility-grayscale', newValue.toString());
  };

  const resetAll = () => {
    setFontSize(100);
    setHighContrast(false);
    setGrayscale(false);
    applyFontSize(100);
    applyHighContrast(false);
    applyGrayscale(false);
    localStorage.removeItem('accessibility-fontSize');
    localStorage.removeItem('accessibility-highContrast');
    localStorage.removeItem('accessibility-grayscale');
  };

  return (
    <div ref={menuRef} className="fixed bottom-6 left-6 z-50">
      {/* Botón flotante de accesibilidad */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-2xl transition-all hover:scale-110"
        title="Herramientas de accesibilidad"
        aria-label="Abrir menú de accesibilidad"
      >
        <span className="material-symbols-outlined text-3xl">accessibility</span>
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header del menú */}
          <div className="bg-primary px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">accessibility</span>
              Herramientas de Accesibilidad
            </h3>
          </div>

          {/* Opciones */}
          <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
            {/* Tamaño de texto */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">text_fields</span>
                  Tamaño de texto
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{fontSize}%</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={decreaseFontSize}
                  disabled={fontSize <= 80}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                  aria-label="Disminuir texto"
                >
                  <span className="material-symbols-outlined text-lg">text_decrease</span>
                  A-
                </button>
                <button
                  onClick={increaseFontSize}
                  disabled={fontSize >= 150}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                  aria-label="Aumentar texto"
                >
                  <span className="material-symbols-outlined text-lg">text_increase</span>
                  A+
                </button>
              </div>
            </div>

            {/* Alto contraste */}
            <button
              onClick={toggleHighContrast}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                highContrast
                  ? 'bg-primary text-white'
                  : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label={highContrast ? 'Desactivar alto contraste' : 'Activar alto contraste'}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className="material-symbols-outlined text-lg">contrast</span>
                Alto contraste
              </span>
              {highContrast && (
                <span className="material-symbols-outlined text-lg">check</span>
              )}
            </button>

            {/* Escala de grises */}
            <button
              onClick={toggleGrayscale}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                grayscale
                  ? 'bg-primary text-white'
                  : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label={grayscale ? 'Desactivar escala de grises' : 'Activar escala de grises'}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className="material-symbols-outlined text-lg">monochrome_photos</span>
                Escala de grises
              </span>
              {grayscale && (
                <span className="material-symbols-outlined text-lg">check</span>
              )}
            </button>

            {/* Restablecer cambios */}
            <button
              onClick={resetAll}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium mt-2"
              aria-label="Restablecer todos los cambios de accesibilidad"
            >
              <span className="material-symbols-outlined text-lg">restart_alt</span>
              Restablecer cambios
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityMenu;

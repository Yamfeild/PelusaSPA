import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

interface NotificationBannerProps {
  onRequestPermission?: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ onRequestPermission }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const currentPermission = notificationService.getPermission();
    setPermission(currentPermission);
    
    // Mostrar banner si no hay permiso y no se ha descartado
    const wasDismissed = localStorage.getItem('notification-banner-dismissed');
    if (currentPermission === 'default' && !wasDismissed) {
      setShowBanner(true);
    }
  }, []);

  const handleRequestPermission = async () => {
    const newPermission = await notificationService.requestPermission();
    setPermission(newPermission);
    
    if (newPermission === 'granted') {
      setShowBanner(false);
      notificationService.showNotification('¡Notificaciones activadas!', {
        body: 'Ahora recibirás recordatorios de tus citas próximas',
      });
      if (onRequestPermission) {
        onRequestPermission();
      }
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('notification-banner-dismissed', 'true');
  };

  if (!showBanner || permission !== 'default' || !notificationService.isSupported()) {
    return null;
  }

  return (
    <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-2xl flex-shrink-0">notifications</span>
        <div className="flex-1">
          <h3 className="font-semibold text-text-light dark:text-text-dark mb-1">
            Activa las notificaciones
          </h3>
          <p className="text-sm text-subtext-light dark:text-subtext-dark mb-3">
            Recibe recordatorios de tus citas próximas y mantente al día con tu mascota
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRequestPermission}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Activar Notificaciones
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-text-light dark:text-text-dark text-sm font-medium hover:bg-background-light dark:hover:bg-background-dark transition-colors"
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;

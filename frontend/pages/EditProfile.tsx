import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';
import { notificationService } from '../services/notificationService';

const EditProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'photo' | 'security' | 'notifications'>('personal');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Datos personales
  const [personalForm, setPersonalForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: ''
  });

  // Cambio de contraseña
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Foto de perfil
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Notificaciones
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (user?.persona) {
      setPersonalForm({
        nombre: user.persona.nombre || '',
        apellido: user.persona.apellido || (user.persona as any).apellidos || '',
        telefono: user.persona.telefono || (user.persona as any).celular || '',
        direccion: user.persona.direccion || ''
      });
    }
    
    // Verificar estado de notificaciones
    setNotificationPermission(notificationService.getPermission());
  }, [user]);

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await authService.updateProfile({
        nombre: personalForm.nombre,
        apellido: personalForm.apellido,
        telefono: personalForm.telefono || undefined,
        direccion: personalForm.direccion || undefined
      });
      
      await refreshProfile();
      setSuccess('Datos personales actualizados correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword({
        old_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      });
      
      setSuccess('Contraseña actualizada correctamente');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      if (err.message.includes('404')) {
        setError('Esta funcionalidad estará disponible próximamente. El backend aún no tiene implementado el endpoint para cambiar contraseña.');
      } else {
        setError(err.message || 'Error al cambiar la contraseña');
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen debe ser menor a 5MB');
        return;
      }
      
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('Esta funcionalidad estará disponible próximamente. El backend aún no tiene implementado el endpoint para subir fotos de perfil.');
  };

  const handleRequestNotifications = async () => {
    const permission = await notificationService.requestPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      setSuccess('¡Notificaciones activadas! Ahora recibirás recordatorios de tus citas.');
      setTimeout(() => setSuccess(''), 3000);
    } else if (permission === 'denied') {
      setError('Has bloqueado las notificaciones. Puedes activarlas desde la configuración de tu navegador.');
    }
  };

  const testNotification = () => {
    if (notificationService.getPermission() === 'granted') {
      notificationService.showNotification('🔔 Notificación de prueba', {
        body: 'Las notificaciones están funcionando correctamente',
      });
      setSuccess('Notificación de prueba enviada');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Primero debes activar las notificaciones');
    }
  };

  const fullName = user?.persona
    ? `${user.persona.nombre || ''} ${user.persona.apellido || (user.persona as any).apellidos || ''}`.trim()
    : user?.username || 'Usuario';

  const goBack = () => {
    const profilePath = user?.rol === 'ADMIN'
      ? '/admin'
      : user?.rol === 'PELUQUERO'
        ? '/peluquero'
        : '/dashboard';
    navigate(profilePath);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-subtext-light dark:text-subtext-dark hover:text-text-light dark:hover:text-text-dark mb-4 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-medium">Volver</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-primary">person</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">Editar Perfil</h1>
              <p className="text-subtext-light dark:text-subtext-dark mt-1">{fullName}</p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border-light dark:border-border-dark overflow-x-auto">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex-1 min-w-fit py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'personal'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-subtext-light dark:text-subtext-dark hover:text-text-light hover:bg-background-light dark:hover:bg-background-dark'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-xl">person</span>
                <span className="hidden sm:inline">Datos Personales</span>
                <span className="sm:hidden">Personal</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('photo')}
              className={`flex-1 min-w-fit py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'photo'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-subtext-light dark:text-subtext-dark hover:text-text-light hover:bg-background-light dark:hover:bg-background-dark'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-xl">photo_camera</span>
                <span className="hidden sm:inline">Foto de Perfil</span>
                <span className="sm:hidden">Foto</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 min-w-fit py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'security'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-subtext-light dark:text-subtext-dark hover:text-text-light hover:bg-background-light dark:hover:bg-background-dark'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-xl">lock</span>
                <span className="hidden sm:inline">Seguridad</span>
                <span className="sm:hidden">Clave</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 min-w-fit py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'notifications'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-subtext-light dark:text-subtext-dark hover:text-text-light hover:bg-background-light dark:hover:bg-background-dark'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-xl">notifications</span>
                <span className="hidden sm:inline">Notificaciones</span>
                <span className="sm:hidden">Avisos</span>
              </span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-3">
                <span className="material-symbols-outlined text-xl flex-shrink-0">error</span>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 flex items-start gap-3">
                <span className="material-symbols-outlined text-xl flex-shrink-0">check_circle</span>
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Datos Personales */}
            {activeTab === 'personal' && (
              <form onSubmit={handlePersonalSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-text-light dark:text-text-dark mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={personalForm.nombre}
                      onChange={(e) => setPersonalForm({ ...personalForm, nombre: e.target.value })}
                      className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-3 text-text-light dark:text-text-dark focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-light dark:text-text-dark mb-2">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      value={personalForm.apellido}
                      onChange={(e) => setPersonalForm({ ...personalForm, apellido: e.target.value })}
                      className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-3 text-text-light dark:text-text-dark focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-light dark:text-text-dark mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={personalForm.telefono}
                    onChange={(e) => setPersonalForm({ ...personalForm, telefono: e.target.value })}
                    placeholder="0989883013"
                    className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-3 text-text-light dark:text-text-dark focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-light dark:text-text-dark mb-2">
                    Dirección
                  </label>
                  <textarea
                    value={personalForm.direccion}
                    onChange={(e) => setPersonalForm({ ...personalForm, direccion: e.target.value })}
                    rows={4}
                    placeholder="Ingresa tu dirección completa"
                    className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-3 text-text-light dark:text-text-dark focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex-1 h-12 rounded-lg border border-border-light dark:border-border-dark text-text-light dark:text-text-dark font-semibold hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 h-12 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <span className="animate-spin material-symbols-outlined">progress_activity</span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">save</span>
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Foto de Perfil */}
            {activeTab === 'photo' && (
              <form onSubmit={handlePhotoSubmit} className="flex flex-col gap-6">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-2">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-500 flex-shrink-0">info</span>
                    <div className="text-sm text-text-light dark:text-text-dark">
                      <p className="font-semibold mb-1 text-yellow-700 dark:text-yellow-500">Funcionalidad en desarrollo</p>
                      <p className="text-subtext-light dark:text-subtext-dark">
                        La subida de fotos de perfil estará disponible próximamente una vez que se implemente el endpoint en el backend.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="w-40 h-40 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center overflow-hidden">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-7xl text-primary">person</span>
                      )}
                    </div>
                    <label className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                      <span className="material-symbols-outlined">photo_camera</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-subtext-light dark:text-subtext-dark mb-1">
                      Formatos soportados: JPG, PNG, GIF
                    </p>
                    <p className="text-xs text-subtext-light dark:text-subtext-dark">
                      Tamaño máximo: 5MB
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview('');
                      setPhotoFile(null);
                    }}
                    className="flex-1 h-12 rounded-lg border border-border-light dark:border-border-dark text-text-light dark:text-text-dark font-semibold hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                  >
                    Limpiar
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !photoFile}
                    className="flex-1 h-12 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <span className="animate-spin material-symbols-outlined">progress_activity</span>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">upload</span>
                        Subir Foto
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Seguridad */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-6">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-2">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-primary flex-shrink-0">info</span>
                    <div className="text-sm text-text-light dark:text-text-dark">
                      <p className="font-semibold mb-2">Requisitos de contraseña:</p>
                      <ul className="list-disc list-inside space-y-1 text-subtext-light dark:text-subtext-dark">
                        <li>Mínimo 8 caracteres</li>
                        <li>Incluir letras y números</li>
                        <li>Evitar información personal</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-light dark:text-text-dark mb-2">
                    Contraseña Actual *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-3 text-text-light dark:text-text-dark focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-light dark:text-text-dark mb-2">
                    Nueva Contraseña *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-3 text-text-light dark:text-text-dark focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-light dark:text-text-dark mb-2">
                    Confirmar Nueva Contraseña *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-3 text-text-light dark:text-text-dark focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex-1 h-12 rounded-lg border border-border-light dark:border-border-dark text-text-light dark:text-text-dark font-semibold hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 h-12 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <span className="animate-spin material-symbols-outlined">progress_activity</span>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">lock_reset</span>
                        Cambiar Contraseña
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Notificaciones */}
            {activeTab === 'notifications' && (
              <div className="flex flex-col gap-6">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-primary flex-shrink-0">notifications_active</span>
                    <div className="text-sm text-text-light dark:text-text-dark">
                      <p className="font-semibold mb-2">Recordatorios de Citas</p>
                      <p className="text-subtext-light dark:text-subtext-dark">
                        Activa las notificaciones para recibir recordatorios de tus citas próximas directamente en tu navegador.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estado actual */}
                <div className="border border-border-light dark:border-border-dark rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        notificationPermission === 'granted'
                          ? 'bg-green-500/10 text-green-500'
                          : notificationPermission === 'denied'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        <span className="material-symbols-outlined text-2xl">
                          {notificationPermission === 'granted'
                            ? 'check_circle'
                            : notificationPermission === 'denied'
                            ? 'block'
                            : 'help'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-light dark:text-text-dark">
                          Estado de Notificaciones
                        </h3>
                        <p className="text-sm text-subtext-light dark:text-subtext-dark">
                          {notificationPermission === 'granted'
                            ? 'Activas - Recibirás recordatorios'
                            : notificationPermission === 'denied'
                            ? 'Bloqueadas - Actívalas en tu navegador'
                            : 'No activadas - Haz clic para activar'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!notificationService.isSupported() && (
                    <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-500 text-sm">
                      Tu navegador no soporta notificaciones del sistema.
                    </div>
                  )}

                  {notificationPermission === 'default' && notificationService.isSupported() && (
                    <button
                      onClick={handleRequestNotifications}
                      className="w-full h-12 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">notifications</span>
                      Activar Notificaciones
                    </button>
                  )}

                  {notificationPermission === 'granted' && (
                    <div className="space-y-3">
                      <button
                        onClick={testNotification}
                        className="w-full h-12 rounded-lg border border-primary text-primary font-semibold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined">notification_add</span>
                        Enviar Notificación de Prueba
                      </button>
                      
                      <p className="text-xs text-subtext-light dark:text-subtext-dark text-center">
                        Las notificaciones se enviarán automáticamente 24 horas antes de tus citas
                      </p>
                    </div>
                  )}

                  {notificationPermission === 'denied' && (
                    <div className="text-sm text-subtext-light dark:text-subtext-dark">
                      <p className="mb-2">Para activar las notificaciones:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Haz clic en el ícono de candado/información en la barra de direcciones</li>
                        <li>Busca la opción "Notificaciones"</li>
                        <li>Selecciona "Permitir"</li>
                        <li>Recarga la página</li>
                      </ol>
                    </div>
                  )}
                </div>

                {/* Información adicional */}
                <div className="border border-border-light dark:border-border-dark rounded-lg p-6">
                  <h3 className="font-semibold text-text-light dark:text-text-dark mb-3">
                    ¿Cuándo recibirás notificaciones?
                  </h3>
                  <ul className="space-y-2 text-sm text-subtext-light dark:text-subtext-dark">
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary text-sm mt-0.5">schedule</span>
                      <span>24 horas antes de cada cita programada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary text-sm mt-0.5">check</span>
                      <span>Cuando tu cita sea confirmada por el peluquero</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary text-sm mt-0.5">info</span>
                      <span>Recordatorios de cambios importantes en tus citas</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;

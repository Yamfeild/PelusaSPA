import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';

interface ProfileEditModalProps {
  show: boolean;
  onClose: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ show, onClose }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'photo' | 'security'>('personal');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, refreshProfile } = useAuth();

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

  useEffect(() => {
    if (show && user?.persona) {
      setPersonalForm({
        nombre: user.persona.nombre || '',
        apellido: user.persona.apellido || (user.persona as any).apellidos || '',
        telefono: user.persona.telefono || (user.persona as any).celular || '',
        direccion: user.persona.direccion || ''
      });
    }
  }, [show, user]);

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
      setError(err.message || 'Error al cambiar la contraseña');
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
    if (!photoFile) {
      setError('Por favor selecciona una imagen');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      await authService.uploadPhoto(formData);
      
      await refreshProfile();
      setSuccess('Foto de perfil actualizada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al subir la foto');
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  const fullName = user?.persona
    ? `${user.persona.nombre || ''} ${user.persona.apellido || (user.persona as any).apellidos || ''}`.trim()
    : user?.username || 'Usuario';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={onClose}>
      <div className="bg-white dark:bg-card-dark rounded-xl max-w-2xl w-full my-8 max-h-[calc(100vh-4rem)] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark">
          <div>
            <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">Editar Perfil</h2>
            <p className="text-sm text-subtext-light dark:text-subtext-dark mt-1">{fullName}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-subtext-light dark:text-subtext-dark hover:text-text-light hover:bg-primary/10 rounded-full p-2 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-light dark:border-border-dark px-6">
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'personal'
                ? 'border-primary text-primary'
                : 'border-transparent text-subtext-light dark:text-subtext-dark hover:text-text-light'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">person</span>
              Datos Personales
            </span>
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            className={`py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'photo'
                ? 'border-primary text-primary'
                : 'border-transparent text-subtext-light dark:text-subtext-dark hover:text-text-light'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">photo_camera</span>
              Foto de Perfil
            </span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'security'
                ? 'border-primary text-primary'
                : 'border-transparent text-subtext-light dark:text-subtext-dark hover:text-text-light'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">lock</span>
              Seguridad
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-2">
              <span className="material-symbols-outlined text-xl">error</span>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 flex items-start gap-2">
              <span className="material-symbols-outlined text-xl">check_circle</span>
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Datos Personales */}
          {activeTab === 'personal' && (
            <form onSubmit={handlePersonalSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
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
                  <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
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
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
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
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                  Dirección
                </label>
                <textarea
                  value={personalForm.direccion}
                  onChange={(e) => setPersonalForm({ ...personalForm, direccion: e.target.value })}
                  rows={3}
                  placeholder="Ingresa tu dirección completa"
                  className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-3 text-text-light dark:text-text-dark focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
                />
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                <button
                  type="button"
                  onClick={onClose}
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
            <form onSubmit={handlePhotoSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center overflow-hidden">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-6xl text-primary">person</span>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
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

              <div className="flex gap-3 mt-4 pt-4 border-t border-border-light dark:border-border-dark">
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
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-2">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <div className="text-sm text-text-light dark:text-text-dark">
                    <p className="font-semibold mb-1">Requisitos de contraseña:</p>
                    <ul className="list-disc list-inside space-y-1 text-subtext-light dark:text-subtext-dark">
                      <li>Mínimo 8 caracteres</li>
                      <li>Incluir letras y números</li>
                      <li>Evitar información personal</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
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
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
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
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
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

              <div className="flex gap-3 mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                <button
                  type="button"
                  onClick={onClose}
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
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;

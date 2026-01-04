import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PeluquerosTab } from '../components/admin/PeluquerosTab';
import { ServiciosTab } from '../components/admin/ServiciosTab';
import { HorariosTab } from '../components/admin/HorariosTab';

type TabType = 'peluqueros' | 'servicios' | 'horarios';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('peluqueros');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'peluqueros', label: 'Peluqueros', icon: 'people' },
    { id: 'servicios', label: 'Servicios', icon: 'design_services' },
    { id: 'horarios', label: 'Horarios', icon: 'schedule' }
  ];

  const handleError = (msg: string) => {
    setError(msg);
    setSuccess('');
    setTimeout(() => setError(''), 5000);
  };

  const handleSuccess = (msg: string) => {
    setSuccess(msg);
    setError('');
    setTimeout(() => setSuccess(''), 5000);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pt-24 px-4 pb-12">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-light dark:text-text-dark mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-5xl text-primary">admin_panel_settings</span>
            Panel de Administración
          </h1>
          <p className="text-subtext-light dark:text-subtext-dark">
            Bienvenido, {user?.username}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-border-light dark:border-border-dark">
          <nav className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors font-medium ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-subtext-light dark:text-subtext-dark hover:text-text-light dark:hover:text-text-dark'
                }`}
              >
                <span className="material-symbols-outlined">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg text-green-700 dark:text-green-400">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'peluqueros' && (
            <PeluquerosTab setError={handleError} setSuccess={handleSuccess} />
          )}
          {activeTab === 'servicios' && (
            <ServiciosTab setError={handleError} setSuccess={handleSuccess} />
          )}
          {activeTab === 'horarios' && (
            <HorariosTab setError={handleError} setSuccess={handleSuccess} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;


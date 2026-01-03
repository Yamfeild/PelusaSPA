import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // El backend espera 'usuario' (puede ser email o username) y 'clave'
      await login({ usuario: email, clave: password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validaciones
    if (password !== passwordConfirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (!fechaNacimiento) {
      setError('Fecha de nacimiento es requerida');
      return;
    }

    setLoading(true);
    
    try {
      await register({
        username,
        correo: email,
        clave: password,
        clave_confirmacion: passwordConfirm,
        rol: 'CLIENTE',
        nombre,
        apellido,
        fecha_nacimiento: fechaNacimiento,
        telefono
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark shadow-lg">
        <div className="p-6 md:p-8 text-center">
            <h1 className="text-text-light dark:text-text-dark text-2xl md:text-[32px] font-bold leading-tight tracking-tight">Accede a tu cuenta</h1>
            <p className="mt-2 text-subtext-light dark:text-subtext-dark">Bienvenido a Peluquería Canina. Gestiona las citas de tu mascota.</p>
        </div>
        
        <div className="px-6 md:px-8">
            <div className="flex border-b border-border-light dark:border-border-dark">
                <button 
                    onClick={() => {
                      setActiveTab('login');
                      setError('');
                    }}
                    className={`flex-1 pb-3 pt-4 text-sm font-bold border-b-[3px] transition-colors ${activeTab === 'login' ? 'border-primary text-text-light dark:text-text-dark' : 'border-transparent text-subtext-light dark:text-subtext-dark hover:text-text-light'}`}
                >
                    Iniciar Sesión
                </button>
                <button 
                    onClick={() => {
                      setActiveTab('register');
                      setError('');
                    }}
                    className={`flex-1 pb-3 pt-4 text-sm font-bold border-b-[3px] transition-colors ${activeTab === 'register' ? 'border-primary text-text-light dark:text-text-dark' : 'border-transparent text-subtext-light dark:text-subtext-dark hover:text-text-light'}`}
                >
                    Registrarse
                </button>
            </div>
        </div>

        <div className="p-6 md:p-8">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
                {error}
              </div>
            )}

            {activeTab === 'login' ? (
              <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                <label className="flex flex-col">
                    <p className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark">Correo electrónico</p>
                    <input 
                        required
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nombre@email.com" 
                        className="flex h-14 w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-[15px] text-text-light dark:text-text-dark placeholder:text-subtext-light focus:border-primary focus:ring-primary/50 outline-none"
                    />
                </label>
                <label className="flex flex-col">
                    <p className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark">Contraseña</p>
                    <div className="relative flex w-full">
                        <input 
                            required
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Introduce tu contraseña" 
                            className="flex h-14 w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-[15px] pr-12 text-text-light dark:text-text-dark placeholder:text-subtext-light focus:border-primary focus:ring-primary/50 outline-none"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-0 top-0 h-full px-4 text-subtext-light dark:text-subtext-dark hover:text-text-light"
                        >
                            <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                    </div>
                </label>
                
                <a href="#" className="text-right text-sm font-medium text-primary hover:underline">¿Olvidaste tu contraseña?</a>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="mt-2 flex h-12 w-full items-center justify-center rounded-lg bg-primary px-5 text-base font-bold text-text-light hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </form>
            ) : (
              <form className="flex flex-col gap-4" onSubmit={handleRegister}>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col">
                      <p className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark">Nombre *</p>
                      <input 
                          required
                          type="text" 
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          placeholder="Nombre" 
                          className="flex h-14 w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-[15px] text-text-light dark:text-text-dark placeholder:text-subtext-light focus:border-primary focus:ring-primary/50 outline-none"
                      />
                  </label>
                  <label className="flex flex-col">
                      <p className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark">Apellido *</p>
                      <input 
                          required
                          type="text" 
                          value={apellido}
                          onChange={(e) => setApellido(e.target.value)}
                          placeholder="Apellido" 
                          className="flex h-14 w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-[15px] text-text-light dark:text-text-dark placeholder:text-subtext-light focus:border-primary focus:ring-primary/50 outline-none"
                      />
                  </label>
                </div>
                <label className="flex flex-col">
                    <p className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark">Nombre de usuario *</p>
                    <input 
                        required
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="usuario123" 
                        className="flex h-14 w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-[15px] text-text-light dark:text-text-dark placeholder:text-subtext-light focus:border-primary focus:ring-primary/50 outline-none"
                    />
                </label>
                <label className="flex flex-col">
                    <p className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark">Correo electrónico *</p>
                    <input 
                        required
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nombre@email.com" 
                        className="flex h-14 w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-[15px] text-text-light dark:text-text-dark placeholder:text-subtext-light focus:border-primary focus:ring-primary/50 outline-none"
                    />
                </label>
                <label className="flex flex-col">
                    <p className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark">Fecha de Nacimiento *</p>
                    <input 
                        required
                        type="date" 
                        value={fechaNacimiento}
                        onChange={(e) => setFechaNacimiento(e.target.value)}
                        className="flex h-14 w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-[15px] text-text-light dark:text-text-dark placeholder:text-subtext-light focus:border-primary focus:ring-primary/50 outline-none"
                    />
                </label>
                <label className="flex flex-col">
                    <p className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark">Teléfono</p>
                    <input 
                        type="tel" 
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="+34 123 456 789" 
                        className="flex h-14 w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-[15px] text-text-light dark:text-text-dark placeholder:text-subtext-light focus:border-primary focus:ring-primary/50 outline-none"
                    />
                </label>
                <label className="flex flex-col">
                    <p className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark">Contraseña *</p>
                    <div className="relative flex w-full">
                        <input 
                            required
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Introduce tu contraseña" 
                            className="flex h-14 w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-[15px] pr-12 text-text-light dark:text-text-dark placeholder:text-subtext-light focus:border-primary focus:ring-primary/50 outline-none"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-0 top-0 h-full px-4 text-subtext-light dark:text-subtext-dark hover:text-text-light"
                        >
                            <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                    </div>
                </label>
                <label className="flex flex-col">
                    <p className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark">Confirmar Contraseña *</p>
                    <div className="relative flex w-full">
                        <input 
                            required
                            type={showPassword ? 'text' : 'password'}
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            placeholder="Confirma tu contraseña" 
                            className="flex h-14 w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-[15px] pr-12 text-text-light dark:text-text-dark placeholder:text-subtext-light focus:border-primary focus:ring-primary/50 outline-none"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-0 top-0 h-full px-4 text-subtext-light dark:text-subtext-dark hover:text-text-light"
                        >
                            <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                    </div>
                </label>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="mt-2 flex h-12 w-full items-center justify-center rounded-lg bg-primary px-5 text-base font-bold text-text-light hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Registrando...' : 'Registrarse'}
                </button>
              </form>
            )}

            <div className="my-6 flex items-center gap-4">
                <hr className="flex-grow border-t border-border-light dark:border-border-dark"/>
                <span className="text-sm text-subtext-light dark:text-subtext-dark">O</span>
                <hr className="flex-grow border-t border-border-light dark:border-border-dark"/>
            </div>

            <button className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-5 text-base font-medium text-text-light dark:text-text-dark hover:bg-border-light dark:hover:bg-white/5 transition-colors">
                <img alt="Google logo" className="h-6 w-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAF8qXbYvTxVLb2FiqoHUpnUexOmGadrWP0HgZcaIywZimCJWYpLFAmMimmaV8M66jFErqhi8JqpZyw4t9ov-iXRC3yVn4607xhkOk6ETI0GFIg_HgqZxsq2GloTZ5a9KjhskAagXr28hgrW7UzYG0TTh6s6CbN6N40byCTG4o3Tt3wurGeiWBYyAO7MEOUwdtDAis0SBHhyuGSe6XTfUl_g69GczKBC6rPgdS0OheODQqV0tOK3BRmUc6hQ665Lrx-KNVFYRklNfc"/>
                <span>Continuar con Google</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
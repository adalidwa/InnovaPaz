import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import {
  loginToERP,
  checkActiveSession,
  redirectToMarketing,
  checkMarketingSession,
} from '../services/authService';
import { signInWithGoogleERP } from '../services/googleAuthService';
import { useUser } from '../hooks/useContextBase';
import GoogleButton from '../components/GoogleButton';
import logoInnovaPaz from '../../../assets/icons/logoInnovaPaz.svg';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // 1. Verificar sesión activa del ERP
        const userData = await checkActiveSession();
        if (userData && userData.empresa_id) {
          navigate('/configuracion');
          return;
        }

        // 2. Si no hay sesión del ERP, verificar sesión del marketing
        const marketingUserData = await checkMarketingSession();
        if (marketingUserData && marketingUserData.empresa_id) {
          // Autenticar automáticamente y redirigir
          login(marketingUserData, localStorage.getItem('token') || '');
          // Limpiar cualquier flag de redirección
          localStorage.removeItem('redirectToERP');
          navigate('/configuracion');
          return;
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate, login]);

  // Autocomplete de email similar al marketing
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    // Autocompleta dominio
    if (/^[^\s@]+@g$/.test(val)) {
      val = val.replace(/@g$/, '@gmail.com');
    } else if (/^[^\s@]+@o$/.test(val)) {
      val = val.replace(/@o$/, '@outlook.com');
    } else if (/^[^\s@]+@h$/.test(val)) {
      val = val.replace(/@h$/, '@hotmail.com');
    }

    // Bloquea escritura después del dominio
    const dominios = ['@gmail.com', '@outlook.com', '@hotmail.com'];
    for (const dominio of dominios) {
      const idx = val.indexOf(dominio);
      if (idx !== -1 && val.length > idx + dominio.length) {
        val = val.slice(0, idx + dominio.length);
      }
    }

    setEmail(val);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await loginToERP(email.trim().toLowerCase(), password);
      if (result.success && result.usuario && result.usuario.empresa_id) {
        login(result.usuario, result.token);
        navigate('/configuracion');
      } else {
        setError('Usuario sin empresa asociada. Regístrate desde el sitio web.');
      }
    } catch (err: any) {
      if (err.message.includes('Usuario sin empresa asociada')) {
        setError('Usuario sin empresa asociada.');
      } else if (err.message.includes('Usuario no encontrado')) {
        setError('Usuario no encontrado en el sistema.');
      } else if (err.message.includes('Credenciales incorrectas')) {
        setError('Email o contraseña incorrectos.');
      } else {
        setError('Error al iniciar sesión. Verifica tus credenciales.');
      }
    }

    setLoading(false);
  };

  const handleRegisterRedirect = () => {
    redirectToMarketing('/'); // Redirigir al home en lugar de /register
  };

  // Nuevo: Login con Google
  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const result = await signInWithGoogleERP();

      if (!result.success) {
        // Solo mostrar error, no redirigir automáticamente
        if (result.error && result.error.includes('Usuario no encontrado')) {
          setError('Usuario no encontrado en el sistema.');
        } else {
          setError(result.error || 'Error al iniciar sesión con Google');
        }
        setLoading(false);
        return;
      }

      if (result.usuario && result.usuario.empresa_id) {
        login(result.usuario, result.token || '');
        navigate('/configuracion');
      } else {
        setError('Usuario sin empresa asociada.');
      }
    } catch (error: any) {
      console.error('Error en Google login:', error);
      // Solo mostrar error, no redirigir automáticamente
      if (
        error.message &&
        (error.message.includes('Usuario no encontrado') || error.message.includes('sin empresa'))
      ) {
        setError('Usuario no registrado en el sistema.');
      } else {
        setError(error.message || 'Error inesperado. Inténtalo más tarde.');
      }
    }

    setLoading(false);
  };

  if (checkingSession) {
    return (
      <div className='login-container'>
        <div className='login-card'>
          <div className='loading-spinner'>
            <p>Verificando sesión...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='login-container'>
      <div className='login-card'>
        <div className='login-header'>
          <div className='login-logo'>
            <img src={logoInnovaPaz} alt='InnovaPaz Logo' className='login-logo-icon' />
            <div className='login-logo-text'>
              <span className='innovapaz-text'>INNOVAPAZ</span>{' '}
              <span className='erp-text'>ERP</span>
            </div>
          </div>
          <h1>Iniciar Sesión</h1>
          <p>Inicia sesión en tu cuenta empresarial</p>
        </div>

        <form onSubmit={handleLogin} className='login-form'>
          <div className='form-group'>
            <label htmlFor='email'>Correo electrónico</label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={handleEmailChange}
              placeholder='ejemplo@empresa.com'
              required
              disabled={loading}
              autoComplete='email'
            />
          </div>

          <div className='form-group'>
            <label htmlFor='password'>Contraseña</label>
            <div className='password-input-wrapper'>
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Contraseña'
                required
                disabled={loading}
                autoComplete='current-password'
              />
              <button
                type='button'
                className='password-toggle'
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className='error-message'>
              <span>{error}</span>
              {(error.includes('Usuario sin empresa') ||
                error.includes('Usuario no encontrado') ||
                error.includes('Usuario no registrado')) && (
                <button
                  type='button'
                  onClick={() => redirectToMarketing('/')}
                  className='register-link'
                >
                  Registrarte en el sitio web
                </button>
              )}
            </div>
          )}

          <button type='submit' disabled={loading} className='login-button'>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className='login-divider'>
          <span>o</span>
        </div>

        <GoogleButton onClick={handleGoogleLogin} disabled={loading} variant='login' />

        <div className='login-footer'>
          <p>¿No tienes cuenta empresarial?</p>
          <button onClick={handleRegisterRedirect} className='register-button'>
            Registrate en el sitio web
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useState } from 'react';
import Input from '../components/common/Input';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Button from '../components/common/Button';
import illustrationPicture from '../assets/icons/illustrationPicture.svg';
import Logo from '../components/ui/Logo';
import GoogleButton from '../components/common/GoogleButton';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import {
  loginWithBackend,
  saveUserSession,
  buildERPRedirectUrl,
} from '../services/auth/backendAuthService';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para manejar el login usando el backend coordinador
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password; // (podrías trim si sabes que no lleva espacios válidos)

    try {
      const result = await loginWithBackend({ email: cleanEmail, password: cleanPassword });
      console.log('[LOGIN][DEBUG] Respuesta backend:', result);

      if (result.success && result.data) {
        saveUserSession(result.data.user, result.data.token);
        const redirectUrl = buildERPRedirectUrl(result.data.user);
        console.log('[LOGIN][DEBUG] Redirigiendo a:', redirectUrl);
        window.location.href = redirectUrl;
      } else {
        const errorCode = (result as any).code;
        if (errorCode === 'USER_NOT_FOUND' || errorCode === 'USER_NOT_FOUND_DB') {
          setError('Usuario no existe en PostgreSQL. Regístrate o sincroniza primero.');
        } else if (errorCode === 'INVALID_PASSWORD') {
          setError('Contraseña incorrecta.');
        } else if (errorCode === 'MISSING_TOKEN') {
          setError('Falta token de autenticación (flujo Firebase incompleto).');
        } else {
          setError(result.message || 'Credenciales no válidas.');
        }
      }
    } catch (err: any) {
      console.error('[LOGIN][ERROR] Excepción:', err);
      if (err?.message?.includes('Failed to fetch') || err?.message?.includes('Network')) {
        setError(
          'No se puede conectar al backend (puerto 4000). Verifica que el servidor esté encendido.'
        );
      } else {
        setError('Error inesperado. Inténtalo más tarde.');
      }
    }

    setLoading(false);
  };

  // TODO: Implementar Google login con backend coordinador
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Por ahora mostrar mensaje de que está en desarrollo
      setError('Login con Google estará disponible pronto. Usa email y contraseña.');

      // Cuando esté listo, debería ser algo así:
      // const result = await loginWithGoogleBackend();
      // if (result.success && result.data) {
      //   saveUserSession(result.data.user, result.data.token);
      //   const redirectUrl = buildERPRedirectUrl(result.data.user);
      //   window.location.href = redirectUrl;
      // }
    } catch (err) {
      setError('Error inesperado. Inténtalo más tarde.');
      console.error('Error en handleGoogleLogin:', err);
    }

    setLoading(false);
  };

  return (
    <div className='login-bg'>
      <div className='login-illustration'>
        <div className='login-badge'>
          <Logo text='INNOVAPAZ' size='medium' variant='white' />
        </div>
        <img
          src={illustrationPicture}
          alt='Ilustración INNOVAPAZ'
          className='login-illustration-img'
        />
      </div>

      <div className='login-box'>
        <h1 className='login-title'>Iniciar Sesión</h1>
        <p className='login-subtitle'>Bienvenido a InnovaPaz ¡Qué bueno verte de nuevo!</p>
        <form className='login-form' onSubmit={handleLogin}>
          <Input
            id='loginEmail'
            name='email'
            label='Correo electrónico'
            placeholder='ejemplo@email.com'
            type='email'
            validate='email'
            containerWidth='full'
            size='medium'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            labelFontSize='16px'
          />

          <Input
            id='loginPassword'
            name='password'
            label='Contraseña'
            placeholder='Contraseña'
            type='password'
            showTogglePassword
            showPasswordIcon={FaEye}
            hidePasswordIcon={FaEyeSlash}
            containerWidth='full'
            size='medium'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            labelFontSize='16px'
          />

          <div className='login-forgot'>
            <span className='login-forgot-text'>¿Olvidaste tu contraseña?</span>
          </div>

          <div>
            <Button
              title={loading ? 'Iniciando...' : 'Iniciar Sesión'}
              backgroundColor='var(--bg-100)'
              textColor='var(--pri-900)'
              hasBackground={true}
              borderColor='transparent'
              titleFontWeight='normal'
              containerWidth='full'
              height='small'
              disabled={loading}
            />
          </div>

          <div>
            <GoogleButton
              label='Iniciar sesión con Google'
              onClick={handleGoogleLogin}
              disabled={loading}
            />
          </div>

          {error && <p className='error-message'>{error}</p>}

          <div className='login-footer'>
            <span className='login-footer-text'>¿No tienes cuenta?</span>
            <span className='login-footer-link' onClick={() => navigate('/register')}>
              Crear una cuenta
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

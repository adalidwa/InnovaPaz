import React, { useState } from 'react';
import Input from '../components/common/Input';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Button from '../components/common/Button';
import illustrationPicture from '../assets/icons/illustrationPicture.svg';
import Logo from '../components/ui/Logo';
import GoogleButton from '../components/common/GoogleButton';
import './LoginPage.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginWithBackend } from '../services/auth/sessionService';
import { signInWithGoogleBackend } from '../services/auth/googleAuthService';
import { useUser } from '../context/UserContext';
import { redirectToERP } from '../configs/appConfig';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planSeleccionado = searchParams.get('plan');
  useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para manejar el login usando Firebase + Backend
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await loginWithBackend(email.trim().toLowerCase(), password);
      if (result && result.userData) {
        console.log('Usuario logueado desde PostgreSQL:', result.userData);

        // Si viene de un plan y no tiene empresa, ir a company-setup
        if (planSeleccionado && !result.userData.empresa_id) {
          console.log('🏢 Usuario desde plan sin empresa, redirigiendo a company-setup');
          navigate(`/company-setup?plan=${planSeleccionado}`);
        }
        // Si viene de un plan y ya tiene empresa, ir al ERP
        else if (planSeleccionado && result.userData.empresa_id) {
          console.log('✅ Usuario desde plan con empresa, redirigiendo al ERP');
          redirectToERP();
        }
        // Si NO viene de un plan (header/exploración), quedarse en homepage
        else if (!planSeleccionado) {
          console.log('🏠 Usuario desde header, manteniéndose en website para explorar');
          navigate('/'); // Quedarse en homepage independientemente si tiene empresa o no
        }
      } else {
        setError('Credenciales no válidas.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error inesperado al iniciar sesión. Inténtalo más tarde.');
    }

    setLoading(false);
  };

  // Login con Google usando el nuevo servicio
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithGoogleBackend();

      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión con Google');
        setLoading(false);
        return;
      }

      // Guardar token en localStorage para mantener sesión
      if (result.token) {
        localStorage.setItem('authToken', result.token);
      }

      console.log('Usuario logueado con Google:', result.usuario);

      // Si viene de un plan y necesita configurar empresa
      if (planSeleccionado && result.needsCompanySetup) {
        console.log(
          '🏢 Usuario desde plan necesita configurar empresa, redirigiendo a company-setup'
        );
        navigate(`/company-setup?plan=${planSeleccionado}`);
      }
      // Si viene de un plan y ya no necesita configurar empresa
      else if (planSeleccionado && !result.needsCompanySetup) {
        console.log('✅ Usuario desde plan completo, redirigiendo al ERP');
        redirectToERP();
      }
      // Si NO viene de un plan (header/exploración)
      else if (!planSeleccionado) {
        console.log('🏠 Usuario desde header, manteniéndose en website para explorar');
        navigate('/'); // Quedarse en homepage independientemente si tiene empresa o no
      }
    } catch (error: any) {
      console.error('Error en Google login:', error);
      setError(error.message || 'Error inesperado. Inténtalo más tarde.');
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

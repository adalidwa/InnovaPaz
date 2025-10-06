import React, { useState } from 'react';
import Input from '../components/common/Input';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Button from '../components/common/Button';
import illustrationPicture from '../assets/icons/illustrationPicture.svg';
import Logo from '../components/ui/Logo';
import GoogleButton from '../components/common/GoogleButton';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../services/auth/firebaseAuthService';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../configs/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { buildERPUrl } from '../configs/appConfig';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para verificar si el usuario tiene empresa configurada y redirigir apropiadamente
  const checkUserAndRedirect = async (user: any) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.empresa_id && userData.setup_completed) {
          // Usuario ya tiene empresa configurada, va al ERP
          window.location.href = buildERPUrl();
        } else {
          // Usuario necesita configurar empresa
          navigate('/company-setup');
        }
      } else {
        // Usuario nuevo, necesita configurar empresa
        navigate('/company-setup');
      }
    } catch (err) {
      console.error('Error checking user data:', err);
      // En caso de error, va al home para no romper el flujo
      navigate('/');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { user, error } = await signInWithGoogle();
      if (user) {
        // Usuario logueado con Google, verificar si tiene empresa configurada
        await checkUserAndRedirect(user);
      } else {
        setError('Error al iniciar sesión con Google');
        console.error(error);
      }
    } catch (err) {
      setError('Error inesperado. Inténtalo más tarde.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Usuario logueado, verificar si tiene empresa configurada
      await checkUserAndRedirect(userCredential.user);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No existe una cuenta con ese correo.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Contraseña incorrecta.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Correo inválido.');
      } else {
        setError('Error al iniciar sesión. ' + (err.message || 'Inténtalo de nuevo.'));
      }
      console.error(err);
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

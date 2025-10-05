import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Input from '../components/common/Input.tsx';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Button from '../components/common/Button.tsx';
import illustrationPicture from '@/assets/icons/illustrationPicture.svg';
import Logo from '../components/ui/Logo';
import GoogleButton from '../components/common/GoogleButton';
import './RegisterPage.css';
import { signInWithGoogle } from '../services/auth/firebaseAuthService';
import { registerUser, registerUserAndCompany } from '../services/auth/registerService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../configs/firebaseConfig';
import BusinessTypeSelect from '../components/common/BusinessTypeSelect';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../configs/firebaseConfig';
import { buildERPUrl } from '../configs/appConfig';

const getPlanDisplayName = (plan: string | null) => {
  switch (plan) {
    case 'basico':
      return 'Básico';
    case 'profesional':
      return 'Profesional';
    case 'empresarial':
      return 'Empresarial';
    default:
      return '';
  }
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planSeleccionado = searchParams.get('plan');
  const [isNavigating, setIsNavigating] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && planSeleccionado && !isNavigating && !authChecked) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();

            if (userData.empresa_id && userData.setup_completed) {
              console.log('Usuario ya tiene empresa configurada, redirigiendo al ERP');
              setIsNavigating(true);
              window.location.href = buildERPUrl();
              return;
            }
          }

          console.log('Usuario necesita completar setup, redirigiendo a company-setup');
          setTimeout(() => {
            if (!isNavigating) {
              setIsNavigating(true);
              navigate(`/company-setup?plan=${planSeleccionado}`);
            }
          }, 400);
        } catch (error) {
          console.error('Error verificando datos del usuario:', error);
        }
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, [navigate, planSeleccionado, isNavigating, authChecked]);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [tipoNegocio, setTipoNegocio] = useState('ferreteria');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const businessOptions = [
    { value: 'ferreteria', label: 'Ferretería' },
    { value: 'licoreria', label: 'Licorería' },
    { value: 'minimarket', label: 'Minimarket' },
  ];

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!nombre || !email || !password || !confirmPassword) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (planSeleccionado && !nombreEmpresa) {
      setError('Por favor, ingresa el nombre de tu empresa.');
      return;
    }

    setLoading(true);

    try {
      if (planSeleccionado) {
        const { user, error } = await registerUserAndCompany({
          nombreCompleto: nombre,
          email,
          password,
          nombreEmpresa,
          tipoNegocio,
          planId: planSeleccionado,
        });
        if (user) {
          setSuccess('¡Cuenta y empresa creadas exitosamente!');
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          const firebaseError = error as { code?: string; message?: string };
          if (firebaseError?.code === 'auth/email-already-in-use') {
            setError(
              'El correo electrónico ya está registrado. Intenta iniciar sesión o usa otro correo.'
            );
          } else {
            setError(
              'Error al crear la cuenta. ' + (firebaseError?.message || 'Inténtalo de nuevo.')
            );
          }
        }
      } else {
        const { user, error } = await registerUser(nombre, email, password);
        if (user) {
          setSuccess('¡Cuenta creada exitosamente!');
          setTimeout(() => navigate('/'), 1500);
        } else {
          const firebaseError = error as { code?: string; message?: string };
          if (firebaseError?.code === 'auth/email-already-in-use') {
            setError(
              'El correo electrónico ya está registrado. Intenta iniciar sesión o usa otro correo.'
            );
          } else {
            setError(
              'Error al crear la cuenta. ' + (firebaseError?.message || 'Inténtalo de nuevo.')
            );
          }
        }
      }
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        setError(
          'El correo electrónico ya está registrado. Intenta iniciar sesión o usa otro correo.'
        );
      } else {
        setError('Error inesperado. Inténtalo más tarde.');
      }
    }

    setLoading(false);
  };

  const handleGoogleRegister = async () => {
    if (isNavigating) return;

    setLoading(true);
    setError(null);

    try {
      const { user } = await signInWithGoogle();

      if (user && !isNavigating) {
        if (planSeleccionado) {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();

            if (userData.empresa_id && userData.setup_completed) {
              setSuccess('¡Bienvenido de vuelta!');
              setIsNavigating(true);
              setTimeout(() => navigate('/dashboard'), 1000);
            } else {
              setSuccess('¡Registro exitoso! Completa los datos de tu empresa.');
              setIsNavigating(true);
              setTimeout(() => navigate(`/company-setup?plan=${planSeleccionado}`), 1000);
            }
          } else {
            setSuccess('¡Registro exitoso! Completa los datos de tu empresa.');
            setIsNavigating(true);
            setTimeout(() => navigate(`/company-setup?plan=${planSeleccionado}`), 1000);
          }
        } else {
          setSuccess('¡Registro exitoso!');
          setIsNavigating(true);
          setTimeout(() => navigate('/'), 1000);
        }
      } else {
        setError('Error al registrar con Google. Inténtalo de nuevo.');
      }
    } catch (err) {
      console.error('Error en Google register:', err);
      setError('Error inesperado. Inténtalo más tarde.');
    }

    setLoading(false);
  };

  return (
    <div className='register-bg'>
      <div className='register-illustration'>
        <div className='register-badge'>
          <Logo text='INNOVAPAZ' size='medium' variant='white' />
        </div>
        <img
          src={illustrationPicture}
          alt='Ilustración INNOVAPAZ'
          className='register-illustration-img'
        />
      </div>
      <div className='register-box'>
        <h1 className='register-title'>
          {planSeleccionado
            ? step === 1
              ? `Finaliza tu registro para el Plan ${getPlanDisplayName(planSeleccionado)}`
              : 'Cuéntanos sobre tu negocio'
            : 'Crear una cuenta'}
        </h1>
        <p className='register-subtitle'>
          {planSeleccionado
            ? step === 1
              ? 'Comienza a simplificar la gestión de tu empresa en solo unos minutos'
              : 'Solo necesitamos algunos datos sobre tu empresa para continuar'
            : 'Comienza a simplificar la gestión de tu empresa en solo unos minutos'}
        </p>
        <form
          className='register-form'
          onSubmit={planSeleccionado ? (step === 1 ? handleNextStep : handleSubmit) : handleSubmit}
        >
          {(!planSeleccionado || step === 1) && (
            <>
              <Input
                id='registerFirstName'
                name='firstName'
                label='Nombre'
                placeholder='Tu nombre'
                type='text'
                containerWidth='full'
                size='medium'
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <Input
                id='registerEmail'
                name='email'
                label='Correo electrónico'
                placeholder='ejemplo@email.com'
                type='email'
                validate='email'
                containerWidth='full'
                size='medium'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                id='registerPassword'
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
              />
              <Input
                id='registerConfirmPassword'
                name='confirmPassword'
                label='Confirma tu contraseña'
                placeholder='Confirma tu contraseña'
                type='password'
                showTogglePassword
                showPasswordIcon={FaEye}
                hidePasswordIcon={FaEyeSlash}
                containerWidth='full'
                size='medium'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div>
                <Button
                  title={
                    planSeleccionado ? 'Siguiente' : loading ? 'Creando cuenta...' : 'Crear cuenta'
                  }
                  backgroundColor='var(--bg-100)'
                  textColor='var(--pri-900)'
                  hasBackground={true}
                  borderColor='transparent'
                  titleFontWeight='normal'
                  containerWidth='full'
                  height='large'
                  disabled={loading}
                />
              </div>
              <div>
                <GoogleButton
                  label='Registrarse con Google'
                  onClick={handleGoogleRegister}
                  disabled={loading}
                />
              </div>
            </>
          )}

          {planSeleccionado && step === 2 && (
            <>
              <Input
                id='nombreEmpresa'
                name='nombreEmpresa'
                label='Nombre de la Empresa'
                placeholder='Nombre de tu empresa'
                type='text'
                containerWidth='full'
                size='medium'
                value={nombreEmpresa}
                onChange={(e) => setNombreEmpresa(e.target.value)}
              />
              <div style={{ marginBottom: '20px' }}>
                <label
                  htmlFor='tipoNegocio'
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: 'var(--text-primary)',
                    fontWeight: '500',
                  }}
                >
                  Tipo de Negocio
                </label>
                <BusinessTypeSelect
                  id='tipoNegocio'
                  value={tipoNegocio}
                  onChange={(e) => setTipoNegocio(e.target.value)}
                  disabled={loading}
                  theme='dark'
                  size='medium'
                  options={businessOptions}
                  textColor='var(--pri-100)'
                  optionTextColor='var(--pri-100)'
                  optionBackgroundColor='var(--pri-900)'
                />
              </div>
              <div>
                <Button
                  title={loading ? 'Creando cuenta...' : 'Crear Cuenta y Configurar Empresa'}
                  backgroundColor='var(--bg-100)'
                  textColor='var(--pri-900)'
                  hasBackground={true}
                  borderColor='transparent'
                  titleFontWeight='normal'
                  containerWidth='full'
                  height='large'
                  disabled={loading}
                />
              </div>
            </>
          )}

          {error && <p className='error-message'>{error}</p>}
          {success && <p className='success-message'>{success}</p>}

          <div className='register-footer'>
            <span className='register-footer-text'>¿Ya tienes cuenta?</span>
            <span className='register-footer-link' onClick={() => navigate('/login')}>
              Inicia Sesión
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Input from '../components/common/Input.tsx';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Button from '../components/common/Button.tsx';
import illustrationPicture from '@/assets/icons/illustrationPicture.svg';
import Logo from '../components/ui/Logo';
import GoogleButton from '../components/common/GoogleButton';
import './RegisterPage.css';
import { signInWithGoogleBackend } from '../services/auth/googleAuthService';
import { registerWithBackend } from '../services/auth/sessionService';
import { getPlanId, getBusinessTypeId, businessTypeToSlug } from '../services/auth/companyService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../configs/firebaseConfig';
import BusinessTypeSelect from '../components/common/BusinessTypeSelect';
import { redirectToERP, buildApiUrl } from '../configs/appConfig';
import { getBusinessTypes, type BusinessType } from '../services/api/businessTypesService';

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

  // Estados existentes
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

  // Nuevos estados para datos dinámicos
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [businessTypesLoading, setBusinessTypesLoading] = useState(true);

  // Cargar tipos de empresa desde el backend
  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const types = await getBusinessTypes();
        setBusinessTypes(types);
        // Establecer el primer tipo como default
        if (types.length > 0 && !tipoNegocio) {
          setTipoNegocio(businessTypeToSlug(types[0].tipo_empresa));
        }
      } catch (error) {
        console.error('Error cargando tipos de empresa:', error);
      } finally {
        setBusinessTypesLoading(false);
      }
    };

    fetchBusinessTypes();
  }, [tipoNegocio]);

  // Convertir tipos de empresa de la BD a opciones para el select
  const businessOptions = businessTypes.map((type) => ({
    value: businessTypeToSlug(type.tipo_empresa),
    label: type.tipo_empresa,
  }));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && planSeleccionado && !isNavigating && !authChecked) {
        try {
          console.log('[REGISTER][CHECK] Consultando backend check-company...');
          const resp = await fetch(buildApiUrl(`/api/users/check-company/${user.uid}`));
          const result = await resp.json();
          console.log('[REGISTER][CHECK] Respuesta:', result);

          if (result.success && result.data.tiene_empresa) {
            console.log('Usuario ya tiene empresa configurada (PostgreSQL), redirigiendo al ERP');
            setIsNavigating(true);
            redirectToERP();
            return;
          }

          console.log('Usuario necesita completar setup, redirigiendo a company-setup');
          setTimeout(() => {
            if (!isNavigating) {
              setIsNavigating(true);
              navigate(`/company-setup?plan=${planSeleccionado}`);
            }
          }, 400);
        } catch (error) {
          console.error('[REGISTER][CHECK] Error verificando empresa en backend:', error);
        }
      }
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, [navigate, planSeleccionado, isNavigating, authChecked]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validaciones para el primer paso
    if (!nombre) {
      setError('El nombre es obligatorio.');
      return;
    }
    if (!email) {
      setError('El correo electrónico es obligatorio.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('El correo electrónico no es válido.');
      return;
    }
    if (!password) {
      setError('La contraseña es obligatoria.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!confirmPassword) {
      setError('Debes confirmar tu contraseña.');
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

    // Validaciones para el segundo paso (empresa)
    if (planSeleccionado && !nombreEmpresa) {
      setError('Por favor, ingresa el nombre de tu empresa.');
      return;
    }
    if (planSeleccionado && !tipoNegocio) {
      setError('Por favor, selecciona el tipo de negocio.');
      return;
    }

    // Validaciones previas
    if (!email || !password || !nombre) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }
    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('El correo electrónico no es válido.');
      return;
    }
    // Validación de longitud de contraseña
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      if (planSeleccionado) {
        // Flujo con plan: usar el endpoint /api/auth/register con empresa_data
        const registrationData = {
          email: email.trim().toLowerCase(),
          password,
          nombre_completo: nombre,
          empresa_data: {
            nombre: nombreEmpresa,
            tipo_empresa_id: getBusinessTypeId(tipoNegocio),
            plan_id: getPlanId(planSeleccionado),
          },
        };

        const result = await registerWithBackend(registrationData);

        if (result.usuario) {
          setSuccess('¡Empresa y cuenta creadas exitosamente!');
          setTimeout(() => {
            // Redirigir al dashboard del ERP
            redirectToERP();
          }, 1500);
        } else {
          setError('Error creando la empresa.');
        }
      } else {
        // Flujo normal: solo crear usuario con el backend (sin empresa)
        const registrationData = {
          email: email.trim().toLowerCase(),
          password,
          nombre_completo: nombre,
        };

        const result = await registerWithBackend(registrationData);

        if (result.usuario) {
          setSuccess('¡Cuenta creada exitosamente! Puedes seguir explorando.');
          setTimeout(() => navigate('/'), 1500); // Ir al homepage para explorar
        } else {
          setError('Error al crear la cuenta.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Error inesperado al registrar usuario. Inténtalo más tarde.');
    }

    setLoading(false);
  };

  const handleGoogleRegister = async () => {
    if (isNavigating) return;

    setLoading(true);
    setError(null);

    try {
      // Preparar empresa_data si estamos en step 2 y hay plan seleccionado
      let empresaData = undefined;

      if (planSeleccionado && step === 2 && nombreEmpresa && tipoNegocio) {
        // Usuario completó el formulario de empresa antes de hacer clic en Google
        empresaData = {
          nombre: nombreEmpresa,
          tipo_empresa_id: getBusinessTypeId(tipoNegocio),
          plan_id: getPlanId(planSeleccionado),
        };
      }

      const result = await signInWithGoogleBackend(empresaData);

      if (!result.success) {
        setError(result.error || 'Error en registro con Google');
        setLoading(false);
        return;
      }

      // Guardar token en localStorage para mantener sesión
      if (result.token) {
        localStorage.setItem('authToken', result.token);
      }

      if (planSeleccionado) {
        // Si viene de un plan específico
        if (result.needsCompanySetup) {
          // Usuario aún necesita configurar empresa
          setSuccess('¡Registro exitoso! Completa los datos de tu empresa.');
          setIsNavigating(true);
          setTimeout(() => navigate(`/company-setup?plan=${planSeleccionado}`), 800);
        } else {
          // Usuario ya tiene empresa configurada (datos enviados o ya existía)
          setSuccess('¡Bienvenido de vuelta!');
          setIsNavigating(true);
          setTimeout(() => redirectToERP(), 600);
        }
      } else {
        // Si NO viene de un plan (header/exploración)
        if (result.needsCompanySetup) {
          setSuccess('¡Registro exitoso! Puedes seguir explorando.');
          setIsNavigating(true);
          setTimeout(() => navigate('/'), 800); // Ir al homepage para explorar
        } else {
          setSuccess('¡Bienvenido! Redirigiendo al ERP.');
          setIsNavigating(true);
          setTimeout(() => redirectToERP(), 800);
        }
      }
    } catch (error: any) {
      console.error('Error en Google register:', error);
      setError(error.message || 'Error inesperado. Inténtalo más tarde.');
    }

    setLoading(false);
  };

  // Mostrar loading si aún se están cargando los tipos de empresa
  if (businessTypesLoading) {
    return <div>Cargando tipos de empresa...</div>;
  }

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
                  options={businessOptions} // Usar las opciones dinámicas
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

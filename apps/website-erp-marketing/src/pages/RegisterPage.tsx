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
import { registerUser } from '../services/auth/registerService';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../configs/firebaseConfig';
import BusinessTypeSelect from '../components/common/BusinessTypeSelect';
import { redirectToERP, buildApiUrl } from '../configs/appConfig';

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

  // Helpers para IDs usados por PostgreSQL (duplicados aquí para no depender de CompanySetupPage)
  const getBusinessTypeId = (tipo: string) => {
    switch (tipo) {
      case 'ferreteria':
        return 1;
      case 'licoreria':
        return 2;
      case 'minimarket':
        return 3;
      default:
        return 1;
    }
  };
  const getPlanId = (plan: string | null) => {
    switch (plan) {
      case 'basico':
        return 1;
      case 'profesional':
        return 2;
      case 'empresarial':
        return 3;
      default:
        return 1;
    }
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
        const { user: createdUser, error: regError } = await registerUser(nombre, email, password);

        if (regError) {
          const firebaseError = regError as { code?: string; message?: string };
          if (firebaseError?.code === 'auth/email-already-in-use') {
            setError('El correo ya está registrado. Usa otro o inicia sesión.');
          } else {
            setError('Error creando usuario: ' + (firebaseError?.message || 'Inténtalo de nuevo.'));
          }
          setLoading(false);
          return;
        }

        if (createdUser) {
          console.log('🔥 [REGISTER][FRONTEND] Usuario Firebase creado:', createdUser.uid);

          // 🔄 NUEVO: sincronizar usuario en PostgreSQL antes del setup de empresa
          try {
            console.log('🔄 [REGISTER][FRONTEND] Enviando sync a backend:', {
              firebase_uid: createdUser.uid,
              email: createdUser.email,
              nombre_completo: nombre,
            });

            const syncResp = await fetch(buildApiUrl('/api/users/sync'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                firebase_uid: createdUser.uid,
                email: createdUser.email,
                nombre_completo: nombre, // ✅ Usar nombre_completo directamente
              }),
            });
            const syncJson = await syncResp.json();
            console.log('✅ [REGISTER][FRONTEND] Respuesta sync backend:', syncJson);

            if (!syncJson.success) {
              setError('No se pudo sincronizar usuario en backend.');
              setLoading(false);
              return;
            }
          } catch (syncErr) {
            console.error('❌ [REGISTER][FRONTEND] Error sync usuario:', syncErr);
            setError('Error sincronizando usuario en backend.');
            setLoading(false);
            return;
          }

          // Crear empresa + relación en PostgreSQL
          try {
            console.log('🏢 [REGISTER][FRONTEND] Enviando setup empresa a backend:', {
              firebase_uid: createdUser.uid,
              empresa_nombre: nombreEmpresa,
              tipo_empresa_id: getBusinessTypeId(tipoNegocio),
              plan_id: getPlanId(planSeleccionado),
            });

            const response = await fetch(buildApiUrl('/api/companies/setup'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                firebase_uid: createdUser.uid,
                empresa_nombre: nombreEmpresa,
                tipo_empresa_id: getBusinessTypeId(tipoNegocio),
                plan_id: getPlanId(planSeleccionado),
              }),
            });

            if (!response.ok) {
              console.error('❌ [REGISTER][FRONTEND] Error HTTP setup empresa:', response.status);
              if (response.status === 404) {
                setError('Endpoint /api/companies/setup (404). Revisa rutas backend.');
              } else if (response.status === 401) {
                setError('No autorizado al configurar empresa. Verifica backend.');
              } else {
                setError(`Error backend (${response.status}).`);
              }
              setLoading(false);
              return;
            }

            const json = await response.json();
            console.log('✅ [REGISTER][FRONTEND] Respuesta setup empresa backend:', json);

            if (json.success) {
              // 🚀 Guardar datos completos en localStorage
              const erpData = {
                uid: createdUser.uid,
                email: createdUser.email,
                nombre_completo: nombre,
                empresa_id: json.data.empresa_id,
                empresa_nombre: nombreEmpresa,
                rol_id: json.data.rol_id,
                nombre_rol: 'Administrador',
                setup_completed: json.data.setup_completed ?? true,
                timestamp: Date.now(),
              };
              localStorage.setItem('erp_user_data', JSON.stringify(erpData));
              console.log('💾 [REGISTER][FRONTEND] Datos guardados en localStorage:', erpData);
              setSuccess('¡Cuenta y empresa creadas exitosamente!');
              setTimeout(() => redirectToERP(), 800);
            } else {
              setError(json.message || 'Error creando la empresa en el backend.');
            }
          } catch (beErr: any) {
            console.error('❌ [REGISTER][FRONTEND] Error backend empresa:', beErr);
            if (
              beErr?.message?.includes('Failed to fetch') ||
              beErr?.message?.includes('Network')
            ) {
              setError(
                'No se pudo conectar al backend (puerto 4000). Verifica que esté ejecutándose.'
              );
            } else {
              setError('Error de red creando empresa.');
            }
          }
        }
      } else {
        // Registro básico sin empresa
        const cleanEmail = email.trim().toLowerCase();
        const { user, error } = await registerUser(nombre, cleanEmail, password);
        if (error) {
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
        } else if (user) {
          console.log('[REGISTER][BASIC] Usuario Firebase creado:', user.uid);

          // 🔄 ARREGLAR: Sincronizar con nombre_completo correcto
          try {
            const resp = await fetch(buildApiUrl('/api/users/sync'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                firebase_uid: user.uid,
                email: user.email,
                nombre_completo: nombre, // ✅ Cambiar 'nombre' por 'nombre_completo'
              }),
            });
            if (resp.status === 404) {
              console.warn(
                '[REGISTER][BASIC] Endpoint /api/users/sync no encontrado (404). Verifica backend.'
              );
            } else {
              const json = await resp.json();
              console.log('[REGISTER][BASIC] Respuesta sync usuario:', json);
            }
          } catch (syncErr) {
            console.error('[REGISTER][BASIC] Error sincronizando usuario en backend:', syncErr);
          }
          setSuccess('¡Cuenta creada exitosamente!');
          setTimeout(() => navigate('/'), 1500);
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
          try {
            const resp = await fetch(buildApiUrl(`/api/users/check-company/${user.uid}`));
            if (resp.status === 404) {
              setError('Ruta check-company (404). Revisa backend.');
              setLoading(false);
              return;
            }
            const result = await resp.json();
            console.log('[REGISTER][GOOGLE] check-company:', result);

            if (result.success && result.data.tiene_empresa) {
              setSuccess('¡Bienvenido de vuelta!');
              setIsNavigating(true);
              setTimeout(() => redirectToERP(), 600);
            } else {
              setSuccess('¡Registro exitoso! Completa los datos de tu empresa.');
              setIsNavigating(true);
              setTimeout(() => navigate(`/company-setup?plan=${planSeleccionado}`), 800);
            }
          } catch (err) {
            console.error('[REGISTER][GOOGLE] Error consultando backend:', err);
            setError('Error verificando estado de empresa.');
          }
        } else {
          setSuccess('¡Registro exitoso!');
          setIsNavigating(true);
          setTimeout(() => navigate('/'), 800);
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

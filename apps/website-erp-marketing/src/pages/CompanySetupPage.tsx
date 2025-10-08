import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../configs/firebaseConfig';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Logo from '../components/ui/Logo';
import illustrationPicture from '@/assets/icons/illustrationPicture.svg';
import BusinessTypeSelect from '../components/common/BusinessTypeSelect';
import { buildERPUrl, buildApiUrl } from '../configs/appConfig';
import './CompanySetupPage.css';

const CompanySetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planSeleccionado = searchParams.get('plan');

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [tipoNegocio, setTipoNegocio] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const businessOptions = [
    { value: 'ferreteria', label: 'Ferretería' },
    { value: 'licoreria', label: 'Licorería' },
    { value: 'minimarket', label: 'Minimarket' },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('🛡️ CompanySetup - El Guardia dice:', currentUser?.email || 'Nadie logueado');

      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        console.log('❌ El Guardia dice: No hay nadie logueado, redirigiendo a register');
        navigate('/register');
        return;
      }
      try {
        let checkResponse = await fetch(buildApiUrl(`/api/users/check-company/${currentUser.uid}`));
        if (checkResponse.status === 404) {
          console.warn('[COMPANY_SETUP] Usuario no encontrado en PostgreSQL. Intentando sync...');
          // Intentar sincronizar
          try {
            const syncResp = await fetch(buildApiUrl('/api/users/sync'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                firebase_uid: currentUser.uid,
                email: currentUser.email,
                nombre: currentUser.displayName || 'Sin Nombre',
              }),
            });
            const syncJson = await syncResp.json();
            console.log('[COMPANY_SETUP] Resultado sync:', syncJson);
            if (syncJson.success) {
              // Reintentar check-company
              checkResponse = await fetch(
                buildApiUrl(`/api/users/check-company/${currentUser.uid}`)
              );
            } else {
              console.warn('[COMPANY_SETUP] Sync falló, continuará sin empresa.');
            }
          } catch (syncErr) {
            console.error('[COMPANY_SETUP] Error sincronizando usuario:', syncErr);
          }
        }
        const result = await checkResponse.json();

        if (result.success && (result.data.tiene_empresa || result.data.setup_completed)) {
          console.log('🏢 Usuario ya tiene empresa, redirigiendo al ERP');
          window.location.href = buildERPUrl();
          return;
        }

        console.log('📝 El Coordinador dice: Usuario necesita configurar empresa');
      } catch (error) {
        console.error('💥 Error comunicándose con el Coordinador:', error);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleCompanySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!nombreEmpresa) {
      setError('Por favor, ingresa el nombre de tu empresa.');
      return;
    }

    if (!tipoNegocio) {
      setError('Por favor, selecciona el tipo de negocio.');
      return;
    }

    if (!user) {
      setError('Usuario no autenticado con Firebase.');
      return;
    }

    setSubmitting(true);
    console.log('🔄 Iniciando configuración de empresa...');
    console.log('🛡️ Usuario autenticado por el Guardia (Firebase):', user.uid);

    try {
      const response = await fetch(buildApiUrl('/api/companies/setup'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebase_uid: user.uid,
          empresa_nombre: nombreEmpresa,
          tipo_empresa_id: getBusinessTypeId(tipoNegocio),
          plan_id: getPlanId(planSeleccionado),
        }),
      });

      if (response.status === 404) {
        const txt = await response.text();
        console.warn('[COMPANY_SETUP] 404 detalle:', txt);
        setError(
          'Usuario no sincronizado o ruta /setup no encontrada. Verifica backend y que /api/users/sync se haya ejecutado.'
        );
        setSubmitting(false);
        return;
      }

      const result = await response.json();
      if (result.success) {
        console.log('✅ El Coordinador completó la configuración exitosamente');
        setSuccess('¡Empresa configurada exitosamente! Redirigiendo al sistema ERP...');

        // 🚀 ARREGLAR: Preparar datos COMPLETOS para el ERP dashboard
        const erpData = {
          uid: user.uid,
          email: user.email,
          nombre_completo: user.displayName || 'Sin Nombre', // ✅ Agregar nombre completo
          empresa_id: result.data.empresa_id,
          empresa_nombre: nombreEmpresa, // ✅ Agregar nombre empresa
          rol_id: result.data.rol_id,
          nombre_rol: 'Administrador', // ✅ Agregar nombre del rol
          setup_completed: result.data.setup_completed ?? true,
          timestamp: Date.now(),
        };

        // 📦 Guardar datos para que el ERP los pueda leer
        localStorage.setItem('erp_user_data', JSON.stringify(erpData));
        console.log('[COMPANY_SETUP] Datos guardados en localStorage:', erpData);

        // 🚀 Redirigir al ERP dashboard with parámetros de sesión
        const erpUrl =
          buildERPUrl() + `?setup=true&uid=${user.uid}&empresa=${result.data.empresa_id}`;

        setTimeout(() => {
          console.log('🚀 Redirigiendo a:', erpUrl);
          window.location.href = erpUrl;
        }, 2000);
      } else {
        setError(result.message || 'Error al configurar la empresa.');
      }
    } catch (err) {
      console.error('💥 Error comunicándose con el Coordinador:', err);
      setError('Error al configurar la empresa. Inténtalo de nuevo.');
    }

    setSubmitting(false);
  };

  // Funciones helper para mapear los valores
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

  const getPlanDisplayName = (plan: string | null) => {
    switch (plan) {
      case 'basico':
        return 'Básico';
      case 'profesional':
        return 'Profesional';
      case 'empresarial':
        return 'Empresarial';
      default:
        return 'Básico';
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className='company-setup-bg'>
      <div className='company-setup-illustration'>
        <div className='company-setup-badge'>
          <Logo text='INNOVAPAZ' size='medium' variant='white' />
        </div>
        <img
          src={illustrationPicture}
          alt='Ilustración INNOVAPAZ'
          className='company-setup-illustration-img'
        />
      </div>
      <div className='company-setup-box'>
        <h1 className='company-setup-title'>
          Finalizar registro para el Plan {getPlanDisplayName(planSeleccionado)}
        </h1>
        <p className='company-setup-subtitle'>
          ¡Hola {user.displayName}! Solo necesitamos algunos datos sobre tu empresa para comenzar
        </p>

        <form className='company-setup-form' onSubmit={handleCompanySetup}>
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

          <div className='custom-select-container'>
            <label htmlFor='tipoNegocio'>Tipo de Negocio</label>
            <BusinessTypeSelect
              value={tipoNegocio}
              onChange={(e) => setTipoNegocio(e.target.value)}
              disabled={submitting}
              theme='dark'
              size='medium'
              id='tipoNegocio'
              options={businessOptions}
              textColor='var(--pri-100)'
              optionTextColor='var(--pri-100)'
              optionBackgroundColor='var(--pri-900)'
            />
          </div>

          <div>
            <Button
              title={submitting ? 'Configurando empresa...' : 'Finalizar Configuración'}
              backgroundColor='var(--bg-100)'
              textColor='var(--pri-900)'
              hasBackground={true}
              borderColor='transparent'
              titleFontWeight='normal'
              containerWidth='full'
              height='large'
              disabled={submitting}
            />
          </div>

          {error && <p className='error-message'>{error}</p>}
          {success && <p className='success-message'>{success}</p>}
        </form>
      </div>
    </div>
  );
};

export default CompanySetupPage;

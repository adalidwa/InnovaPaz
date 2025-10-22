import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../configs/firebaseConfig';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Logo from '../components/ui/Logo';
import illustrationPicture from '@/assets/icons/illustrationPicture.svg';
import BusinessTypeSelect from '../components/common/BusinessTypeSelect';
import { buildApiUrl, redirectToERP } from '../configs/appConfig';
import {
  getPlanId,
  getBusinessTypeId,
  getPlanDisplayName,
  businessTypeToSlug,
} from '../services/auth/companyService';
import { completeCompanySetup } from '../services/auth/companySetupService';
import { getBusinessTypes, type BusinessType } from '../services/api/businessTypesService';
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

  // Nuevos estados para datos dinámicos
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [businessTypesLoading, setBusinessTypesLoading] = useState(true);

  // Cargar tipos de empresa desde el backend
  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const types = await getBusinessTypes();
        setBusinessTypes(types);
        // Establecer el primer tipo como default si no hay ninguno seleccionado
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
        // Verificar si el usuario ya tiene empresa configurada
        const checkResponse = await fetch(
          buildApiUrl(`/api/users/check-company/${currentUser.uid}`)
        );

        if (checkResponse.status === 404) {
          console.log(
            '[COMPANY_SETUP] Usuario no encontrado en PostgreSQL, asumiendo que necesita setup.'
          );
        } else if (checkResponse.ok) {
          const result = await checkResponse.json();
          if (result.success && (result.data.tiene_empresa || result.data.setup_completed)) {
            console.log('🏢 Usuario ya tiene empresa, redirigiendo al ERP');
            redirectToERP();
            return;
          }
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

    if (!user || !user.uid) {
      setError('Usuario no autenticado.');
      return;
    }

    setSubmitting(true);
    console.log('🔄 Iniciando configuración de empresa...');

    try {
      const setupData = {
        empresa_data: {
          nombre: nombreEmpresa,
          tipo_empresa_id: getBusinessTypeId(tipoNegocio),
          plan_id: getPlanId(planSeleccionado),
        },
      };

      const result = await completeCompanySetup(setupData);

      if (result.success && result.empresa && result.usuario) {
        console.log('✅ Configuración completada exitosamente');
        console.log('🆕 Usuario actualizado:', result.usuario);

        // Actualizar token y información del usuario en localStorage si viene en la respuesta
        if (result.token && result.usuario) {
          console.log('🔄 Actualizando sesión con nueva información del usuario');
          localStorage.setItem('token', result.token);
          localStorage.setItem('user', JSON.stringify(result.usuario));
        }

        setSuccess('¡Empresa configurada exitosamente! Redirigiendo al sistema ERP...');

        setTimeout(() => {
          console.log('🚀 Redirigiendo al ERP');
          redirectToERP();
        }, 3000); // Dar más tiempo para leer el mensaje
      } else {
        setError(result.error || 'Error al configurar la empresa.');
      }
    } catch (err: any) {
      console.error('💥 Error en configuración:', err);
      setError(err.message || 'Error al configurar la empresa. Inténtalo de nuevo.');
    }

    setSubmitting(false);
  };

  if (loading || businessTypesLoading) {
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
              options={businessOptions} // Usar las opciones dinámicas
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

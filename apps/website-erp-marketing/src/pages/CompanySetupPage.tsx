import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../configs/firebaseConfig';
import { doc, getDoc, runTransaction, collection, serverTimestamp } from 'firebase/firestore';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Logo from '../components/ui/Logo';
import illustrationPicture from '@/assets/icons/illustrationPicture.svg';
import BusinessTypeSelect from '../components/common/BusinessTypeSelect';
import './CompanySetupPage.css';

const CompanySetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planSeleccionado = searchParams.get('plan');

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userDocLoading, setUserDocLoading] = useState(true);
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
      console.log('CompanySetup - Auth state changed:', currentUser?.email || 'No user');

      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        console.log('No user found, redirecting to register');
        navigate('/register');
        return;
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.log('User doc not found, redirecting to register');
          navigate('/register');
          return;
        }

        const userData = userSnap.data();
        console.log('User data:', userData);

        if (userData.empresa_id && userData.setup_completed) {
          console.log('User already has company setup, redirecting to dashboard');
          navigate('/dashboard');
          return;
        }

        console.log('User needs company setup, staying on page');
        setUserDocLoading(false);
      } catch (error) {
        console.error('Error checking user data:', error);
        setUserDocLoading(false);
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
      setError('Usuario no autenticado.');
      return;
    }

    setSubmitting(true);
    console.log('Starting company setup transaction...');

    try {
      await runTransaction(db, async (transaction) => {
        const empresaRef = doc(collection(db, 'empresas'));
        transaction.set(empresaRef, {
          nombre: nombreEmpresa,
          tipo_negocio: tipoNegocio,
          plan_id: planSeleccionado || 'basico',
          owner_uid: user.uid,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });

        const userRef = doc(db, 'users', user.uid);
        transaction.update(userRef, {
          empresa_id: empresaRef.id,
          rol: 'administrador',
          setup_completed: true,
          updated_at: serverTimestamp(),
        });
      });

      console.log('Company setup completed successfully');
      setSuccess('¡Empresa configurada exitosamente!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error('Error configurando empresa:', err);
      setError('Error al configurar la empresa. Inténtalo de nuevo.');
    }

    setSubmitting(false);
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

  if (loading || userDocLoading) {
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

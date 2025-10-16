import { useState, useEffect } from 'react';
import PricingCard from '../common/PricingCard';
import HeroTitle from '../common/HeroTitle';
import './PricingSection.css';
import basic from '../../assets/icons/basic_icon.png';
import standard from '../../assets/icons/professional_icon.png';
import premium from '../../assets/icons/business_icon.png';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../configs/firebaseConfig';
import { getPlans, type Plan } from '../../services/api/plansService';

const PricingSection = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // Cargar planes desde el backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const fetchedPlans = await getPlans();
        setPlans(fetchedPlans);
      } catch (error) {
        console.error('Error cargando planes:', error);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleRedirect = (planId: string) => {
    if (!loading) {
      if (user) {
        navigate(`/company-setup?plan=${planId}`);
      } else {
        navigate(`/register?plan=${planId}`);
      }
    }
  };

  // Mapeo de iconos por nombre de plan
  const getIconForPlan = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'básico':
        return <img src={basic} alt='Icono Básico' />;
      case 'estándar':
        return <img src={standard} alt='Icono Estándar' />;
      case 'premium':
        return <img src={premium} alt='Icono Premium' />;
      default:
        return <img src={basic} alt='Icono Plan' />;
    }
  };

  // Mapeo de plan_id a string para URLs
  const getPlanUrlName = (planId: number) => {
    switch (planId) {
      case 1:
        return 'basico';
      case 2:
        return 'estandar';
      case 3:
        return 'premium';
      default:
        return 'basico';
    }
  };

  // Generar features dinámicamente desde los límites (exactamente como en la imagen)
  const generateFeatures = (plan: Plan) => {
    const features = [];

    // Miembros del equipo
    if (plan.limites.miembros === null) {
      features.push('Miembros del Equipo Ilimitados');
    } else {
      features.push(`Hasta ${plan.limites.miembros} Miembros del Equipo`);
    }

    // Roles (solo para Estándar y Premium)
    if (plan.limites.roles && plan.limites.roles !== null) {
      features.push(`${plan.limites.roles} Roles Personalizables`);
    } else if (plan.limites.roles === null) {
      features.push('Roles Ilimitados');
    }

    // Productos en inventario
    if (plan.limites.productos === null) {
      features.push('Productos Ilimitados');
    } else {
      features.push(`${plan.limites.productos?.toLocaleString() || 0} Productos en Inventario`);
    }

    // Transacciones
    if (plan.limites.transacciones === null) {
      features.push('Transacciones Ilimitadas');
    } else {
      features.push(`${plan.limites.transacciones?.toLocaleString() || 0} Transacciones/mes`);
    }

    // Features específicas por plan (como aparecen en la imagen)
    if (plan.plan_id === 1) {
      // Plan Básico
      features.push('Dashboard con reportes básicos');
      features.push('Soporte por Email (72h)');
    } else if (plan.plan_id === 2) {
      // Plan Estándar
      features.push('Reportes Estándar y Exportación');
      features.push('Soporte Prioritario (24h)');
    } else if (plan.plan_id === 3) {
      // Plan Premium
      features.push('Reportes Avanzados');
      features.push('Soporte Dedicado + Chat');
    }

    return features;
  };

  // Obtener descripción correcta por plan
  const getPlanDescription = (plan: Plan) => {
    switch (plan.plan_id) {
      case 1:
        return 'Ideal para ferreterías, licorerías o minimarkets que empiezan.';
      case 2:
        return 'Perfecto para negocios que buscan crecer y añadir más miembros al equipo.';
      case 3:
        return 'La solución completa para negocios con alto volumen de ventas y personal.';
      default:
        return 'Plan completo para tu negocio.';
    }
  };

  if (plansLoading) {
    return (
      <section className='pricing'>
        <div className='pricing__container'>
          <p>Cargando planes...</p>
        </div>
      </section>
    );
  }

  return (
    <section className='pricing'>
      <div className='pricing__container'>
        <HeroTitle
          titulo='Planes que se Adaptan a tu Negocio'
          descripcion='Elige el plan perfecto y comienza a optimizar tus operaciones hoy mismo'
          gradientText='Negocio'
          tituloStyle='h2'
          descripcionStyle='body-large'
          tituloSize={39}
        />
        <div className='pricing__cards'>
          {plans.map((plan) => (
            <PricingCard
              key={plan.plan_id}
              title={plan.nombre_plan}
              price={`Bs. ${plan.precio_mensual}`}
              priceComment='/mes'
              comment={getPlanDescription(plan)}
              isPopular={plan.plan_id === 2}
              badgeText={plan.plan_id === 2 ? '¡14 días gratis!' : undefined}
              features={generateFeatures(plan)}
              buttonText={
                plan.plan_id === 1
                  ? 'Elegir Plan Básico'
                  : plan.plan_id === 2
                    ? 'Iniciar Prueba Gratuita'
                    : 'Elegir Plan Premium'
              }
              icons={[getIconForPlan(plan.nombre_plan)]}
              onButtonClick={() => handleRedirect(getPlanUrlName(plan.plan_id))}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

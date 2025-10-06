import PricingCard from '../common/PricingCard';
import HeroTitle from '../common/HeroTitle';
import './PricingSection.css';
import basic from '../../assets/icons/basic_icon.png';
import standard from '../../assets/icons/professional_icon.png';
import premium from '../../assets/icons/business_icon.png';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../configs/firebaseConfig';

const PricingSection = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);

  const handleRedirect = (planId: string) => {
    if (!loading) {
      if (user) {
        navigate(`/company-setup?plan=${planId}`);
      } else {
        navigate(`/register?plan=${planId}`);
      }
    }
  };

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
          <PricingCard
            title='Básico'
            price='Bs. 10'
            priceComment='/mes'
            comment='Ideal para ferreterías, licorerías o minimarkets que empiezan.'
            features={[
              '1 Miembro del Equipo',
              '150 Productos en Inventario',
              '250 Transacciones/mes (Ventas y Compras)',
              'Dashboard con reportes básicos',
              'Soporte por Email (72h)',
            ]}
            buttonText='Elegir Plan Básico'
            icons={[<img src={basic} alt='Icono Básico' />]}
            onButtonClick={() => handleRedirect('basico')}
          />
          <PricingCard
            title='Estándar'
            price='Bs. 50'
            priceComment='/mes'
            comment='Perfecto para negocios que buscan crecer y añadir más miembros al equipo.'
            isPopular={true}
            badgeText='¡14 días gratis!'
            features={[
              'Hasta 5 Miembros del Equipo',
              '5 Roles Personalizables',
              '5,000 Productos en Inventario',
              '10,000 Transacciones/mes',
              'Reportes Estándar y Exportación',
              'Soporte Prioritario (24h)',
            ]}
            buttonText='Iniciar Prueba Gratuita'
            icons={[<img src={standard} alt='Icono Estándar' />]}
            onButtonClick={() => handleRedirect('estandar')}
          />
          <PricingCard
            title='Premium'
            price='Bs. 90'
            priceComment='/mes'
            comment='La solución completa para negocios con alto volumen de ventas y personal.'
            features={[
              'Miembros del Equipo Ilimitados',
              'Roles Ilimitados',
              'Productos Ilimitados',
              'Transacciones Ilimitadas',
              'Reportes Avanzados',
              'Soporte Dedicado + Chat',
            ]}
            buttonText='Elegir Plan Premium'
            icons={[<img src={premium} alt='Icono Premium' />]}
            onButtonClick={() => handleRedirect('premium')}
          />
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

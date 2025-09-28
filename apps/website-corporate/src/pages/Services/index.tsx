import React from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  Users,
  Headphones,
  Zap,
  Smartphone,
  Globe,
  Shield,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Phone,
  Target,
  Clock,
  Award,
  Lightbulb,
  Settings,
} from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { SEO } from '../../components/UI/SEO';
import { OptimizedImage } from '../../components/UI/OptimizedImage';
import type { Service } from '../../types';
import styles from './Services.module.css';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const services: Service[] = [
  {
    id: 'development',
    title: 'Desarrollo de Software Personalizado',
    description:
      'Creamos soluciones de software a medida que se adaptan perfectamente a las necesidades específicas de tu empresa en Bolivia.',
    features: [
      'Aplicaciones web modernas y responsive',
      'Sistemas de gestión empresarial (ERP/CRM)',
      'APIs y microservicios escalables',
      'Integración con sistemas existentes',
      'Arquitectura cloud-native',
      'Seguridad y cumplimiento normativo',
    ],
    icon: 'Code2',
  },
  {
    id: 'consulting',
    title: 'Consultoría Tecnológica',
    description:
      'Asesoramos a tu organización en la adopción de tecnologías que impulsen tu competitividad en el mercado boliviano.',
    features: [
      'Análisis de arquitectura tecnológica',
      'Estrategia de transformación digital',
      'Auditoría de sistemas existentes',
      'Optimización de procesos',
      'Selección de tecnologías',
      'Roadmap de implementación',
    ],
    icon: 'Users',
  },
  {
    id: 'support',
    title: 'Mantenimiento y Soporte',
    description:
      'Brindamos soporte técnico continuo y mantenimiento proactivo para garantizar el óptimo funcionamiento de tus sistemas.',
    features: [
      'Soporte 24/7 en horario boliviano',
      'Mantenimiento preventivo y correctivo',
      'Monitoreo proactivo de sistemas',
      'Actualizaciones y parches de seguridad',
      'Backup y recuperación de datos',
      'SLA garantizado',
    ],
    icon: 'Headphones',
  },
  {
    id: 'digital-transformation',
    title: 'Transformación Digital',
    description:
      'Acompañamos a tu empresa en el proceso completo de digitalización, adaptado al contexto empresarial boliviano.',
    features: [
      'Diagnóstico digital integral',
      'Automatización de procesos',
      'Migración a la nube',
      'Capacitación de equipos',
      'Change management',
      'Métricas y KPIs digitales',
    ],
    icon: 'Zap',
  },
  {
    id: 'mobile',
    title: 'Desarrollo de Apps Móviles',
    description:
      'Aplicaciones móviles nativas y multiplataforma que conectan con tus usuarios en Bolivia y el mundo.',
    features: [
      'Apps nativas iOS y Android',
      'Desarrollo multiplataforma',
      'Integración con servicios locales',
      'Pagos QR y sistemas bolivianos',
      'Geolocalización y mapas',
      'Push notifications',
    ],
    icon: 'Smartphone',
  },
  {
    id: 'ecommerce',
    title: 'Soluciones E-commerce',
    description:
      'Plataformas de comercio electrónico optimizadas para el mercado boliviano con todos los medios de pago locales.',
    features: [
      'Tiendas online personalizadas',
      'Integración con pagos QR',
      'Gestión de inventario',
      'Sistema de delivery',
      'Analytics y reportes',
      'SEO y marketing digital',
    ],
    icon: 'Globe',
  },
];

const processSteps = [
  {
    number: 1,
    title: 'Análisis',
    description: 'Entendemos tu negocio y definimos objetivos',
    icon: <Target size={32} />,
  },
  {
    number: 2,
    title: 'Planificación',
    description: 'Diseñamos la arquitectura y roadmap',
    icon: <Settings size={32} />,
  },
  {
    number: 3,
    title: 'Desarrollo',
    description: 'Construimos la solución con metodología ágil',
    icon: <Code2 size={32} />,
  },
  {
    number: 4,
    title: 'Entrega',
    description: 'Implementamos y brindamos soporte',
    icon: <CheckCircle size={32} />,
  },
];

const benefits = [
  {
    title: 'Calidad Garantizada',
    description: 'Código limpio, documentado y con testing automatizado',
    icon: <Award size={24} />,
  },
  {
    title: 'Entregas a Tiempo',
    description: 'Metodología ágil con entregas incrementales',
    icon: <Clock size={24} />,
  },
  {
    title: 'Soporte Local',
    description: 'Equipo en La Paz con conocimiento del mercado',
    icon: <Users size={24} />,
  },
  {
    title: 'Tecnología Moderna',
    description: 'Stack actualizado y mejores prácticas',
    icon: <Lightbulb size={24} />,
  },
  {
    title: 'Escalabilidad',
    description: 'Soluciones que crecen con tu empresa',
    icon: <TrendingUp size={24} />,
  },
  {
    title: 'Seguridad',
    description: 'Implementamos los más altos estándares',
    icon: <Shield size={24} />,
  },
];

const getIcon = (iconName: string) => {
  const icons: { [key: string]: React.ReactNode } = {
    Code2: <Code2 size={40} />,
    Users: <Users size={40} />,
    Headphones: <Headphones size={40} />,
    Zap: <Zap size={40} />,
    Smartphone: <Smartphone size={40} />,
    Globe: <Globe size={40} />,
  };
  return icons[iconName] || <Code2 size={40} />;
};

export const Services: React.FC = () => {
  return (
    <>
      <SEO
        title='Nuestros Servicios - CorpsCode'
        description='Servicios de desarrollo de software, consultoría tecnológica, ERP InnovaPaz y más en La Paz, Bolivia. Soluciones empresariales de calidad mundial.'
        keywords={[
          'servicios desarrollo software Bolivia',
          'consultoría tecnológica La Paz',
          'ERP InnovaPaz',
          'aplicaciones móviles Bolivia',
          'transformación digital',
        ]}
        canonical='/services'
      />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground} />
        <div className={styles.heroImageContainer}>
          <OptimizedImage
            src='/images/hero/services-hero.jpg'
            alt='Equipo de desarrollo trabajando en soluciones tecnológicas'
            className={styles.heroImage}
            priority={true}
            overlay={true}
            overlayOpacity={0.5}
          />
        </div>
        <div className='container'>
          <div className={styles.heroContent}>
            <motion.h1 className={styles.heroTitle} {...fadeInUp}>
              Nuestros Servicios
            </motion.h1>
            <motion.p
              className={styles.heroSubtitle}
              {...fadeInUp}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              Soluciones tecnológicas integrales diseñadas para impulsar el crecimiento y la
              competitividad de tu empresa en Bolivia.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id='development' className={styles.section}>
        <div className='container'>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Nuestros Servicios</h2>
            <p className={styles.sectionSubtitle}>
              Ofrecemos un portafolio completo de servicios tecnológicos adaptados a las necesidades
              del mercado boliviano.
            </p>
          </div>

          <motion.div
            className={styles.servicesGrid}
            variants={staggerContainer}
            initial='initial'
            whileInView='animate'
            viewport={{ once: true }}
          >
            {services.map((service) => (
              <motion.div
                key={service.id}
                className={styles.serviceCard}
                variants={fadeInUp}
                id={service.id}
              >
                <div className={styles.serviceHeader}>
                  <div className={styles.serviceIcon}>{getIcon(service.icon)}</div>
                  <h3 className={styles.serviceTitle}>{service.title}</h3>
                  <p className={styles.serviceSubtitle}>Solución especializada</p>
                </div>

                <div className={styles.serviceContent}>
                  <p className={styles.serviceDescription}>{service.description}</p>

                  <div className={styles.serviceFeatures}>
                    <h4>Incluye:</h4>
                    <ul className={styles.featuresList}>
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.serviceAction}>
                    <Button
                      as='link'
                      to='/contact'
                      variant='outline'
                      size='small'
                      icon={<ArrowRight size={16} />}
                      iconPosition='right'
                    >
                      Solicitar Información
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Technology Showcase */}
        </div>
      </section>

      {/* ERP InnovaPaz Highlight */}
      <section id='erp' className={styles.erpHighlight}>
        <div className={styles.erpBackground} />
        <div className={styles.erpImageContainer}>
          <OptimizedImage
            src='/images/technology/erp-dashboard.jpg'
            alt='Dashboard del sistema ERP InnovaPaz'
            className={styles.erpBackgroundImage}
            overlay={true}
            overlayOpacity={0.7}
          />
        </div>
        <div className='container'>
          <div className={styles.erpContent}>
            <div className={styles.erpText}>
              <motion.h2
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                Sistema ERP InnovaPaz
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                Nuestro sistema ERP estrella, diseñado específicamente para las necesidades
                empresariales de Bolivia. Una solución integral que digitaliza y optimiza todos los
                procesos de tu organización.
              </motion.p>

              <motion.div
                className={styles.erpFeatures}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className={styles.erpFeature}>
                  <CheckCircle className='icon' />
                  <span>Gestión Financiera Completa</span>
                </div>
                <div className={styles.erpFeature}>
                  <CheckCircle className='icon' />
                  <span>Inventarios y Almacenes</span>
                </div>
                <div className={styles.erpFeature}>
                  <CheckCircle className='icon' />
                  <span>Ventas y CRM</span>
                </div>
                <div className={styles.erpFeature}>
                  <CheckCircle className='icon' />
                  <span>Recursos Humanos</span>
                </div>
                <div className={styles.erpFeature}>
                  <CheckCircle className='icon' />
                  <span>Reportes y Analytics</span>
                </div>
                <div className={styles.erpFeature}>
                  <CheckCircle className='icon' />
                  <span>Integración SIN/SEDES</span>
                </div>
              </motion.div>

              <motion.div
                className={styles.erpActions}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Button
                  as='anchor'
                  href='https://innovapaz-website-erp-marketing.vercel.app/'
                  target='_blank'
                  size='large'
                  variant='secondary'
                  icon={<ExternalLink size={20} />}
                  iconPosition='right'
                >
                  Visitar InnovaPaz.bo
                </Button>
                <Button
                  as='link'
                  to='/contact'
                  size='large'
                  variant='outlineLight'
                  icon={<ArrowRight size={20} />}
                  iconPosition='right'
                >
                  Solicitar Demo
                </Button>
              </motion.div>
            </div>

            <motion.div
              className={styles.erpVisual}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className={styles.erpLogo}>IP</div>

              <div className={styles.erpStats}>
                <div className={styles.erpStat}>
                  <span className='number'>15+</span>
                  <span className='label'>Empresas Activas</span>
                </div>
                <div className={styles.erpStat}>
                  <span className='number'>99%</span>
                  <span className='label'>Uptime</span>
                </div>
                <div className={styles.erpStat}>
                  <span className='number'>24/7</span>
                  <span className='label'>Soporte</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className={`${styles.section} ${styles.sectionAlternate}`}>
        <div className='container'>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Nuestro Proceso</h2>
            <p className={styles.sectionSubtitle}>
              Metodología probada que garantiza resultados exitosos en cada proyecto.
            </p>
          </div>

          <div className={styles.processContent}>
            <motion.div
              className={styles.processSteps}
              variants={staggerContainer}
              initial='initial'
              whileInView='animate'
              viewport={{ once: true }}
            >
              {processSteps.map((step, index) => (
                <motion.div key={index} className={styles.processStep} variants={fadeInUp}>
                  <div className={styles.processStepIcon}>
                    {step.icon}
                    <div className={styles.processStepNumber}>{step.number}</div>
                  </div>
                  <h3 className={styles.processStepTitle}>{step.title}</h3>
                  <p className={styles.processStepDescription}>{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.section}>
        <div className='container'>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>¿Por Qué Elegir Nuestros Servicios?</h2>
            <p className={styles.sectionSubtitle}>
              Beneficios que nos distinguen como el partner tecnológico ideal para tu empresa en
              Bolivia.
            </p>
          </div>

          <div className={styles.benefitsSection}>
            <motion.div
              className={styles.benefitsGrid}
              variants={staggerContainer}
              initial='initial'
              whileInView='animate'
              viewport={{ once: true }}
            >
              {benefits.map((benefit, index) => (
                <motion.div key={index} className={styles.benefitCard} variants={fadeInUp}>
                  <div className={styles.benefitIcon}>{benefit.icon}</div>
                  <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                  <p className={styles.benefitDescription}>{benefit.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaImageContainer}>
          <OptimizedImage
            src='/images/technology/developer-working.jpg'
            alt='Desarrollador trabajando en soluciones innovadoras'
            className={styles.ctaBackgroundImage}
            overlay={true}
            overlayOpacity={0.6}
          />
        </div>
        <div className='container'>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{ position: 'relative', zIndex: 2 }}
          >
            <h2 className={styles.ctaTitle}>¿Listo para Digitalizar tu Empresa?</h2>
            <p className={styles.ctaDescription}>
              Conversemos sobre cómo nuestros servicios pueden transformar tu organización y
              llevarla al siguiente nivel tecnológico.
            </p>
            <div className={styles.ctaActions}>
              <Button
                as='link'
                to='/contact'
                size='large'
                variant='secondary'
                icon={<ArrowRight size={20} />}
                iconPosition='right'
              >
                Solicitar Cotización Gratuita
              </Button>
              <Button
                as='anchor'
                href='tel:+59177123456'
                size='large'
                variant='outlineLight'
                icon={<Phone size={20} />}
              >
                Llamar Ahora
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

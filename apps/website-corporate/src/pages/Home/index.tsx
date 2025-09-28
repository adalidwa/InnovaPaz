import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Target, Eye, Building2 } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { SEO } from '../../components/UI/SEO';
import { OptimizedImage } from '../../components/UI/OptimizedImage';
import type { TeamMember } from '../../types';
import styles from './Home.module.css';

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

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Edison Clever Checa Tito',
    position: 'Miembro del Equipo',
    description: 'SAGA: A28145-X - Miembro del equipo directivo de CorpsCode.',
    image: '/images/team-photos/edison.jpg', // Imagen específica para Edison
    imageAlt: 'Edison Clever Checa Tito - Miembro del Equipo CorpsCode',
  },
  {
    id: '2',
    name: 'Adalid Jesús Condori Velasco',
    position: 'Miembro del Equipo',
    description: 'SAGA: A27351-1 - Miembro del equipo directivo de CorpsCode.',
    image: '/images/team-photos/adalid.jpg', // Imagen específica para Adalid
    imageAlt: 'Adalid Jesús Condori Velasco - Miembro del Equipo CorpsCode',
  },
  {
    id: '3',
    name: 'Jesús Ario Soto Mercado',
    position: 'Miembro del Equipo',
    description: 'SAGA: A26805-4 - Miembro del equipo directivo de CorpsCode.',
    image: '/images/team-photos/jesus.jpg', // Imagen específica para Jesús
    imageAlt: 'Jesús Ario Soto Mercado - Miembro del Equipo CorpsCode',
  },
  {
    id: '4',
    name: 'Izai Alejandro Zalles Merino',
    position: 'Miembro del Equipo',
    description: 'SAGA: A27006-7 - Miembro del equipo directivo de CorpsCode.',
    image: '/images/team-photos/izai.jpg', // Imagen específica para Izai
    imageAlt: 'Izai Alejandro Zalles Merino - Miembro del Equipo CorpsCode',
  },
  {
    id: '5',
    name: 'José Ángel Mamani Pinto',
    position: 'Miembro del Equipo',
    description: 'SAGA: A28095-X - Miembro del equipo directivo de CorpsCode.',
    image: '/images/team-photos/angel.jpg', // Imagen específica para José
    imageAlt: 'José Ángel Mamani Pinto - Miembro del Equipo CorpsCode',
  },
];

export const Home: React.FC = () => {
  return (
    <>
      <SEO
        title='CorpsCode - Desarrollo de Software Profesional en La Paz, Bolivia'
        description='Empresa líder en desarrollo de software en La Paz, Bolivia. Transformamos ideas en soluciones tecnológicas innovadoras. Consultoría, desarrollo personalizado y ERP InnovaPaz.'
        keywords={[
          'desarrollo de software La Paz',
          'empresa tecnológica Bolivia',
          'software empresarial',
          'programación La Paz',
          'consultoría tecnológica Bolivia',
        ]}
        canonical='/'
      />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroImageContainer}>
          <OptimizedImage
            src='/images/hero/team-collaboration.jpg'
            alt='Equipo de desarrollo trabajando en colaboración'
            className={styles.heroImage}
            priority={true}
            overlay={true}
            overlayOpacity={0.4}
          />
        </div>
        <div className='container'>
          <motion.div
            className={styles.heroContent}
            initial='initial'
            animate='animate'
            variants={staggerContainer}
          >
            <motion.h1 className={styles.heroTitle} variants={fadeInUp}>
              Transformamos <span style={{ color: 'var(--color-accent)' }}>Ideas</span> en
              <br />
              Soluciones <span style={{ color: 'var(--color-accent)' }}>Tecnológicas</span>
            </motion.h1>

            <motion.p className={styles.heroSubtitle} variants={fadeInUp}>
              Somos la empresa líder en desarrollo de software en La Paz, Bolivia. Creamos
              soluciones innovadoras que impulsan el crecimiento de tu organización.
            </motion.p>

            <motion.div className={styles.heroActions} variants={fadeInUp}>
              <Button
                as='link'
                to='/services'
                size='large'
                icon={<ArrowRight size={20} />}
                iconPosition='right'
              >
                Conoce Nuestros Servicios
              </Button>

              <Button as='link' to='/contact' variant='secondary' size='large'>
                Contactar Ahora
              </Button>
            </motion.div>

            <motion.div className={styles.heroStats} variants={fadeInUp}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNumber}>50+</span>
                <span className={styles.heroStatLabel}>Proyectos Completados</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNumber}>8</span>
                <span className={styles.heroStatLabel}>Años de Experiencia</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNumber}>25+</span>
                <span className={styles.heroStatLabel}>Clientes Satisfechos</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNumber}>100%</span>
                <span className={styles.heroStatLabel}>Enfoque en La Paz</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id='about' className={styles.section}>
        <div className='container'>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Quiénes Somos</h2>
            <p className={styles.sectionSubtitle}>
              Una empresa boliviana comprometida con la excelencia tecnológica
            </p>
          </div>

          <div className={styles.aboutContent}>
            <div className={styles.aboutText}>
              <p>
                <strong>CorpsCode</strong> nació en La Paz con la visión de democratizar el acceso a
                la tecnología de vanguardia para empresas bolivianas. Desde nuestros inicios, hemos
                estado comprometidos con ofrecer soluciones de software de clase mundial adaptadas
                al contexto local.
              </p>
              <p>
                Nuestro equipo multidisciplinario combina experiencia técnica internacional con un
                profundo conocimiento del mercado boliviano. Esta combinación única nos permite
                crear soluciones que no solo son tecnológicamente avanzadas, sino también
                culturalmente relevantes y económicamente viables.
              </p>
              <p>
                Con sede en el corazón de La Paz, servimos a organizaciones de todos los tamaños,
                desde startups innovadoras hasta empresas establecidas que buscan modernizar sus
                operaciones a través de la transformación digital.
              </p>
            </div>
            <div className={styles.aboutImage}>
              <Building2 size={80} />
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section id='history' className={`${styles.section} ${styles.sectionAlternate}`}>
        <div className='container'>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Nuestra Historia</h2>
            <p className={styles.sectionSubtitle}>
              Un recorrido de crecimiento y innovación en el ecosistema tecnológico paceño
            </p>
          </div>

          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineMarker}></div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineYear}>2016</div>
                <h3 className={styles.timelineTitle}>Fundación de CorpsCode</h3>
                <p className={styles.timelineDescription}>
                  Iniciamos nuestras operaciones en La Paz con un equipo de 3 desarrolladores
                  apasionados por crear software de calidad para el mercado boliviano.
                </p>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineMarker}></div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineYear}>2018</div>
                <h3 className={styles.timelineTitle}>Primera Expansión</h3>
                <p className={styles.timelineDescription}>
                  Crecimos a un equipo de 12 profesionales y completamos nuestro primer proyecto
                  empresarial de gran escala para una empresa líder en La Paz.
                </p>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineMarker}></div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineYear}>2020</div>
                <h3 className={styles.timelineTitle}>Era Digital</h3>
                <p className={styles.timelineDescription}>
                  La pandemia aceleró la demanda de soluciones digitales. Ayudamos a 20+ empresas
                  paceñas en su transformación digital completa.
                </p>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineMarker}></div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineYear}>2022</div>
                <h3 className={styles.timelineTitle}>Lanzamiento de InnovaPaz</h3>
                <p className={styles.timelineDescription}>
                  Desarrollamos y lanzamos nuestro sistema ERP InnovaPaz, diseñado específicamente
                  para las necesidades de las organizaciones bolivianas.
                </p>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineMarker}></div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineYear}>2024</div>
                <h3 className={styles.timelineTitle}>Líder del Mercado</h3>
                <p className={styles.timelineDescription}>
                  Hoy somos reconocidos como una de las empresas de desarrollo de software más
                  innovadoras y confiables de La Paz, con 25+ clientes activos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section id='mission' className={styles.section}>
        <div className='container'>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Misión y Visión</h2>
            <p className={styles.sectionSubtitle}>
              Los principios que guían nuestro trabajo y nuestra proyección futura
            </p>
          </div>

          <div className={styles.missionContent}>
            <div className={styles.missionCard}>
              <div className={styles.missionIcon}>
                <Target size={32} />
              </div>
              <h3 className={styles.missionTitle}>Nuestra Misión</h3>
              <p className={styles.missionDescription}>
                Transformar ideas innovadoras en soluciones de software robustas y escalables que
                impulsen el crecimiento sostenible de las organizaciones en La Paz y Bolivia,
                utilizando las mejores prácticas de desarrollo y tecnologías de vanguardia.
              </p>
            </div>

            <div className={styles.missionCard}>
              <div className={styles.missionIcon}>
                <Eye size={32} />
              </div>
              <h3 className={styles.missionTitle}>Nuestra Visión</h3>
              <p className={styles.missionDescription}>
                Ser reconocidos como la empresa líder en desarrollo de software en Bolivia para
                2030, siendo el socio tecnológico preferido por organizaciones que buscan
                excelencia, innovación y un profundo compromiso con el desarrollo local.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id='team' className={`${styles.section} ${styles.sectionAlternate}`}>
        <div className='container'>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Equipo Directivo</h2>
            <p className={styles.sectionSubtitle}>
              Líderes comprometidos con la excelencia tecnológica y el crecimiento de Bolivia
            </p>
          </div>

          <div className={styles.teamGrid}>
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                className={styles.teamCard}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={styles.teamImage}>
                  <OptimizedImage
                    src={member.image}
                    alt={member.imageAlt}
                    className={styles.teamPhoto}
                    width={120}
                    height={120}
                    objectFit='cover'
                  />
                </div>
                <div className={styles.teamInfo}>
                  <h3 className={styles.teamName}>{member.name}</h3>
                  <p className={styles.teamPosition}>{member.position}</p>
                  <p className={styles.teamDescription}>{member.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

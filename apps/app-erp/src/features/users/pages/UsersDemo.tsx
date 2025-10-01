import styles from './UsersDemo.module.css';
import UsersContainer from '../components/UsersContainer';

/**
 * Página de demostración del módulo de usuarios
 *
 * Esta página muestra todas las funcionalidades del módulo de usuarios:
 * - Perfil de usuario
 * - Gestión de equipo
 * - Invitación de usuarios
 *
 * Uso:
 * import UsersDemo from './features/users/pages/UsersDemo';
 *
 * <UsersDemo />
 */
const UsersDemo = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <h1 className={styles.headerTitle}>Módulo de Usuarios - Demo</h1>
            <p className={styles.headerDesc}>
              Visualización de las tres vistas principales del módulo de gestión de usuarios
            </p>
          </div>
          <div className={styles.demoBadge}>Modo Demostración</div>
        </div>
      </div>
      <UsersContainer />
    </div>
  );
};

export default UsersDemo;

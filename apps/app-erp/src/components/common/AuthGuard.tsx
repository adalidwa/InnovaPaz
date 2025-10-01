import { useEffect, useState } from 'react';
import { validateTokenAndLogin } from '../../services/authService';
import type { User } from 'firebase/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { success, user } = await validateTokenAndLogin();
        setIsAuthenticated(success);
        setUser(user);
      } catch (error) {
        console.error('Error en la validación de autenticación:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
        }}
      >
        Validando autenticación...
      </div>
    );
  }

  if (!isAuthenticated) {
    // El servicio de autenticación ya maneja la redirección
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
        }}
      >
        Redirigiendo al login...
      </div>
    );
  }

  // Usuario autenticado, mostrar la aplicación
  console.log('Usuario autenticado en AuthGuard:', user?.email);
  return <>{children}</>;
};

export default AuthGuard;

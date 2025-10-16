import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../configs/firebaseConfig';
import avatarDefault from '../assets/images/avatarlogin.png';
import { redirectToERP } from '../configs/appConfig'; // Importar la función de redirección

interface User {
  displayName: string;
  photoURL: string;
  email?: string;
  uid?: string;
  // Datos adicionales del backend (PostgreSQL)
  empresa_id?: string;
  rol_id?: number;
  estado?: string;
  backendSynced?: boolean; // Indica si los datos del backend están sincronizados
}

interface UserContextProps {
  user: User | null;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>; // Nueva función para recargar datos del backend
}

export const UserContext = createContext<UserContextProps>({
  user: null,
  logout: async () => {},
  refreshUserData: async () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener datos del backend
  const fetchBackendUserData = async (firebaseUser: any) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      const response = await fetch('http://localhost:4000/api/auth/login-firebase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        const backendData = await response.json();
        return {
          ...backendData.usuario,
          backendSynced: true,
        };
      }
    } catch (error) {
      console.error('Error obteniendo datos del backend:', error);
    }
    return { backendSynced: false };
  };

  const refreshUserData = async () => {
    if (auth.currentUser) {
      const backendData = await fetchBackendUserData(auth.currentUser);
      setUser((prevUser) => (prevUser ? { ...prevUser, ...backendData } : null));
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          displayName: firebaseUser.displayName || 'Usuario Anónimo',
          photoURL: firebaseUser.photoURL || avatarDefault,
          email: firebaseUser.email || '',
          uid: firebaseUser.uid,
        };

        // Intentar obtener datos del backend
        const backendData = await fetchBackendUserData(firebaseUser);

        const fullUser = { ...userData, ...backendData };
        setUser(fullUser);

        // --- LÓGICA DE REDIRECCIÓN AUTOMÁTICA ---
        // Solo redirigir al ERP en casos específicos:
        if (fullUser.backendSynced && fullUser.empresa_id) {
          const currentPath = window.location.pathname;
          const hasRedirectFlag = localStorage.getItem('redirectToERP') === 'true';
          const fromPlans = window.location.search.includes('plan=');

          // Redirigir solo si:
          // 1. Viene específicamente de un plan, O
          // 2. Hay un flag explícito de redirección (ej: botón "Acceder al ERP"), O
          // 3. Está en la página de login (después de loguearse con empresa)
          const shouldRedirect = fromPlans || hasRedirectFlag || currentPath === '/login';

          if (shouldRedirect) {
            console.log('✅ Usuario completo con empresa, redirigiendo al ERP desde UserContext');
            localStorage.removeItem('redirectToERP'); // Limpiar flag
            redirectToERP();
          } else {
            console.log(
              '🏠 Usuario con empresa pero sin flag de redirección - manteniéndose en marketing'
            );
          }
        }
        // Si está autenticado pero no tiene empresa, permitir exploración libre
        else if (fullUser.backendSynced && !fullUser.empresa_id) {
          console.log('🏠 Usuario sin empresa - permitiendo exploración libre en marketing');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return <div>Cargando aplicación...</div>;
  }

  return (
    <UserContext.Provider value={{ user, logout, refreshUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

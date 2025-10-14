import { auth } from '../configs/firebaseConfig';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getUserData, getCompanyData } from './userService';
import { setCurrentUser, setCurrentCompany } from '../features/users/config/mockData';

export const validateTokenAndLogin = async (): Promise<{ success: boolean; user: User | null }> => {
  try {
    // Elimina la dependencia de localStorage y solo usa Firebase Auth
    return new Promise((resolve) => {
      let authCheckComplete = false;

      const timeout = setTimeout(() => {
        if (!authCheckComplete) {
          console.log('Timeout en verificación de autenticación');
          resolve({ success: false, user: null });
        }
      }, 10000);

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (authCheckComplete) return;

        authCheckComplete = true;
        clearTimeout(timeout);
        unsubscribe();

        if (user) {
          console.log('Usuario autenticado:', user.email);

          try {
            // Cargar datos del usuario desde Firestore
            const userData = await getUserData(user.uid);
            if (userData) {
              setCurrentUser(userData);

              // Cargar datos de la empresa
              const companyData = await getCompanyData(userData.empresa_id);
              if (companyData) {
                setCurrentCompany(companyData);
              }
            }
          } catch (error) {
            console.error('Error cargando datos del usuario:', error);
          }

          resolve({ success: true, user });
        } else {
          console.log('Usuario no autenticado');
          resolve({ success: false, user: null });
        }
      });
    });
  } catch (error) {
    console.error('Error validando token:', error);
    return { success: false, user: null };
  }
};

export const checkAuthStatus = (): Promise<{ isAuthenticated: boolean; user: User | null }> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve({
        isAuthenticated: !!user,
        user,
      });
    });
  });
};

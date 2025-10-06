import { auth } from '../configs/firebaseConfig';
import { onAuthStateChanged, type User } from 'firebase/auth';

export const validateTokenAndLogin = async (): Promise<{ success: boolean; user: User | null }> => {
  try {
    // Leer el token desde localStorage
    const token = localStorage.getItem('auth_token');

    if (!token) {
      console.log('No se encontró token de autenticación');
      // Redirigir al login
      window.location.href = 'http://localhost:5174';
      return { success: false, user: null };
    }

    console.log('Token encontrado, verificando estado de autenticación...');

    // Dado que ambas aplicaciones usan el mismo proyecto Firebase,
    // verificamos si hay una sesión activa
    return new Promise((resolve) => {
      let authCheckComplete = false;

      const timeout = setTimeout(() => {
        if (!authCheckComplete) {
          console.log('Timeout en verificación de autenticación, redirigiendo al login');
          localStorage.removeItem('auth_token');
          window.location.href = 'http://localhost:5174';
          resolve({ success: false, user: null });
        }
      }, 10000); // 10 segundos de timeout para dar tiempo a Firebase

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (authCheckComplete) return;

        authCheckComplete = true;
        clearTimeout(timeout);
        unsubscribe();

        if (user) {
          console.log('Usuario autenticado:', user.email);
          // Verificar que el token en localStorage coincida con el usuario actual
          user
            .getIdToken()
            .then((currentToken) => {
              if (currentToken === token) {
                console.log('Token validado correctamente');
                resolve({ success: true, user });
              } else {
                console.log('Token no coincide, actualizando token');
                localStorage.setItem('auth_token', currentToken);
                resolve({ success: true, user });
              }
            })
            .catch(() => {
              console.log('Error obteniendo token actual');
              resolve({ success: true, user }); // Aún permitir acceso si el usuario está autenticado
            });
        } else {
          console.log('Usuario no autenticado, limpiando token');
          localStorage.removeItem('auth_token');
          window.location.href = 'http://localhost:5174';
          resolve({ success: false, user: null });
        }
      });
    });
  } catch (error) {
    console.error('Error validando token:', error);
    // Limpiar token y redirigir
    localStorage.removeItem('auth_token');
    window.location.href = 'http://localhost:5174';
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

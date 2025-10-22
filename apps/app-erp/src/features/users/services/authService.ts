import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../configs/firebaseConfig';

export const loginToERP = async (email: string, password: string): Promise<any> => {
  try {
    // Autenticación con Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    const token = await firebaseUser.getIdToken();

    // Consulta al backend para obtener datos empresariales y autorización
    const res = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      // Solo puede acceder si tiene empresa asociada
      if (!data.usuario || !data.usuario.empresa_id) {
        throw new Error('Usuario sin empresa asociada');
      }
      return {
        success: true,
        usuario: data.usuario,
        token,
      };
    } else {
      const error = await res.json();
      throw new Error(error.message || 'No autorizado');
    }
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      throw new Error('Usuario no encontrado');
    }
    if (error.code === 'auth/wrong-password') {
      throw new Error('Credenciales incorrectas');
    }
    throw new Error(error.message || 'Error de autenticación');
  }
};

export const checkActiveSession = async (): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const res = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      return data.usuario;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const redirectToMarketing = (path: string) => {
  // Usar variable de entorno para la URL del website marketing
  const baseUrl = import.meta.env.VITE_MARKETING_URL || 'http://localhost:5174';

  window.location.href = `${baseUrl}${path}`;
};

// Nueva función para verificar si el usuario viene del marketing site
export const checkMarketingSession = async (): Promise<any> => {
  try {
    // Verificar si hay un token de sesión del marketing
    const marketingToken = localStorage.getItem('authToken'); // Token del marketing
    const erpToken = localStorage.getItem('token'); // Token del ERP

    if (marketingToken && !erpToken) {
      // Si hay token del marketing pero no del ERP, intentar sincronizar
      const res = await fetch('/api/auth/sync-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${marketingToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.usuario && data.usuario.empresa_id) {
          // Guardar token del ERP y retornar usuario
          localStorage.setItem('token', data.token);
          return data.usuario;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error verificando sesión del marketing:', error);
    return null;
  }
};

export const validateTokenAndLogin = async (): Promise<{ success: boolean; user: any }> => {
  try {
    // Primero verificar si hay sesión activa
    const activeUser = await checkActiveSession();
    if (activeUser) {
      return { success: true, user: activeUser };
    }

    // Si no hay sesión activa, verificar sesión del marketing
    const marketingUser = await checkMarketingSession();
    if (marketingUser) {
      return { success: true, user: marketingUser };
    }

    // Si no hay sesión válida, redirigir al marketing
    redirectToMarketing('/login');
    return { success: false, user: null };
  } catch (error) {
    console.error('Error validando token:', error);
    redirectToMarketing('/login');
    return { success: false, user: null };
  }
};

export const changeUserPassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> => {
  try {
    // Importar funciones necesarias de Firebase
    const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import(
      'firebase/auth'
    );

    // Obtener el usuario actual de Firebase
    const currentUser = auth.currentUser;

    if (!currentUser || !currentUser.email) {
      return { ok: false, error: 'No se encontró el usuario autenticado' };
    }

    // Paso 1: Re-autenticar al usuario con su contraseña actual
    // Esto es requerido por Firebase por seguridad
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);

    try {
      await reauthenticateWithCredential(currentUser, credential);
    } catch (error: any) {
      // Error de contraseña actual incorrecta
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        return { ok: false, error: 'La contraseña actual es incorrecta' };
      }
      return { ok: false, error: 'Error al verificar la contraseña actual' };
    }

    // Paso 2: Actualizar la contraseña en Firebase
    try {
      await updatePassword(currentUser, newPassword);
      return { ok: true };
    } catch (error: any) {
      if (error.code === 'auth/weak-password') {
        return { ok: false, error: 'La nueva contraseña es muy débil' };
      }
      if (error.code === 'auth/requires-recent-login') {
        return { ok: false, error: 'Por seguridad, debes iniciar sesión nuevamente' };
      }
      return { ok: false, error: error.message || 'No se pudo cambiar la contraseña' };
    }
  } catch (error: any) {
    return { ok: false, error: error.message || 'Error inesperado al cambiar la contraseña' };
  }
};

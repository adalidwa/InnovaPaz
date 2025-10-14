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
  window.location.href = `https://innovapaz.com${path}`;
};

export const changeUserPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
  token: string
): Promise<{ ok: boolean; error?: string }> => {
  try {
    const res = await fetch(`/api/users/${userId}/password`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });
    if (res.ok) {
      return { ok: true };
    } else {
      const error = await res.json();
      return { ok: false, error: error.message || 'No se pudo cambiar la contraseña.' };
    }
  } catch (error: any) {
    return { ok: false, error: error.message || 'Error de red.' };
  }
};

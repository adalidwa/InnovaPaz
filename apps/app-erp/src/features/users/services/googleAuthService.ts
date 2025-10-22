import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../../configs/firebaseConfig';

export interface GoogleAuthResult {
  success: boolean;
  token?: string;
  usuario?: any;
  error?: string;
}

export async function signInWithGoogleERP(): Promise<GoogleAuthResult> {
  try {
    // 1. Autenticar con Firebase/Google
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // 2. Obtener token de Firebase
    const idToken = await user.getIdToken();

    // 3. Enviar token al backend para verificar usuario y empresa
    const response = await fetch('/api/auth/google-login-erp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error en autenticación con Google');
    }

    const data = await response.json();

    // Verificar que el usuario tenga empresa asociada
    if (!data.usuario.empresa_id) {
      throw new Error('Usuario sin empresa asociada. Regístrate desde el sitio web.');
    }

    return {
      success: true,
      token: data.token,
      usuario: data.usuario,
    };
  } catch (error: any) {
    console.error('Error en Google Auth ERP:', error);
    return {
      success: false,
      error: error.message || 'Error en autenticación con Google',
    };
  }
}

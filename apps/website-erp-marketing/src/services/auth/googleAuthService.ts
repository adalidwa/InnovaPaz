import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../configs/firebaseConfig';
import { buildApiUrl } from '../../configs/appConfig';

export interface GoogleAuthResult {
  success: boolean;
  token?: string;
  usuario?: any;
  needsCompanySetup?: boolean;
  error?: string;
}

export async function signInWithGoogleBackend(): Promise<GoogleAuthResult> {
  try {
    // 1. Autenticar con Firebase/Google
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // 2. Obtener token de Firebase
    const idToken = await user.getIdToken();

    // 3. Enviar token al backend para crear/login usuario
    const response = await fetch(buildApiUrl('/api/auth/google-auth'), {
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

    return {
      success: true,
      token: data.token,
      usuario: data.usuario,
      needsCompanySetup: data.needsCompanySetup,
    };
  } catch (error: any) {
    console.error('Error en Google Auth:', error);
    return {
      success: false,
      error: error.message || 'Error en autenticación con Google',
    };
  }
}

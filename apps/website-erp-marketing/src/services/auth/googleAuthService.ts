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

export interface EmpresaData {
  nombre: string;
  tipo_empresa_id: number;
  plan_id: number;
}

export async function signInWithGoogleBackend(
  empresa_data?: EmpresaData
): Promise<GoogleAuthResult> {
  try {
    // 1. Autenticar con Firebase/Google
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // 2. Obtener token de Firebase
    const idToken = await user.getIdToken();

    // 3. Enviar token al backend para crear/login usuario
    // Incluir empresa_data si se proporciona
    const requestBody: any = { idToken };

    if (empresa_data) {
      requestBody.empresa_data = empresa_data;
    }

    const response = await fetch(buildApiUrl('/api/auth/google-auth'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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

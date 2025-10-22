import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../configs/firebaseConfig';

// Iniciar sesión en Firebase únicamente
export async function login(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const idToken = await user.getIdToken();
  return {
    uid: user.uid,
    idToken,
    email: user.email,
    displayName: user.displayName,
  };
}

// Iniciar sesión completo (Firebase + Backend)
export async function loginWithBackend(email: string, password: string) {
  // 1. Iniciar sesión en Firebase
  const firebaseResult = await login(email, password);

  // 2. Intercambiar token con tu backend
  const response = await fetch(
    `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/login-firebase`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken: firebaseResult.idToken }),
    }
  );

  if (!response.ok) {
    throw new Error('Usuario no encontrado en la base de datos');
  }

  const backendData = await response.json();

  return {
    ...firebaseResult,
    backendToken: backendData.token,
    userData: backendData.usuario, // Datos desde PostgreSQL
  };
}

// Registro coordinado (Firebase + Backend)
export async function registerWithBackend(userData: {
  email: string;
  password: string;
  nombre_completo: string;
  empresa_data?: {
    nombre: string;
    tipo_empresa_id: number;
    plan_id: number;
  };
}) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/register`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al registrar usuario');
  }

  return await response.json();
}

// Cerrar sesión
export async function logout() {
  await signOut(auth);
}

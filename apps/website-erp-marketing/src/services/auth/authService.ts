import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
// Login con Google usando Firebase Auth
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return { user: result.user };
}
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../../configs/firebaseConfig';

// Interfaz para los datos de registro en Firebase
export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
}

// Registrar usuario en Firebase Auth
export async function registerUserInFirebase(data: RegisterData) {
  const { email, password, nombre, apellido } = data;
  const displayName = `${nombre} ${apellido}`;
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await updateProfile(user, { displayName });
  return user;
}

// Iniciar sesión en Firebase Auth
export async function loginWithEmail(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// Cerrar sesión en Firebase Auth
export async function logoutFirebase() {
  await signOut(auth);
}

// Obtener el token del usuario autenticado
export async function getCurrentUserToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

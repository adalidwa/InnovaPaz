import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../configs/firebaseConfig';

// Registro mínimo: solo identidad + perfil básico (sin empresa, sin rol, sin setup)
export const registerUser = async (nombreCompleto: string, email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: nombreCompleto });

    // Guardado básico opcional (no depende del flujo de empresa)
    await setDoc(doc(db, 'users', user.uid), {
      nombre_completo: nombreCompleto,
      email: user.email,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    return { user, error: null };
  } catch (error) {
    console.error('Error in registerUser:', error);
    return { user: null, error };
  }
};

/**
 * @deprecated Ya no crea empresa en Firestore. Usa backend (/api/companies/setup) después de registerUser.
 * Se mantiene para evitar romper imports existentes; internamente solo llama a registerUser.
 */
export const registerUserAndCompany = async (data: {
  nombreCompleto: string;
  email: string;
  password: string;
  nombreEmpresa: string;
  tipoNegocio: string;
  planId: string;
}) => {
  const { nombreCompleto, email, password } = data;
  return registerUser(nombreCompleto, email, password);
};

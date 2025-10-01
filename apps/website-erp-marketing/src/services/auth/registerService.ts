import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, runTransaction, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../configs/firebaseConfig';

// Registro genérico
export const registerUser = async (nombreCompleto: string, email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: nombreCompleto });

    await setDoc(doc(db, 'users', user.uid), {
      nombre_completo: nombreCompleto,
      email: user.email,
      empresa_id: null,
      setup_completed: false,
      rol: null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    return { user, error: null };
  } catch (error) {
    console.error('Error in registerUser:', error);
    return { user: null, error };
  }
};

export const registerUserAndCompany = async (data: {
  nombreCompleto: string;
  email: string;
  password: string;
  nombreEmpresa: string;
  tipoNegocio: string;
  planId: string;
}) => {
  const { nombreCompleto, email, password, nombreEmpresa, tipoNegocio, planId } = data;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: nombreCompleto });

    await runTransaction(db, async (transaction) => {
      const empresaRef = doc(collection(db, 'empresas'));
      transaction.set(empresaRef, {
        nombre: nombreEmpresa,
        tipo_negocio: tipoNegocio,
        plan_id: planId,
        owner_uid: user.uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      const userRef = doc(db, 'users', user.uid);
      transaction.set(userRef, {
        nombre_completo: nombreCompleto,
        email: email,
        empresa_id: empresaRef.id,
        rol: 'administrador',
        setup_completed: true,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    });

    return { user, error: null };
  } catch (error) {
    console.error('Error en registerUserAndCompany:', error);
    return { user: null, error };
  }
};

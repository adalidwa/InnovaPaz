import { auth, db } from '../../configs/firebaseConfig';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export const signInWithGoogle = async (planId?: string | null) => {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');

  try {
    let result;
    try {
      result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    } catch (popupError: any) {
      console.log('Popup failed, trying redirect:', popupError);
      await signInWithRedirect(auth, provider);
      result = await getRedirectResult(auth);

      if (!result) {
        throw new Error('No result from redirect');
      }
    }

    const user = result.user;
    console.log('Usuario autenticado con Google:', user.email);

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    let isNewUser = false;

    if (!userSnap.exists()) {
      console.log('Creando nuevo usuario en Firestore');
      isNewUser = true;
      await setDoc(userRef, {
        nombre_completo: user.displayName || '',
        email: user.email,
        empresa_id: null,
        setup_completed: false,
        rol: null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    } else {
      console.log('Usuario ya existe en Firestore');
    }

    return { user, error: null, isNewUser, planId };
  } catch (error: any) {
    console.error('Error in signInWithGoogle:', error);
    return { user: null, error: error, isNewUser: false, planId: null };
  }
};

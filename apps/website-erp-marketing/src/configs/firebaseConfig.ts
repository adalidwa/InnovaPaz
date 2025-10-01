import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCZdZmjV6lOALdD4ajQb2rmPS8kYpw2T4U',
  authDomain: 'innovapaz-auth.firebaseapp.com',
  projectId: 'innovapaz-auth',
  storageBucket: 'innovapaz-auth.appspot.com',
  messagingSenderId: '922230883439',
  appId: '1:922230883439:web:f46c1e884ecd3a9883b99a',
};

if (import.meta.env.DEV) {
  console.log('🔥 Firebase Config:', firebaseConfig);
}

const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

console.log('✅ Firebase initialized successfully');

export { auth, db };
export default app;

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCZdZmjV6lOALdD4ajQb2rmPS8kYpw2T4U',
  authDomain: 'innovapaz-auth.firebaseapp.com',
  projectId: 'innovapaz-auth',
  storageBucket: 'innovapaz-auth.firebasestorage.app',
  messagingSenderId: '922230883439',
  appId: '1:922230883439:web:f46c1e884ecd3a9883b99a',
};

// Log config for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('🔥 Firebase Config:', firebaseConfig);
}

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw new Error(
    'Failed to initialize Firebase: ' + (error instanceof Error ? error.message : String(error))
  );
}

export { auth, db };

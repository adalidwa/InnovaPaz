const admin = require('firebase-admin');

const initializeFirebaseAdmin = () => {
  if (admin.apps.length === 0) {
    try {
      let serviceAccount;

      // Priorizar variables de entorno (para Vercel)
      if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_PRIVATE_KEY &&
        process.env.FIREBASE_CLIENT_EMAIL
      ) {
        console.log('🔧 Usando variables de entorno para Firebase Admin');
        serviceAccount = {
          type: 'service_account',
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
          token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
          universe_domain: 'googleapis.com',
        };
      } else {
        console.log('📁 Usando archivo serviceAccountKey.json local');
        serviceAccount = require('../serviceAccountKey.json');
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log('🔥 Firebase Admin inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando Firebase Admin:', error.message);
      console.log('💡 Verificar:');
      console.log('   - Variables de entorno FIREBASE_* en Vercel');
      console.log('   - Archivo serviceAccountKey.json en desarrollo local');
      console.log('   - Formato correcto de FIREBASE_PRIVATE_KEY (con \\n)');
    }
  }
  return admin;
};

const firebaseAuth = {
  createUser: async (email, password, displayName) => {
    try {
      const firebaseAdmin = initializeFirebaseAdmin();

      const userRecord = await firebaseAdmin.auth().createUser({
        email,
        password,
        displayName,
      });

      console.log(`✅ Guardia (Firebase Auth) creó usuario: ${userRecord.uid}`);

      return {
        success: true,
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      };
    } catch (error) {
      console.error('❌ Error hablando con el Guardia (Firebase Auth):', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  verifyToken: async (idToken) => {
    try {
      const firebaseAdmin = initializeFirebaseAdmin();

      // Validar que el token no esté vacío
      if (!idToken || typeof idToken !== 'string') {
        return {
          success: false,
          error: 'Token inválido o vacío',
        };
      }

      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);

      return {
        success: true,
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified,
        firebase_sign_in_provider: decodedToken.firebase?.sign_in_provider,
      };
    } catch (error) {
      console.error('❌ Error verificando token con el Guardia:', error);

      // Diferentes tipos de errores de Firebase
      let errorMessage = error.message;
      if (error.code === 'auth/id-token-expired') {
        errorMessage = 'Token expirado';
      } else if (error.code === 'auth/id-token-revoked') {
        errorMessage = 'Token revocado';
      } else if (error.code === 'auth/argument-error') {
        errorMessage = 'Formato de token inválido';
      }

      return {
        success: false,
        error: errorMessage,
        code: error.code,
      };
    }
  },

  getUser: async (uid) => {
    try {
      const firebaseAdmin = initializeFirebaseAdmin();

      const userRecord = await firebaseAdmin.auth().getUser(uid);

      return {
        success: true,
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified,
      };
    } catch (error) {
      console.error('❌ Error obteniendo usuario del Guardia:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  getUserByEmail: async (email) => {
    try {
      const firebaseAdmin = initializeFirebaseAdmin();

      const userRecord = await firebaseAdmin.auth().getUserByEmail(email);

      return {
        success: true,
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified,
      };
    } catch (error) {
      console.error('❌ Error obteniendo usuario por email del Guardia:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  deleteUser: async (uid) => {
    try {
      const firebaseAdmin = initializeFirebaseAdmin();

      await firebaseAdmin.auth().deleteUser(uid);

      console.log(`✅ Guardia eliminó usuario: ${uid}`);

      return {
        success: true,
      };
    } catch (error) {
      console.error('❌ Error eliminando usuario del Guardia:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

module.exports = { firebaseAuth };

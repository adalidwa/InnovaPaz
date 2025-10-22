const admin = require('firebase-admin');

const initializeFirebaseAdmin = () => {
  if (admin.apps.length === 0) {
    try {
      const serviceAccount = require('../serviceAccountKey.json');

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log('🔥 Firebase Admin inicializado correctamente');
    } catch (error) {
      console.warn('⚠️ Firebase Admin no configurado:', error.message);
      console.log(
        '💡 Asegúrate de tener el archivo "serviceAccountKey.json" en la raíz de "app-erp-backend" y que sea válido.'
      );
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

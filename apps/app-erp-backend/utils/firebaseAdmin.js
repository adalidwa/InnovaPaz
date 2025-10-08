import admin from 'firebase-admin';

// Configuración de Firebase Admin
const initializeFirebaseAdmin = () => {
  if (admin.apps.length === 0) {
    try {
      // Para desarrollo, usamos credenciales simplificadas
      // En este caso, necesitamos el archivo de credenciales o variables de entorno

      // Configuración mínima para desarrollo
      admin.initializeApp({
        projectId: 'innovapaz-demo', // Cambia por tu project ID
      });

      console.log('🔥 Firebase Admin inicializado correctamente');
    } catch (error) {
      console.warn('⚠️ Firebase Admin no configurado:', error.message);
      console.log('💡 Para usar Firebase Auth, configura las credenciales');
    }
  }
  return admin;
};

// El Coordinador habla con Firebase Auth (El Guardia)
export const firebaseAuth = {
  // Crear usuario en Firebase Auth
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

  // Verificar token de usuario
  verifyToken: async (idToken) => {
    try {
      const firebaseAdmin = initializeFirebaseAdmin();

      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);

      return {
        success: true,
        uid: decodedToken.uid,
        email: decodedToken.email,
      };
    } catch (error) {
      console.error('❌ Error verificando token con el Guardia:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Obtener usuario por UID
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

  // Obtener usuario por email
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

  // Eliminar usuario de Firebase Auth
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

export default firebaseAuth;

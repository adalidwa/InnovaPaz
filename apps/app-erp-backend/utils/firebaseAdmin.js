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
        // Fallback 1: Intentar archivo serviceAccountKey.json
        try {
          console.log('📁 Intentando archivo serviceAccountKey.json local');
          serviceAccount = require('../serviceAccountKey.json');
        } catch (fileError) {
          // Fallback 2: Credenciales hardcodeadas para Vercel (último recurso)
          console.log('🔧 Usando credenciales hardcodeadas para Vercel');
          serviceAccount = {
            type: 'service_account',
            project_id: 'innovapaz-auth',
            private_key_id: '23b7635132fa8e4d2e7453c69bfacef081d8f5ab',
            private_key:
              '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDECeZHdh7SQP+U\nf8e0S3Dx79dbqi7q/alkEXMvuR6Nni3X8lQiroUABJHHNMkiLbqr8dLUCGUO8NZf\nfTa7ZAQ1c3WyyOOV9GICopUc9e9fBD/htMFo2YCr3zFICFOIkKd/KPp7nfJyoBAs\nvu8K1cyi9B6Fwu8i6ggjZT6rd8sOMYQKwB9gqayiEGzOB63t8hqDVUQL9KXhPYCb\niAsujE7xjAfCYq+oXtIeLZgoaWRL6OyL0s0+sdF/bAQnNIMUedAD0DKrEcxQanEN\nxDTDXJhKFSOzqR10iB8ZG6LckVx5u64DXe+uRgrhUIjKQpcJ6TNurcvuONtbiV7B\nzrmVZ7FzAgMBAAECggEAC8TFtJqMZSDjzFK+IWkPVxGH7d0nQzzb02xnbCutKuFJ\nF+1YobBfvvgx7DHotTWQ6aDzKtQfhP3DpiiKhZtj0/WiJjaAeyXC+yzZeMtG2ym9\nJVvy6cwiOQSFcoaVb92x6ySsTN7W3uIUYStL3GxTWaEAHWruF5F8eut+ufp6D9hM\nJWMkqh6tlU9hZysAOsE/Obd0p4Mx37Yr9lY6YdVwIKstltT2UxaF5BhWbDlSpBdk\nvy5ugN6GsXewhq5aBzakAUe/vx/sMU/08pBWamp/SlaXIdkSTHV4I6SfZzvRbyfY\n2hPpcm6Lcf2BDfbS2lsO7Jov91OAYJbiwuxCDzDOCQKBgQDzmJGdiNIkMvfgSsHf\nZrDK7RsJzd6n7OfjWy5pb8I9vf1Btz7bKtSh5laecg7nJBkzb/q8Dz4zhVKC0I1T\ndWIgrNWbtitTLhOxh3nv/khwu2uGYn49Y/mdgQ6JMy+XU2ABuZYqtm/MkDwobRV7\n8Zw4AWbGi5aoaXc56811t9l0bwKBgQDOBWP33Beqh81venZSX1ZZ05uGEhwPxHwR\nsLtylqdo+LHJA6okbyttwQ3AOHaKxW0RitxGEPRUKxe/sW5g8yOI6Uo1sBnxc576\nh3x1kLnm/6aBBvn6UVYYt+gd5oKK7+vMb9E2qcyI2Z4fdeNqyrOpydGfaWRWo/NB\nzcL++O+9PQKBgDcfOSQ6x8KlPe4lPIW/CRaCXPH1AgNh2n9aLMBzJ7MtANgUDUcv\nA/q20rb7/F9VjdZT6psPn/Wsn6U2aCSQlWnrclLQADHMZWxwyakDE4VfA8/fDc36\nh4uanp1xVb2agkkho9d6fQX/RX2oYYowfDc4KfeXsrndU7tpno6a0bxFAoGAIQ7U\nX609TuvDlyO7YLRTks5Vokm9nvoUPnJxYY2zBzEAthSUdIwyF8ZmgnWM7++F9M6n\nUcberbLMeMHryDq7dPiaI8tCHnBDDkg3PFYgvmQ/P2zzJ6tteUHpSQL353tgBsna\ndD8CxuLEcJ/mAfjMo23y6PVsWEquedyecXNYZLECgYBc473q17ftDOYhSl3ks+zF\n3bA21N8TTKPCo3XXI+XhNwmKEGBlKefIVEGyevF3fPaISQ+xJECkxVRnva1Vu7WH\nS3etv8WbJgj05AKea7lU9Y6CdLytrgoj7oWqz0lTglO6QBAZ7RlCzIqi7P/jp15p\nkc3YZc9q3Y35Gd+Hon3ZaQ==\n-----END PRIVATE KEY-----\n',
            client_email: 'firebase-adminsdk-fbsvc@innovapaz-auth.iam.gserviceaccount.com',
            client_id: '115747924185582043855',
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://oauth2.googleapis.com/token',
            auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
            client_x509_cert_url:
              'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40innovapaz-auth.iam.gserviceaccount.com',
            universe_domain: 'googleapis.com',
          };
        }
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log('🔥 Firebase Admin inicializado correctamente');
      console.log('📋 Proyecto:', serviceAccount.project_id);
      console.log('📧 Email:', serviceAccount.client_email);
    } catch (error) {
      console.error('❌ Error inicializando Firebase Admin:', error.message);
      console.log('💡 Verificar:');
      console.log('   - Variables de entorno FIREBASE_* en Vercel');
      console.log('   - Archivo serviceAccountKey.json en desarrollo local');
      console.log('   - Formato correcto de FIREBASE_PRIVATE_KEY (con \\n)');
      console.log('   - Conectividad con Google Firebase APIs');
    }
  }
  return admin;
};

const firebaseAuth = {
  createUser: async (email, password, displayName) => {
    try {
      const firebaseAdmin = initializeFirebaseAdmin();

      // Verificar que Firebase Admin esté inicializado
      if (!admin.apps.length) {
        console.error('❌ Firebase Admin no está inicializado');
        return {
          success: false,
          error: 'Firebase Admin no está disponible',
        };
      }

      console.log(`🔄 Intentando crear usuario: ${email}`);

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
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);

      return {
        success: false,
        error: error.message,
        code: error.code,
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

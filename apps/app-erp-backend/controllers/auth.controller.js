const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Company = require('../models/company.model');
const Role = require('../models/role.model');
const { firebaseAuth } = require('../utils/firebaseAdmin');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

async function loginDirect(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos',
      });
    }

    const usuario = await User.findOne({ email: email.toLowerCase() });

    if (!usuario) {
      return res.status(400).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    if (usuario.password !== password) {
      return res.status(400).json({
        success: false,
        message: 'Credenciales incorrectas',
      });
    }

    if (!usuario.empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'Usuario sin empresa asociada',
      });
    }

    const token = jwt.sign(
      {
        uid: usuario.uid,
        email: usuario.email,
        empresa_id: usuario.empresa_id,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('[BACKEND] POST /api/auth/login - Usuario retornado:', {
      uid: usuario.uid,
      nombre_completo: usuario.nombre_completo,
      email: usuario.email,
      rol_id: usuario.rol_id,
      empresa_id: usuario.empresa_id,
      avatar_url: usuario.avatar_url,
    });

    res.json({
      success: true,
      token,
      usuario: {
        uid: usuario.uid,
        email: usuario.email,
        nombre_completo: usuario.nombre_completo,
        empresa_id: usuario.empresa_id,
        rol_id: usuario.rol_id,
        estado: usuario.estado,
        preferencias: usuario.preferencias,
        avatar_url: usuario.avatar_url || null,
      },
    });
  } catch (error) {
    console.error('Error en login directo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
}

async function registerUser(req, res) {
  let firebaseUser;
  try {
    const { email, password, nombre_completo, empresa_data } = req.body;

    if (!email || !password || !nombre_completo) {
      return res.status(400).json({ error: 'Email, password y nombre_completo son requeridos.' });
    }

    firebaseUser = await firebaseAuth.createUser(email, password, nombre_completo);
    if (!firebaseUser.success) {
      return res
        .status(400)
        .json({ error: 'Error al crear usuario en Firebase.', details: firebaseUser.error });
    }

    let empresa_id, rol_id;

    if (empresa_data) {
      const { nombre, tipo_empresa_id, plan_id } = empresa_data;

      const nuevaEmpresa = await Company.create({
        nombre,
        tipo_empresa_id,
        plan_id,
        estado_suscripcion: 'en_prueba',
      });
      empresa_id = nuevaEmpresa.empresa_id;

      const nuevoRol = await Role.create({
        empresa_id,
        nombre_rol: 'Administrador',
        permisos: { full_access: true },
        es_predeterminado: true,
        estado: 'activo',
      });
      rol_id = nuevoRol.rol_id;
    } else {
      empresa_id = null;
      rol_id = null;
    }

    const nuevoUsuario = await User.create({
      uid: firebaseUser.uid,
      empresa_id,
      rol_id,
      nombre_completo,
      email,
      estado: 'activo',
    });

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente.',
      usuario: nuevoUsuario,
      firebase_uid: firebaseUser.uid,
    });
  } catch (err) {
    if (firebaseUser && firebaseUser.success) {
      await firebaseAuth.deleteUser(firebaseUser.uid);
    }
    res.status(500).json({ error: 'Error al registrar usuario.', details: err.message });
  }
}

async function loginUser(req, res) {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Firebase ID Token es requerido.' });
    }

    const decodedFirebaseToken = await firebaseAuth.verifyToken(idToken);
    if (!decodedFirebaseToken.success) {
      return res
        .status(401)
        .json({ error: 'Token de Firebase inválido.', details: decodedFirebaseToken.error });
    }

    const usuario = await User.findOne({ uid: decodedFirebaseToken.uid });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado en la base de datos local.' });
    }

    const localToken = jwt.sign(
      {
        uid: usuario.uid,
        email: usuario.email,
        empresa_id: usuario.empresa_id,
        rol_id: usuario.rol_id,
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token: localToken, usuario });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
}

async function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido.' });
  }
}

async function verifyTokenEndpoint(req, res) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });

    const decoded = jwt.verify(token, JWT_SECRET);

    const usuario = await User.findOne({ uid: decoded.uid });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

    res.json({
      usuario: {
        uid: usuario.uid,
        email: usuario.email,
        nombre_completo: usuario.nombre_completo,
        empresa_id: usuario.empresa_id,
        rol_id: usuario.rol_id,
        estado: usuario.estado,
        preferencias: usuario.preferencias,
        avatar_url: usuario.avatar_url || null,
      },
    });
  } catch (err) {
    res.status(401).json({ error: 'Token inválido.' });
  }
}

async function logoutUser(req, res) {
  res.json({ success: true, message: 'Logout exitoso' });
}

// Nuevo: Autenticación con Google (login o registro automático)
async function googleAuth(req, res) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'Firebase ID Token es requerido.',
      });
    }

    // Verificar token de Firebase
    const decodedFirebaseToken = await firebaseAuth.verifyToken(idToken);
    if (!decodedFirebaseToken.success) {
      return res.status(401).json({
        success: false,
        error: 'Token de Firebase inválido.',
        details: decodedFirebaseToken.error,
      });
    }

    const { uid, email } = decodedFirebaseToken;

    // Obtener información adicional del usuario desde Firebase
    const firebaseUserInfo = await firebaseAuth.getUser(uid);
    if (!firebaseUserInfo.success) {
      return res.status(500).json({
        success: false,
        error: 'Error obteniendo información del usuario de Firebase',
      });
    }

    // Buscar usuario existente en PostgreSQL
    let usuario = await User.findOne({ uid });

    if (!usuario) {
      // Usuario no existe en PostgreSQL, crearlo sin empresa
      usuario = await User.create({
        uid,
        empresa_id: null,
        rol_id: null,
        nombre_completo: firebaseUserInfo.displayName || 'Usuario Google',
        email,
        estado: 'activo',
        preferencias: {},
      });

      console.log(`✅ Nuevo usuario Google creado en PostgreSQL: ${uid}`);
    }

    // Generar token JWT local
    const localToken = jwt.sign(
      {
        uid: usuario.uid,
        email: usuario.email,
        empresa_id: usuario.empresa_id,
        rol_id: usuario.rol_id,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Determinar si necesita configurar empresa
    const needsCompanySetup = !usuario.empresa_id;

    res.json({
      success: true,
      token: localToken,
      usuario: {
        uid: usuario.uid,
        email: usuario.email,
        nombre_completo: usuario.nombre_completo,
        empresa_id: usuario.empresa_id,
        rol_id: usuario.rol_id,
        estado: usuario.estado,
        preferencias: usuario.preferencias,
        avatar_url: usuario.avatar_url || null,
      },
      needsCompanySetup,
    });
  } catch (error) {
    console.error('Error en Google Auth:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message,
    });
  }
}

async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Acceso denegado. Token no proporcionado o formato incorrecto.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Intentar verificar como token de Firebase primero
    const firebaseResult = await firebaseAuth.verifyToken(token);

    if (firebaseResult.success) {
      // Es un token de Firebase válido - obtener datos completos del usuario
      const usuario = await User.findOne({ uid: firebaseResult.uid });

      req.user = {
        uid: firebaseResult.uid,
        email: firebaseResult.email,
        empresa_id: usuario?.empresa_id,
        rol_id: usuario?.rol_id,
        source: 'firebase',
      };
      return next();
    }

    // Si no es Firebase, intentar como JWT local
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        empresa_id: decoded.empresa_id,
        rol_id: decoded.rol_id,
        source: 'jwt',
      };
      return next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido (ni Firebase ni JWT local).',
      });
    }
  } catch (error) {
    console.error('Error en verifyFirebaseToken:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno al verificar token.',
    });
  }
}

// Endpoint protegido usando el nuevo middleware
async function getMe(req, res) {
  try {
    const usuario = await User.findOne({ uid: req.user.uid });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

    res.json({
      usuario: {
        uid: usuario.uid,
        nombre_completo: usuario.nombre_completo,
        email: usuario.email,
        rol_id: usuario.rol_id,
        empresa_id: usuario.empresa_id,
        avatar_url: usuario.avatar_url || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el usuario.' });
  }
}

// Nueva función específica para Google Auth en el ERP
async function googleLoginERP(req, res) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'Firebase ID Token es requerido.',
      });
    }

    // Verificar token de Firebase
    const decodedFirebaseToken = await firebaseAuth.verifyToken(idToken);
    if (!decodedFirebaseToken.success) {
      return res.status(401).json({
        success: false,
        error: 'Token de Firebase inválido.',
        details: decodedFirebaseToken.error,
      });
    }

    const { uid, email } = decodedFirebaseToken;

    // Buscar usuario existente en PostgreSQL
    const usuario = await User.findOne({ uid });

    if (!usuario) {
      return res.status(400).json({
        success: false,
        error: 'Usuario no encontrado. Regístrate desde el sitio web.',
      });
    }

    // Verificar que tenga empresa asociada
    if (!usuario.empresa_id) {
      return res.status(400).json({
        success: false,
        error: 'Usuario sin empresa asociada. Regístrate desde el sitio web.',
      });
    }

    // Generar token JWT local
    const localToken = jwt.sign(
      {
        uid: usuario.uid,
        email: usuario.email,
        empresa_id: usuario.empresa_id,
        rol_id: usuario.rol_id,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token: localToken,
      usuario: {
        uid: usuario.uid,
        email: usuario.email,
        nombre_completo: usuario.nombre_completo,
        empresa_id: usuario.empresa_id,
        rol_id: usuario.rol_id,
        estado: usuario.estado,
        preferencias: usuario.preferencias,
        avatar_url: usuario.avatar_url || null,
        rol: usuario.rol || 'Usuario',
      },
    });
  } catch (error) {
    console.error('Error en Google Auth ERP:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
}

// Nueva función para sincronizar sesión entre marketing y ERP
async function syncSession(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de autorización requerido',
      });
    }

    const marketingToken = authHeader.substring(7); // Remover 'Bearer '

    // Verificar token (puede ser JWT del marketing o Firebase token)
    let decodedToken;
    try {
      // Intentar verificar como JWT primero
      decodedToken = jwt.verify(marketingToken, JWT_SECRET);
    } catch (jwtError) {
      // Si falla, intentar verificar como Firebase token
      const firebaseResult = await firebaseAuth.verifyToken(marketingToken);
      if (!firebaseResult.success) {
        return res.status(401).json({
          success: false,
          error: 'Token inválido',
        });
      }
      decodedToken = firebaseResult;
    }

    const { uid } = decodedToken;

    // Buscar usuario en PostgreSQL
    const usuario = await User.findOne({ uid });

    if (!usuario) {
      return res.status(400).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    // Verificar que tenga empresa asociada
    if (!usuario.empresa_id) {
      return res.status(400).json({
        success: false,
        error: 'Usuario sin empresa asociada',
      });
    }

    // Generar nuevo token JWT para el ERP
    const erpToken = jwt.sign(
      {
        uid: usuario.uid,
        email: usuario.email,
        empresa_id: usuario.empresa_id,
        rol_id: usuario.rol_id,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token: erpToken,
      usuario: {
        uid: usuario.uid,
        email: usuario.email,
        nombre_completo: usuario.nombre_completo,
        empresa_id: usuario.empresa_id,
        rol_id: usuario.rol_id,
        estado: usuario.estado,
        preferencias: usuario.preferencias,
        avatar_url: usuario.avatar_url || null,
        rol: usuario.rol || 'Usuario',
      },
    });
  } catch (error) {
    console.error('Error en sincronización de sesión:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
}

module.exports = {
  loginDirect,
  loginUser,
  googleAuth, // Nuevo export
  googleLoginERP, // Export de la nueva función
  syncSession, // Nueva función de sincronización
  verifyToken,
  verifyTokenEndpoint,
  registerUser,
  logoutUser,
  verifyFirebaseToken,
  getMe,
};

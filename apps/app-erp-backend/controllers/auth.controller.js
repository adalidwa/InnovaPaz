const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Company = require('../models/company.model');
const Role = require('../models/role.model');
const { firebaseAuth } = require('../utils/firebaseAdmin');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

// Login directo con email/password (sin Firebase)
async function loginDirect(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos',
      });
    }

    // Buscar usuario en PostgreSQL por email
    const usuario = await User.findOne({ email: email.toLowerCase() });

    if (!usuario) {
      return res.status(400).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Verificar contraseña (si tienes contraseñas hasheadas)
    // Si no tienes contraseñas hasheadas aún, solo compara directamente
    // const passwordMatch = await bcrypt.compare(password, usuario.password_hash);
    // Por ahora, comparación directa (TEMPORAL - deberías hashear passwords)
    if (usuario.password !== password) {
      return res.status(400).json({
        success: false,
        message: 'Credenciales incorrectas',
      });
    }

    // Verificar que el usuario tenga una empresa
    if (!usuario.empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'Usuario sin empresa asociada',
      });
    }

    // Generar JWT token
    const token = jwt.sign(
      {
        uid: usuario.uid,
        email: usuario.email,
        empresa_id: usuario.empresa_id,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

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

// Registro coordinado (Firebase + PostgreSQL) - mantener para el sitio de marketing
async function registerUser(req, res) {
  let firebaseUser;
  try {
    const { email, password, nombre_completo, empresa_data } = req.body;

    // Validaciones
    if (!email || !password || !nombre_completo) {
      return res.status(400).json({ error: 'Email, password y nombre_completo son requeridos.' });
    }

    // 1. Crear usuario en Firebase Auth
    firebaseUser = await firebaseAuth.createUser(email, password, nombre_completo);
    if (!firebaseUser.success) {
      return res
        .status(400)
        .json({ error: 'Error al crear usuario en Firebase.', details: firebaseUser.error });
    }

    let empresa_id, rol_id;

    // 2. Si viene empresa_data, crear empresa completa (flujo con plan)
    if (empresa_data) {
      const { nombre, tipo_empresa_id, plan_id } = empresa_data;

      // Crear empresa
      const nuevaEmpresa = await Company.create({
        nombre,
        tipo_empresa_id,
        plan_id,
        estado_suscripcion: 'en_prueba',
      });
      empresa_id = nuevaEmpresa.empresa_id;

      // Crear rol de administrador para la empresa
      const nuevoRol = await Role.create({
        empresa_id,
        nombre_rol: 'Administrador',
        permisos: { full_access: true },
        es_predeterminado: true,
        estado: 'activo',
      });
      rol_id = nuevoRol.rol_id;
    } else {
      // Flujo simple: sin empresa (usuario básico)
      empresa_id = null;
      rol_id = null;
    }

    // 3. Crear usuario en PostgreSQL
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
    // Rollback: Si algo falla, eliminar el usuario de Firebase
    if (firebaseUser && firebaseUser.success) {
      await firebaseAuth.deleteUser(firebaseUser.uid);
    }
    res.status(500).json({ error: 'Error al registrar usuario.', details: err.message });
  }
}

// Login de usuario (usando Firebase ID Token)
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

// Verificar token JWT local
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

// Nuevo endpoint: Verifica el token y devuelve el usuario autenticado
async function verifyTokenEndpoint(req, res) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });

    const decoded = jwt.verify(token, JWT_SECRET);

    // Buscar usuario en la base de datos
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
      },
    });
  } catch (err) {
    res.status(401).json({ error: 'Token inválido.' });
  }
}

// Logout (opcional)
async function logoutUser(req, res) {
  // En este caso, como usamos JWT, el logout es principalmente del lado del cliente
  // Aquí podrías implementar una blacklist de tokens si lo necesitas
  res.json({ success: true, message: 'Logout exitoso' });
}

module.exports = {
  loginDirect, // <-- Este debe ser el export principal para login ERP
  loginUser, // (solo para login con Firebase, si lo usas en otro endpoint)
  verifyToken,
  verifyTokenEndpoint, // <-- Exportar el nuevo endpoint
  registerUser,
  logoutUser,
};

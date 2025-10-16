const User = require('../models/user.model');
const Company = require('../models/company.model');
const Role = require('../models/role.model');
const { firebaseAuth } = require('../utils/firebaseAdmin');
const cloudinary = require('../utils/cloudinaryConfig');
const { checkPlanLimits } = require('../middleware/planValidation');
const fs = require('fs');

async function getUsersByCompany(req, res) {
  try {
    const usuarios = await User.find({ empresa_id: req.params.companyId });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los usuarios de la empresa.' });
  }
}

async function getUserById(req, res) {
  try {
    const usuario = await User.findById(req.params.uid);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el usuario.' });
  }
}

async function createUser(req, res) {
  let firebaseUser;
  try {
    const { empresa_id, rol_id, nombre_completo, email, password, estado, preferencias } = req.body;

    // ===== VALIDACIONES =====
    // Validar campos requeridos
    if (!empresa_id || !rol_id || !nombre_completo || !email || !password) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios: empresa_id, rol_id, nombre_completo, email, password.',
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'El formato del email no es válido.' });
    }

    // Validar longitud de nombre
    if (nombre_completo.trim().length === 0) {
      return res.status(400).json({ error: 'El nombre completo no puede estar vacío.' });
    }
    if (nombre_completo.length > 150) {
      return res.status(400).json({ error: 'El nombre completo no puede exceder 150 caracteres.' });
    }

    // Validar longitud de email
    if (email.length > 150) {
      return res.status(400).json({ error: 'El email no puede exceder 150 caracteres.' });
    }

    // Validar contraseña
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    // Validar que la empresa exista
    const empresa = await Company.findById(empresa_id);
    if (!empresa) {
      return res.status(404).json({ error: `Empresa con ID ${empresa_id} no encontrada.` });
    }

    // Validar que el rol exista y pertenezca a la empresa
    const rol = await Role.findByIdAndCompany(rol_id, empresa_id);
    if (!rol) {
      return res.status(404).json({
        error: `Rol con ID ${rol_id} no encontrado o no pertenece a la empresa.`,
      });
    }

    // Validar que el email no esté en uso
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está registrado.' });
    }

    // Crear usuario en Firebase
    firebaseUser = await firebaseAuth.createUser(email, password, nombre_completo);
    if (!firebaseUser.success) {
      return res
        .status(400)
        .json({ error: 'Error al crear usuario en Firebase.', details: firebaseUser.error });
    }

    // Crear usuario en la base de datos
    const nuevoUsuario = await User.create({
      uid: firebaseUser.uid,
      empresa_id,
      rol_id,
      nombre_completo,
      email,
      estado: estado || 'activo',
      preferencias: preferencias || {},
    });

    res.status(201).json(nuevoUsuario);
  } catch (err) {
    console.error('Error al crear usuario:', err);
    // Rollback: eliminar usuario de Firebase si la creación en DB falla
    if (firebaseUser && firebaseUser.success) {
      await firebaseAuth.deleteUser(firebaseUser.uid);
    }
    res.status(500).json({ error: 'Error al crear el usuario.', details: err.message });
  }
}

async function updateUser(req, res) {
  try {
    const updateData = req.body;
    delete updateData.uid;
    delete updateData.email;
    delete updateData.empresa_id;
    const usuarioActualizado = await User.findByIdAndUpdate(req.params.uid, updateData);
    if (!usuarioActualizado) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(usuarioActualizado);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar el usuario.' });
  }
}

async function deleteUser(req, res) {
  try {
    const { uid } = req.params;
    const usuario = await User.findOneAndDelete({ uid: uid });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
    await firebaseAuth.deleteUser(uid);
    res.json({ mensaje: 'Usuario eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el usuario.', details: err.message });
  }
}

async function changeUserRole(req, res) {
  try {
    const { newRoleId } = req.body;
    const { uid } = req.params;
    if (!newRoleId) {
      return res.status(400).json({ error: 'El campo newRoleId es requerido.' });
    }
    const user = await User.findById(uid);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    const role = await Role.findByIdAndCompany(newRoleId, user.empresa_id);
    if (!role) {
      return res
        .status(404)
        .json({ error: `El rol con ID ${newRoleId} no existe o no pertenece a esta empresa.` });
    }
    const usuarioActualizado = await User.findByIdAndUpdate(uid, { rol_id: newRoleId });
    res.json({ mensaje: 'Rol actualizado correctamente.', usuario: usuarioActualizado });
  } catch (err) {
    res.status(500).json({ error: 'Error interno al cambiar el rol del usuario.' });
  }
}

async function updatePreferences(req, res) {
  try {
    const { preferencias } = req.body;
    if (typeof preferencias !== 'object' || preferencias === null) {
      return res.status(400).json({ error: 'El campo "preferencias" debe ser un objeto JSON.' });
    }
    const usuario = await User.findByIdAndUpdate(
      req.params.uid,
      { preferencias: preferencias },
      { new: true } // Retorna el documento actualizado
    );
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json({
      mensaje: 'Preferencias actualizadas correctamente.',
      usuario: usuario,
      preferencias: usuario.preferencias,
    });
  } catch (err) {
    console.error('Error actualizando preferencias:', err);
    res.status(500).json({ error: 'Error al actualizar las preferencias.', details: err.message });
  }
}

async function completeCompanySetup(req, res) {
  try {
    const { empresa_data } = req.body;
    const firebase_uid = req.user.uid; // Obtener del token verificado

    if (!empresa_data) {
      return res.status(400).json({
        success: false,
        error: 'Datos de la empresa son requeridos.',
      });
    }

    const { nombre, tipo_empresa_id, plan_id } = empresa_data;
    if (!nombre || !tipo_empresa_id || !plan_id) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos de la empresa (nombre, tipo_empresa_id, plan_id).',
      });
    }

    // Verificar que el usuario existe y no tiene empresa
    const existingUser = await User.findOne({ uid: firebase_uid });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado.',
      });
    }

    if (existingUser.empresa_id) {
      return res.status(409).json({
        success: false,
        error: 'El usuario ya tiene una empresa configurada.',
      });
    }

    // Crear empresa
    const nuevaEmpresa = await Company.create({
      nombre,
      tipo_empresa_id,
      plan_id,
      estado_suscripcion: 'en_prueba',
    });

    // Crear rol de administrador
    const nuevoRol = await Role.create({
      empresa_id: nuevaEmpresa.empresa_id,
      nombre_rol: 'Administrador',
      permisos: { full_access: true },
      es_predeterminado: true,
      estado: 'activo',
    });

    // Actualizar usuario
    const usuarioActualizado = await User.findByIdAndUpdate(firebase_uid, {
      empresa_id: nuevaEmpresa.empresa_id,
      rol_id: nuevoRol.rol_id,
      estado: 'activo',
    });

    res.status(200).json({
      success: true,
      mensaje: 'Configuración de empresa completada.',
      empresa: nuevaEmpresa,
      usuario: usuarioActualizado,
      rol: nuevoRol,
    });
  } catch (err) {
    console.error('Error en completeCompanySetup:', err);
    res.status(500).json({
      success: false,
      error: 'Error al completar la configuración de la empresa.',
      details: err.message,
    });
  }
}

async function uploadUserAvatar(req, res) {
  try {
    const uid = req.params.uid;

    // Validación: archivo requerido
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });
    }

    // Validación: verificar que el usuario exista
    const usuario = await User.findById(uid);
    if (!usuario) {
      // Eliminar archivo temporal si el usuario no existe
      if (req.file.path) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Validación: tipo de archivo (solo imágenes)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        error: 'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP).',
      });
    }

    // Validación: tamaño máximo (2MB para avatares)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (req.file.size > maxSize) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        error: 'El archivo es demasiado grande. Tamaño máximo: 2MB.',
      });
    }

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'user_avatars',
      public_id: `usuario_${uid}_avatar`,
      overwrite: true,
      transformation: [
        { width: 300, height: 300, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    // Eliminar archivo temporal
    fs.unlink(req.file.path, () => {});

    // Actualizar base de datos
    const usuarioActualizado = await User.findByIdAndUpdate(uid, {
      avatar_url: result.secure_url,
      avatar_public_id: result.public_id,
    });

    console.log('[BACKEND] POST /api/users/upload/avatar/:uid - Respuesta:', {
      avatar_url: result.secure_url,
      avatar_public_id: result.public_id,
    });

    res.json({
      avatar_url: result.secure_url,
      avatar_public_id: result.public_id,
      message: 'Avatar subido exitosamente.',
    });
  } catch (err) {
    console.error('Error al subir avatar:', err);
    // Eliminar archivo temporal en caso de error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ error: 'Error al subir el avatar.', details: err.message });
  }
}

module.exports = {
  getUsersByCompany,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole,
  updatePreferences,
  completeCompanySetup,
  uploadUserAvatar,
};

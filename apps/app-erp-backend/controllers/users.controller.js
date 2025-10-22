const User = require('../models/user.model');
const Company = require('../models/company.model');
const Role = require('../models/role.model');
const { firebaseAuth } = require('../utils/firebaseAdmin');
const cloudinary = require('../utils/cloudinaryConfig');
const { checkPlanLimits } = require('../middleware/planValidation');
const fs = require('fs');

async function getUsersByCompany(req, res) {
  try {
    const empresaId = req.params.empresa_id; // Nombre correcto del parámetro de la ruta
    console.log('🔍 [getUsersByCompany] Buscando usuarios para empresa_id:', empresaId);
    const usuarios = await User.find({ empresa_id: empresaId });
    console.log(
      `✅ [getUsersByCompany] Encontrados ${usuarios.length} usuarios para empresa_id: ${empresaId}`
    );
    console.log(
      '📋 [getUsersByCompany] Primeros 3 usuarios:',
      usuarios
        .slice(0, 3)
        .map((u) => ({ uid: u.uid, nombre: u.nombre_completo, empresa_id: u.empresa_id }))
    );
    res.json(usuarios);
  } catch (err) {
    console.error('❌ [getUsersByCompany] Error:', err);
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
    const { empresa_data, firebase_uid, user_email, user_name } = req.body;

    // Obtener firebase_uid del token si está disponible, o del body para registro inicial
    let uid = firebase_uid;
    if (!uid && req.user) {
      uid = req.user.uid;
    }

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'UID de Firebase es requerido.',
      });
    }

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

    // Verificar si el usuario existe en PostgreSQL
    let existingUser = await User.findOne({ uid });

    if (!existingUser) {
      // Usuario NO existe en PostgreSQL (explorador de Firebase)
      // Lo creamos usando la información del token JWT o de Firebase
      console.log(`📝 Creando usuario en PostgreSQL para UID: ${uid}`);

      let userEmail = user_email; // Usar el email enviado desde el frontend
      let userName = user_name || 'Usuario'; // Usar el nombre enviado desde el frontend

      // Si no vienen los datos del frontend, intentar obtenerlos de Firebase
      if (!userEmail) {
        try {
          const firebaseUserInfo = await firebaseAuth.getUser(uid);

          if (firebaseUserInfo.success) {
            userEmail = firebaseUserInfo.email;
            userName = firebaseUserInfo.displayName || userName;
          }
        } catch (firebaseError) {
          console.warn('⚠️ No se pudo obtener info de Firebase');
        }
      }

      if (!userEmail) {
        return res.status(400).json({
          success: false,
          error: 'No se pudo obtener el email del usuario. Por favor, intente nuevamente.',
        });
      }

      // Crear usuario en PostgreSQL SIN empresa (por ahora)
      existingUser = await User.create({
        uid,
        empresa_id: null,
        rol_id: null,
        nombre_completo: userName,
        email: userEmail,
        estado: 'activo',
      });

      console.log(`✅ Usuario creado en PostgreSQL: ${uid} (${userEmail})`);
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

    // ===== ACTIVAR SUSCRIPCIÓN Y PERÍODO DE PRUEBA (SI APLICA) =====
    const SubscriptionService = require('../services/subscriptionService');
    const subscriptionResult = await SubscriptionService.setupInitialSubscription(
      nuevaEmpresa.empresa_id,
      plan_id
    );

    // ===== NUEVO SISTEMA: USAR PLANTILLAS DE ROLES =====
    const RolePlantilla = require('../models/rolePlantilla.model');
    const TypeCompany = require('../models/typeCompany.model');
    const Plan = require('../models/plan.model');

    // Obtener datos del tipo de empresa y plan
    const tipoEmpresa = await TypeCompany.findById(tipo_empresa_id);
    const plan = await Plan.findById(plan_id);

    if (!tipoEmpresa || !plan) {
      throw new Error('Tipo de empresa o plan no encontrado');
    }

    // Buscar la plantilla de Administrador para este tipo de empresa
    const plantillaAdministrador = await RolePlantilla.findByNombreYTipo(
      'Administrador',
      tipo_empresa_id
    );

    if (!plantillaAdministrador) {
      throw new Error('No se encontró la plantilla de rol Administrador para este tipo de empresa');
    }

    // En el nuevo sistema, podemos asignar directamente la plantilla al usuario
    // o crear un rol temporal basado en la plantilla (por compatibilidad)

    // OPCIÓN: Crear rol de Administrador basado en plantilla (para compatibilidad con sistema actual)
    const rolAdministrador = await Role.create({
      empresa_id: nuevaEmpresa.empresa_id,
      nombre_rol: 'Administrador',
      permisos: plantillaAdministrador.permisos,
      es_predeterminado: true,
      estado: 'activo',
      plantilla_id_origen: plantillaAdministrador.plantilla_id,
    });

    const rol_id = rolAdministrador.rol_id;

    console.log(
      '✅ [NUEVO SISTEMA] Empresa creada con sistema de plantillas. Solo se creó rol de Administrador.'
    );
    console.log(
      '📋 Plantillas disponibles para esta empresa:',
      await RolePlantilla.findByTipoEmpresa(tipo_empresa_id)
    );

    // Actualizar usuario - asignar rol_id
    const updatedUser = await User.findByIdAndUpdate(uid, {
      empresa_id: nuevaEmpresa.empresa_id,
      rol_id,
      estado: 'activo',
    });

    // Obtener plantillas disponibles para mostrar en el frontend
    const plantillasDisponibles = await RolePlantilla.findByTipoEmpresa(tipo_empresa_id);

    // Generar nuevo token JWT con información actualizada del usuario
    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = process.env;

    const updatedToken = jwt.sign(
      {
        uid: updatedUser.uid,
        email: updatedUser.email,
        empresa_id: updatedUser.empresa_id,
        rol_id: updatedUser.rol_id,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      mensaje: 'Configuración de empresa completada exitosamente.',
      token: updatedToken, // Nuevo token con información actualizada
      empresa: nuevaEmpresa,
      usuario: {
        uid: updatedUser.uid,
        email: updatedUser.email,
        nombre_completo: updatedUser.nombre_completo,
        empresa_id: updatedUser.empresa_id,
        rol_id: updatedUser.rol_id,
        rol: rolAdministrador.nombre_rol, // Incluir el nombre del rol
        estado: updatedUser.estado,
      },
      rol: rolAdministrador,
      suscripcion: subscriptionResult,
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
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Validación: tipo de archivo (ya se valida en multer, pero por seguridad)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: 'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP).',
      });
    }

    // Validación: tamaño máximo (ya se valida en multer, pero por seguridad)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        error: 'El archivo es demasiado grande. Tamaño máximo: 2MB.',
      });
    }

    // Subir a Cloudinary desde buffer (sin archivo temporal)
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'user_avatars',
            public_id: `usuario_${uid}_avatar`,
            overwrite: true,
            transformation: [
              { width: 300, height: 300, crop: 'fill', gravity: 'face' },
              { quality: 'auto' },
              { fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(req.file.buffer);
    });

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
    res.status(500).json({ error: 'Error al subir el avatar.', details: err.message });
  }
}

async function checkCompanySetup(req, res) {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'UID de Firebase es requerido.',
      });
    }

    // Buscar el usuario por firebase_uid en PostgreSQL
    const user = await User.findOne({ uid: uid });

    if (!user) {
      // Usuario NO existe en PostgreSQL (es un explorador solo de Firebase)
      // Esto es NORMAL - no es un error
      return res.status(200).json({
        success: true,
        data: {
          tiene_empresa: false,
          usuario: null, // No existe en PostgreSQL aún
          needs_creation: true, // Flag para indicar que necesita ser creado
        },
      });
    }

    // Usuario existe en PostgreSQL - verificar si tiene empresa
    const hasCompany = !!user.empresa_id;

    res.status(200).json({
      success: true,
      data: {
        tiene_empresa: hasCompany,
        usuario: {
          uid: user.uid,
          nombre_completo: user.nombre_completo,
          email: user.email,
          empresa_id: user.empresa_id,
        },
        needs_creation: false,
      },
    });
  } catch (err) {
    console.error('Error en checkCompanySetup:', err);
    res.status(500).json({
      success: false,
      error: 'Error al verificar configuración de empresa.',
      details: err.message,
    });
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
  checkCompanySetup,
  uploadUserAvatar,
};

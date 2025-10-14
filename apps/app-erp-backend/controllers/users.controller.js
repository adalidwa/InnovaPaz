const User = require('../models/user.model');
const Company = require('../models/company.model');
const Role = require('../models/role.model');
const { firebaseAuth } = require('../utils/firebaseAdmin');
const cloudinary = require('../utils/cloudinaryConfig');
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
    if (!empresa_id || !rol_id || !nombre_completo || !email || !password) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios: empresa_id, rol_id, nombre_completo, email, password.',
      });
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'El formato del email no es válido.' });
    }
    firebaseUser = await firebaseAuth.createUser(email, password, nombre_completo);
    if (!firebaseUser.success) {
      return res
        .status(400)
        .json({ error: 'Error al crear usuario en Firebase.', details: firebaseUser.error });
    }
    const nuevoUsuario = await User.create({
      uid: firebaseUser.uid,
      empresa_id,
      rol_id,
      nombre_completo,
      email,
      estado,
      preferencias,
    });
    res.status(201).json(nuevoUsuario);
  } catch (err) {
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
    const { prefs } = req.body;
    if (typeof prefs !== 'object' || prefs === null) {
      return res.status(400).json({ error: 'El campo "prefs" debe ser un objeto JSON.' });
    }
    const usuario = await User.findByIdAndUpdate(req.params.uid, { preferencias: prefs });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json({ mensaje: 'Preferencias actualizadas.', usuario });
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar las preferencias.' });
  }
}

async function completeCompanySetup(req, res) {
  try {
    const { firebase_uid, email, nombre_completo, empresa_data } = req.body;
    if (!firebase_uid || !email || !nombre_completo || !empresa_data) {
      return res.status(400).json({
        error: 'Faltan datos obligatorios para completar la configuración de la empresa.',
      });
    }
    const { nombre, tipo_empresa_id, plan_id } = empresa_data;
    if (!nombre || !tipo_empresa_id || !plan_id) {
      return res
        .status(400)
        .json({ error: 'Faltan datos de la empresa (nombre, tipo_empresa_id, plan_id).' });
    }
    const existingUser = await User.findOne({ uid: firebase_uid });
    if (existingUser && existingUser.empresa_id) {
      return res.status(409).json({ error: 'El usuario ya tiene una empresa configurada.' });
    }
    const nuevaEmpresa = await Company.create({
      nombre,
      tipo_empresa_id,
      plan_id,
      estado_suscripcion: 'en_prueba',
    });
    const empresa_id = nuevaEmpresa.empresa_id;
    const nuevoRol = await Role.create({
      empresa_id,
      nombre_rol: 'Administrador',
      permisos: { full_access: true },
      es_predeterminado: true,
      estado: 'activo',
    });
    const rol_id = nuevoRol.rol_id;
    const usuarioActualizado = await User.findByIdAndUpdate(firebase_uid, {
      empresa_id,
      rol_id,
      nombre_completo,
      email,
      estado: 'activo',
    });
    if (!usuarioActualizado) {
      const nuevoUsuario = await User.create({
        uid: firebase_uid,
        empresa_id,
        rol_id,
        nombre_completo,
        email,
        estado: 'activo',
      });
      return res.status(201).json({
        mensaje: 'Configuración de empresa completada y usuario creado.',
        empresa: nuevaEmpresa,
        usuario: nuevoUsuario,
        rol: nuevoRol,
      });
    }
    res.status(200).json({
      mensaje: 'Configuración de empresa completada y usuario actualizado.',
      empresa: nuevaEmpresa,
      usuario: usuarioActualizado,
      rol: nuevoRol,
    });
  } catch (err) {
    console.error('Error en completeCompanySetup:', err);
    res
      .status(500)
      .json({ error: 'Error al completar la configuración de la empresa.', details: err.message });
  }
}

async function uploadUserAvatar(req, res) {
  try {
    const uid = req.params.uid;
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });
    }
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'user_avatars',
      public_id: `usuario_${uid}_avatar`,
      overwrite: true,
    });
    fs.unlink(req.file.path, () => {});
    const usuarioActualizado = await User.findByIdAndUpdate(uid, {
      avatar_url: result.secure_url,
    });
    if (!usuarioActualizado) return res.status(404).json({ error: 'Usuario no encontrado.' });
    console.log('[BACKEND] POST /api/users/upload/avatar/:uid - Respuesta:', {
      avatar_url: result.secure_url,
    });
    res.json({ avatar_url: result.secure_url });
  } catch (err) {
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

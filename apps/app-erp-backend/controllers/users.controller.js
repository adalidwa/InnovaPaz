const User = require('../models/user.model');
const Company = require('../models/company.model');
const Role = require('../models/role.model');
const { firebaseAuth } = require('../utils/firebaseAdmin');

// Obtiene todos los usuarios de una empresa
async function getUsersByCompany(req, res) {
  try {
    const usuarios = await User.find({ empresa_id: req.params.companyId });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los usuarios de la empresa.' });
  }
}

// Obtiene un usuario por su UID
async function getUserById(req, res) {
  try {
    const usuario = await User.findById(req.params.uid);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el usuario.' });
  }
}

// Crea un nuevo usuario (vincula con empresa y rol)
async function createUser(req, res) {
  let firebaseUser;
  try {
    const { empresa_id, rol_id, nombre_completo, email, password, estado, preferencias } = req.body;

    // --- Validación de campos obligatorios ---
    if (!empresa_id || !rol_id || !nombre_completo || !email || !password) {
      return res
        .status(400)
        .json({
          error:
            'Faltan campos obligatorios: empresa_id, rol_id, nombre_completo, email, password.',
        });
    }

    // --- Validación de formato de email (básica) ---
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'El formato del email no es válido.' });
    }

    // 1. Crear usuario en Firebase Auth
    firebaseUser = await firebaseAuth.createUser(email, password, nombre_completo);
    if (!firebaseUser.success) {
      return res
        .status(400)
        .json({ error: 'Error al crear usuario en Firebase.', details: firebaseUser.error });
    }

    // 2. Crear usuario en la base de datos local
    const nuevoUsuario = await User.create({
      uid: firebaseUser.uid, // UID de Firebase
      empresa_id,
      rol_id,
      nombre_completo,
      email,
      estado,
      preferencias,
    });
    res.status(201).json(nuevoUsuario);
  } catch (err) {
    // Rollback
    if (firebaseUser && firebaseUser.success) {
      await firebaseAuth.deleteUser(firebaseUser.uid);
    }
    res.status(500).json({ error: 'Error al crear el usuario.', details: err.message });
  }
}

// Actualiza un usuario
async function updateUser(req, res) {
  try {
    const updateData = req.body;

    // --- Proteger campos críticos ---
    // Aseguramos que no se pueda cambiar el UID, email o empresa_id desde esta función.
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

// Elimina un usuario de Postgres y Firebase
async function deleteUser(req, res) {
  try {
    const { uid } = req.params;

    // 1. Eliminar de la base de datos local
    const usuario = await User.findOneAndDelete({ uid: uid });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

    // 2. Eliminar de Firebase Auth
    await firebaseAuth.deleteUser(uid);

    res.json({ mensaje: 'Usuario eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el usuario.', details: err.message });
  }
}

// Cambia el rol de un usuario
async function changeUserRole(req, res) {
  try {
    const { newRoleId } = req.body;
    const { uid } = req.params;

    if (!newRoleId) {
      return res.status(400).json({ error: 'El campo newRoleId es requerido.' });
    }

    // 1. Verificar que el usuario existe para obtener su empresa_id
    const user = await User.findById(uid);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // 2. Verificar que el rol existe Y pertenece a la misma empresa
    const role = await Role.findByIdAndCompany(newRoleId, user.empresa_id);
    if (!role) {
      return res
        .status(404)
        .json({ error: `El rol con ID ${newRoleId} no existe o no pertenece a esta empresa.` });
    }

    // 3. Si todo es correcto, actualizar el rol del usuario
    const usuarioActualizado = await User.findByIdAndUpdate(uid, { rol_id: newRoleId });

    res.json({ mensaje: 'Rol actualizado correctamente.', usuario: usuarioActualizado });
  } catch (err) {
    res.status(500).json({ error: 'Error interno al cambiar el rol del usuario.' });
  }
}

// Actualiza las preferencias de un usuario
async function updatePreferences(req, res) {
  try {
    const { prefs } = req.body;
    if (typeof prefs !== 'object' || prefs === null) {
      return res.status(400).json({ error: 'El campo "prefs" debe ser un objeto JSON.' });
    }
    const usuario = await User.findByIdAndUpdate(
      req.params.uid, // Usar UID de la URL
      { preferencias: prefs }
    );
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json({ mensaje: 'Preferencias actualizadas.', usuario });
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar las preferencias.' });
  }
}

// Nuevo: Completa la configuración de la empresa para un usuario de Firebase existente
async function completeCompanySetup(req, res) {
  try {
    const { firebase_uid, email, nombre_completo, empresa_data } = req.body;

    // Validaciones
    if (!firebase_uid || !email || !nombre_completo || !empresa_data) {
      return res
        .status(400)
        .json({
          error: 'Faltan datos obligatorios para completar la configuración de la empresa.',
        });
    }
    const { nombre, tipo_empresa_id, plan_id } = empresa_data;
    if (!nombre || !tipo_empresa_id || !plan_id) {
      return res
        .status(400)
        .json({ error: 'Faltan datos de la empresa (nombre, tipo_empresa_id, plan_id).' });
    }

    // 1. Verificar que el usuario de Firebase existe (opcional, Firebase Auth ya lo hizo)
    // const firebaseUserCheck = await firebaseAuth.getUser(firebase_uid);
    // if (!firebaseUserCheck.success) {
    //   return res.status(404).json({ error: 'Usuario de Firebase no encontrado.' });
    // }

    // 2. Verificar si el usuario ya tiene una empresa en PostgreSQL
    const existingUser = await User.findOne({ uid: firebase_uid });
    if (existingUser && existingUser.empresa_id) {
      return res.status(409).json({ error: 'El usuario ya tiene una empresa configurada.' });
    }

    // 3. Crear la empresa en PostgreSQL
    const nuevaEmpresa = await Company.create({
      nombre,
      tipo_empresa_id,
      plan_id,
      estado_suscripcion: 'en_prueba',
    });
    const empresa_id = nuevaEmpresa.empresa_id;

    // 4. Crear el rol de Administrador para la nueva empresa
    const nuevoRol = await Role.create({
      empresa_id,
      nombre_rol: 'Administrador',
      permisos: { full_access: true },
      es_predeterminado: true,
      estado: 'activo',
    });
    const rol_id = nuevoRol.rol_id;

    // 5. Actualizar el usuario existente en PostgreSQL con la empresa y el rol
    const usuarioActualizado = await User.findByIdAndUpdate(firebase_uid, {
      empresa_id,
      rol_id,
      nombre_completo,
      email,
      estado: 'activo',
    });

    if (!usuarioActualizado) {
      // Si el usuario no existía en PostgreSQL, crearlo (esto no debería pasar si el flujo es correcto)
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

module.exports = {
  getUsersByCompany,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole,
  updatePreferences,
  completeCompanySetup, // Exportar la nueva función
};

const Company = require('../models/company.model');
const TypeCompany = require('../models/typeCompany.model');
const User = require('../models/user.model');
const Role = require('../models/role.model'); // Importar el modelo de Rol
const { firebaseAuth } = require('../utils/firebaseAdmin');

// Lista todas las empresas
async function getAllCompanies(req, res) {
  try {
    const empresas = await Company.find();
    res.json(empresas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las empresas.' });
  }
}

// Obtiene una empresa por su ID
async function getCompanyById(req, res) {
  try {
    const empresa = await Company.findById(req.params.empresa_id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada.' });
    res.json(empresa);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la empresa.' });
  }
}

// Crea una nueva empresa y su primer usuario (admin)
async function createCompany(req, res) {
  let firebaseUser;
  try {
    const {
      nombre,
      tipo_empresa_id,
      plan_id, // Datos de la empresa
      nombre_completo,
      email,
      password, // Datos del usuario admin
    } = req.body;

    // 1. Crear usuario en Firebase Auth
    firebaseUser = await firebaseAuth.createUser(email, password, nombre_completo);
    if (!firebaseUser.success) {
      return res
        .status(400)
        .json({ error: 'Error al crear usuario en Firebase.', details: firebaseUser.error });
    }

    // 2. Crear la empresa en Postgres
    const empresaGuardada = await Company.create({
      nombre,
      tipo_empresa_id,
      plan_id,
      estado_suscripcion: 'en_prueba',
    });

    // 3. Crear el rol de Administrador para la nueva empresa
    const nuevoRol = await Role.create({
      empresa_id: empresaGuardada.empresa_id,
      nombre_rol: 'Administrador',
      permisos: { full_access: true }, // Permisos de ejemplo
      es_predeterminado: true,
      estado: 'activo',
    });

    // 4. Crear el usuario en Postgres con el nuevo rol
    const nuevoUsuario = await User.create({
      uid: firebaseUser.uid,
      empresa_id: empresaGuardada.empresa_id,
      rol_id: nuevoRol.rol_id, // Usar el ID del rol recién creado
      nombre_completo,
      email,
      estado: 'activo',
    });

    res.status(201).json({ empresa: empresaGuardada, usuario: nuevoUsuario });
  } catch (err) {
    // Rollback: Si algo falla, eliminar el usuario de Firebase si se creó.
    if (firebaseUser && firebaseUser.success) {
      await firebaseAuth.deleteUser(firebaseUser.uid);
    }
    res.status(500).json({ error: 'Error al crear la empresa.', details: err.message });
  }
}

// Actualiza ajustes, plan o estado de una empresa
async function updateCompany(req, res) {
  try {
    const empresaActualizada = await Company.findByIdAndUpdate(req.params.empresa_id, req.body);
    if (!empresaActualizada) return res.status(404).json({ error: 'Empresa no encontrada.' });
    res.json(empresaActualizada);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar la empresa.' });
  }
}

// Elimina una empresa
async function deleteCompany(req, res) {
  try {
    // Nota: Deberías tener una lógica para eliminar/archivar usuarios asociados.
    const empresa = await Company.findByIdAndDelete(req.params.empresa_id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada.' });
    res.json({ mensaje: 'Empresa eliminada correctamente.' });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar la empresa.' });
  }
}

// Cambia el plan de una empresa
async function changePlan(req, res) {
  try {
    const { planId } = req.body;
    const empresa = await Company.findByIdAndUpdate(req.params.empresa_id, { plan_id: planId });
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada.' });
    res.json({ mensaje: 'Plan cambiado correctamente.', empresa });
  } catch (err) {
    res.status(400).json({ error: 'Error al cambiar el plan de la empresa.' });
  }
}

// Actualiza el estado de suscripción de una empresa
async function updateSubscriptionStatus(req, res) {
  try {
    const { status } = req.body;
    const empresa = await Company.findByIdAndUpdate(req.params.empresa_id, {
      estado_suscripcion: status,
    });
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada.' });
    res.json({ mensaje: 'Estado de suscripción actualizado.', empresa });
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar el estado de suscripción.' });
  }
}

// --- Gestión de Tipos de Empresa ---

// Lista todos los tipos de empresa
async function getAllCompanyTypes(req, res) {
  try {
    const tipos = await TypeCompany.find();
    res.json(tipos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los tipos de empresa.' });
  }
}

// Crea un nuevo tipo de empresa
async function createCompanyType(req, res) {
  try {
    const { tipo_empresa } = req.body;
    const nuevoTipo = await TypeCompany.create({ tipo_empresa });
    res.status(201).json(nuevoTipo);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear el tipo de empresa.' });
  }
}

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  changePlan,
  updateSubscriptionStatus,
  getAllCompanyTypes,
  createCompanyType,
};

const Company = require('../models/company.model');
const TypeCompany = require('../models/typeCompany.model');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const { firebaseAuth } = require('../utils/firebaseAdmin');
const cloudinary = require('../utils/cloudinaryConfig');
const fs = require('fs');

async function getAllCompanies(req, res) {
  try {
    const empresas = await Company.find();
    const tiposEmpresa = await TypeCompany.find();
    const empresasFormateadas = empresas.map((empresa) => {
      let tipoNegocio = '';
      if (empresa.tipo_empresa_id) {
        const tipo = tiposEmpresa.find(
          (t) => t.id === empresa.tipo_empresa_id || t.tipo_empresa_id === empresa.tipo_empresa_id
        );
        tipoNegocio = tipo ? tipo.tipo_empresa : '';
      }
      return {
        ...empresa,
        ajustes: {
          nombre: empresa.nombre || '',
          tipoNegocio,
          zonaHoraria: empresa.zona_horaria || '',
          identidad_visual: empresa.ajustes?.identidad_visual || {},
          ...empresa.ajustes,
        },
      };
    });
    res.json({ empresas: empresasFormateadas });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las empresas.' });
  }
}

async function getCompanyById(req, res) {
  try {
    const empresa = await Company.findById(req.params.empresa_id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada.' });
    let tipoNegocio = '';
    let tipoNegocioId = empresa.tipo_empresa_id || '';
    if (empresa.tipo_empresa_id) {
      const tiposEmpresa = await TypeCompany.find();
      const tipo = tiposEmpresa.find(
        (t) => t.id === empresa.tipo_empresa_id || t.tipo_empresa_id === empresa.tipo_empresa_id
      );
      if (tipo) {
        tipoNegocio = TypeCompany.normalizeTypeValue(tipo.tipo_empresa);
      }
    }
    res.json({
      empresa: {
        ...empresa,
        tipo_empresa_id: tipoNegocioId,
        tipoNegocio,
        ajustes: {
          nombre: empresa.nombre || empresa.ajustes?.nombre || '',
          tipoNegocio: tipoNegocio || empresa.ajustes?.tipoNegocio || '',
          zonaHoraria: empresa.zona_horaria || empresa.ajustes?.zonaHoraria || '',
          identidad_visual: empresa.ajustes?.identidad_visual || {},
          ...empresa.ajustes,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la empresa.' });
  }
}

async function createCompany(req, res) {
  let firebaseUser;
  try {
    const { nombre, tipo_empresa_id, plan_id, nombre_completo, email, password } = req.body;
    firebaseUser = await firebaseAuth.createUser(email, password, nombre_completo);
    if (!firebaseUser.success) {
      return res
        .status(400)
        .json({ error: 'Error al crear usuario en Firebase.', details: firebaseUser.error });
    }
    const empresaGuardada = await Company.create({
      nombre,
      tipo_empresa_id,
      plan_id,
      estado_suscripcion: 'en_prueba',
    });
    const nuevoRol = await Role.create({
      empresa_id: empresaGuardada.empresa_id,
      nombre_rol: 'Administrador',
      permisos: { full_access: true },
      es_predeterminado: true,
      estado: 'activo',
    });
    const nuevoUsuario = await User.create({
      uid: firebaseUser.uid,
      empresa_id: empresaGuardada.empresa_id,
      rol_id: nuevoRol.rol_id,
      nombre_completo,
      email,
      estado: 'activo',
    });
    res.status(201).json({ empresa: empresaGuardada, usuario: nuevoUsuario });
  } catch (err) {
    if (firebaseUser && firebaseUser.success) {
      await firebaseAuth.deleteUser(firebaseUser.uid);
    }
    res.status(500).json({ error: 'Error al crear la empresa.', details: err.message });
  }
}

async function updateCompany(req, res) {
  try {
    const empresaId = req.params.empresa_id;
    const { ajustes, ...rest } = req.body;
    const updateData = { ...rest };
    if (ajustes) {
      updateData.ajustes = JSON.stringify(ajustes);
    }
    const empresaActualizada = await Company.findByIdAndUpdate(empresaId, updateData);
    if (!empresaActualizada) return res.status(404).json({ error: 'Empresa no encontrada.' });
    let tipoNegocio = '';
    if (empresaActualizada.tipo_empresa_id) {
      const tiposEmpresa = await TypeCompany.find();
      const tipo = tiposEmpresa.find(
        (t) =>
          t.id === empresaActualizada.tipo_empresa_id ||
          t.tipo_empresa_id === empresaActualizada.tipo_empresa_id
      );
      tipoNegocio = tipo ? tipo.tipo_empresa : '';
    }
    let ajustesObj = empresaActualizada.ajustes;
    if (typeof ajustesObj === 'string') {
      try {
        ajustesObj = JSON.parse(ajustesObj);
      } catch (e) {
        ajustesObj = {};
      }
    }
    res.json({
      empresa: {
        ...empresaActualizada,
        ajustes: {
          nombre: empresaActualizada.nombre || '',
          tipoNegocio,
          zonaHoraria: empresaActualizada.zona_horaria || '',
          identidad_visual: ajustesObj?.identidad_visual || {},
          ...ajustesObj,
        },
      },
    });
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar la empresa.' });
  }
}

async function deleteCompany(req, res) {
  try {
    const empresa = await Company.findByIdAndDelete(req.params.empresa_id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada.' });
    res.json({ mensaje: 'Empresa eliminada correctamente.' });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar la empresa.' });
  }
}

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

async function getAllCompanyTypes(req, res) {
  try {
    const tipos = await TypeCompany.find();
    res.json(tipos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los tipos de empresa.' });
  }
}

async function createCompanyType(req, res) {
  try {
    const { tipo_empresa } = req.body;
    const nuevoTipo = await TypeCompany.create({ tipo_empresa });
    res.status(201).json(nuevoTipo);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear el tipo de empresa.' });
  }
}

async function uploadCompanyLogo(req, res) {
  try {
    const empresaId = req.params.empresa_id;
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });
    }
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'company_logos',
      public_id: `empresa_${empresaId}_logo`,
      overwrite: true,
    });
    fs.unlink(req.file.path, () => {});
    const empresa = await Company.findById(empresaId);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada.' });
    let ajustesObj = empresa.ajustes;
    if (typeof ajustesObj === 'string') {
      try {
        ajustesObj = JSON.parse(ajustesObj);
      } catch (e) {
        ajustesObj = {};
      }
    }
    ajustesObj.identidad_visual = ajustesObj.identidad_visual || {};
    ajustesObj.identidad_visual.logo_url = result.secure_url;
    await Company.findByIdAndUpdate(empresaId, {
      ajustes: JSON.stringify(ajustesObj),
      logo_url: result.secure_url,
      logo_public_id: result.public_id,
    });
    res.json({ logo_url: result.secure_url, logo_public_id: result.public_id });
  } catch (err) {
    res.status(500).json({ error: 'Error al subir el logo.', details: err.message });
  }
}

async function getCompanyInvoices(req, res) {
  try {
    const empresaId = req.params.empresa_id;
    const facturas = []; // Simulación, reemplaza con tu consulta real
    res.json({ facturas });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener facturas.' });
  }
}

async function getCompanyPlan(req, res) {
  try {
    const empresaId = req.params.empresa_id;
    const empresa = await Company.findById(empresaId);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada.' });
    const plan = {
      nombre: 'Plan Básico',
      estado: 'Activo',
      precio: 0,
      periodo: '/mensual',
      miembros: { used: 0, total: 0 },
      productos: { used: 0, total: 0 },
      proximoCobro: '',
    };
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el plan.' });
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
  uploadCompanyLogo,
  getCompanyInvoices,
  getCompanyPlan,
};

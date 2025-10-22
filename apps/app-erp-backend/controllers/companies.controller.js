const Company = require('../models/company.model');
const TypeCompany = require('../models/typeCompany.model');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const { firebaseAuth } = require('../utils/firebaseAdmin');
const cloudinary = require('../utils/cloudinaryConfig');
const SubscriptionService = require('../services/subscriptionService');
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

    // ===== VALIDACIONES =====
    // Validar campos requeridos
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la empresa es requerido.' });
    }
    if (!tipo_empresa_id) {
      return res.status(400).json({ error: 'El tipo de empresa es requerido.' });
    }
    if (!plan_id) {
      return res.status(400).json({ error: 'El plan es requerido.' });
    }
    if (!nombre_completo || nombre_completo.trim() === '') {
      return res.status(400).json({ error: 'El nombre completo del usuario es requerido.' });
    }
    if (!email || email.trim() === '') {
      return res.status(400).json({ error: 'El email es requerido.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    // Validar longitud de campos
    if (nombre.length > 150) {
      return res
        .status(400)
        .json({ error: 'El nombre de la empresa no puede exceder 150 caracteres.' });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'El formato del email no es válido.' });
    }

    // Validar que el tipo de empresa exista
    const tipoEmpresa = await TypeCompany.findById(tipo_empresa_id);
    if (!tipoEmpresa) {
      return res
        .status(404)
        .json({ error: `Tipo de empresa con ID ${tipo_empresa_id} no encontrado.` });
    }

    // Validar que el plan exista
    const Plan = require('../models/plan.model');
    const plan = await Plan.findById(plan_id);
    if (!plan) {
      return res.status(404).json({ error: `Plan con ID ${plan_id} no encontrado.` });
    }

    // Crear usuario en Firebase
    firebaseUser = await firebaseAuth.createUser(email, password, nombre_completo);
    if (!firebaseUser.success) {
      return res
        .status(400)
        .json({ error: 'Error al crear usuario en Firebase.', details: firebaseUser.error });
    }

    // Crear empresa con estado inicial

    // Crear empresa con estado inicial
    const empresaGuardada = await Company.create({
      nombre,
      tipo_empresa_id,
      plan_id,
      estado_suscripcion: 'en_prueba', // Se actualizará con la lógica de suscripción
    });

    // Configurar suscripción inicial según el plan
    const subscriptionResult = await SubscriptionService.setupInitialSubscription(
      empresaGuardada.empresa_id,
      plan_id
    );

    // ===== NUEVO SISTEMA: NO CREAR ROLES DUPLICADOS =====
    // En el nuevo sistema, los roles predeterminados están en la tabla roles_plantilla
    // Solo necesitamos obtener el rol de Administrador de la plantilla para asignárselo al usuario

    const RolePlantilla = require('../models/rolePlantilla.model');

    // Buscar la plantilla de Administrador para este tipo de empresa
    const plantillaAdministrador = await RolePlantilla.findByNombreYTipo(
      'Administrador',
      tipo_empresa_id
    );

    if (!plantillaAdministrador) {
      throw new Error('No se encontró la plantilla de rol Administrador para este tipo de empresa');
    }

    // En el nuevo sistema, los usuarios pueden tener roles de plantilla o personalizados
    // Por ahora, creamos un "rol virtual" que apunte a la plantilla
    // O modificamos la estructura para que usuarios puedan apuntar directamente a plantillas

    // OPCIÓN TEMPORAL: Crear solo el rol de Administrador para este usuario
    const rolAdministrador = await Role.create({
      empresa_id: empresaGuardada.empresa_id,
      nombre_rol: 'Administrador',
      permisos: plantillaAdministrador.permisos,
      es_predeterminado: true,
      estado: 'activo',
      plantilla_id_origen: plantillaAdministrador.plantilla_id,
    });

    console.log('✅ Empresa creada con sistema de plantillas. Solo se creó rol de Administrador.');

    // Crear usuario con rol de Administrador
    const nuevoUsuario = await User.create({
      uid: firebaseUser.uid,
      empresa_id: empresaGuardada.empresa_id,
      rol_id: rolAdministrador.rol_id,
      nombre_completo,
      email,
      estado: 'activo',
    });

    res.status(201).json({
      empresa: empresaGuardada,
      usuario: nuevoUsuario,
      subscription: subscriptionResult,
      rol_administrador: rolAdministrador,
      plantillas_disponibles: await RolePlantilla.findByTipoEmpresa(tipo_empresa_id),
      mensaje: `Empresa creada exitosamente. Usando sistema de plantillas de roles.`,
    });
  } catch (err) {
    console.error('Error al crear empresa:', err);
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

    // ===== VALIDACIONES =====
    if (!planId) {
      return res.status(400).json({ error: 'El campo planId es requerido.' });
    }

    // Validar que el plan exista
    const Plan = require('../models/plan.model');
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: `Plan con ID ${planId} no encontrado.` });
    }

    // Validar que la empresa exista
    const empresa = await Company.findById(req.params.empresa_id);
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa no encontrada.' });
    }

    const empresaActualizada = await Company.findByIdAndUpdate(req.params.empresa_id, {
      plan_id: planId,
    });
    res.json({ mensaje: 'Plan cambiado correctamente.', empresa: empresaActualizada });
  } catch (err) {
    console.error('Error al cambiar plan:', err);
    res
      .status(400)
      .json({ error: 'Error al cambiar el plan de la empresa.', details: err.message });
  }
}

async function updateSubscriptionStatus(req, res) {
  try {
    const { status } = req.body;

    // ===== VALIDACIONES =====
    if (!status) {
      return res.status(400).json({ error: 'El campo status es requerido.' });
    }

    // Validar valores de estado de suscripción
    const estadosValidos = ['en_prueba', 'activa', 'expirada', 'cancelada', 'suspendida'];
    if (!estadosValidos.includes(status)) {
      return res.status(400).json({
        error: `Estado de suscripción no válido. Valores permitidos: ${estadosValidos.join(', ')}`,
      });
    }

    const empresa = await Company.findByIdAndUpdate(req.params.empresa_id, {
      estado_suscripcion: status,
    });
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada.' });
    res.json({ mensaje: 'Estado de suscripción actualizado.', empresa });
  } catch (err) {
    console.error('Error al actualizar estado de suscripción:', err);
    res
      .status(400)
      .json({ error: 'Error al actualizar el estado de suscripción.', details: err.message });
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

    // Validación: archivo requerido
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });
    }

    // Validación: verificar que la empresa exista
    const empresa = await Company.findById(empresaId);
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa no encontrada.' });
    }

    // Validación: tipo de archivo (ya se valida en multer, pero por seguridad)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: 'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP).',
      });
    }

    // Validación: tamaño máximo (ya se valida en multer, pero por seguridad)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        error: 'El archivo es demasiado grande. Tamaño máximo: 5MB.',
      });
    }

    // Subir a Cloudinary desde buffer (sin archivo temporal)
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'company_logos',
            public_id: `empresa_${empresaId}_logo`,
            overwrite: true,
            transformation: [
              { width: 500, height: 500, crop: 'limit' },
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

    res.json({
      logo_url: result.secure_url,
      logo_public_id: result.public_id,
      message: 'Logo subido exitosamente.',
    });
  } catch (err) {
    console.error('Error al subir logo:', err);
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

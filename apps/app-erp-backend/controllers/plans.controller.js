const Plan = require('../models/plan.model');
const Company = require('../models/company.model');

// Lista todos los planes
async function getAllPlans(req, res) {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los planes.' });
  }
}

// Obtiene un plan por su ID
async function getPlanById(req, res) {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan no encontrado.' });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el plan.' });
  }
}

// Crea un nuevo plan
async function createPlan(req, res) {
  try {
    const { nombre_plan, precio_mensual, limites } = req.body;
    const nuevoPlan = await Plan.create({
      nombre_plan,
      precio_mensual,
      limites,
    });
    res.status(201).json(nuevoPlan);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear el plan.' });
  }
}

// Actualiza nombre, precio o límites de un plan
async function updatePlan(req, res) {
  try {
    const { nombre_plan, precio_mensual, limites } = req.body;
    const planActualizado = await Plan.findByIdAndUpdate(req.params.id, {
      nombre_plan,
      precio_mensual,
      limites,
    });
    if (!planActualizado) return res.status(404).json({ error: 'Plan no encontrado.' });
    res.json(planActualizado);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar el plan.' });
  }
}

// Elimina un plan
async function deletePlan(req, res) {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan no encontrado.' });
    res.json({ mensaje: 'Plan eliminado correctamente.' });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar el plan.' });
  }
}

// Asigna un plan a una empresa
async function assignPlanToCompany(req, res) {
  try {
    const { companyId, planId } = req.body;
    const empresa = await Company.findByIdAndUpdate(companyId, { plan_id: planId });
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada.' });
    res.json({ mensaje: 'Plan asignado correctamente.', empresa });
  } catch (err) {
    res.status(400).json({ error: 'Error al asignar el plan a la empresa.' });
  }
}

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  assignPlanToCompany,
};

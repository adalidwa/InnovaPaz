const express = require('express');
const router = express.Router();
const {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getAllClientsIncludingInactive,
  activateClient,
} = require('../controllers/clients.controller');

// Rutas de clientes por empresa
router.get('/empresa/:empresaId', getAllClients);
router.get('/empresa/:empresaId/all', getAllClientsIncludingInactive);
router.get('/empresa/:empresaId/:clienteId', getClientById);
router.post('/empresa/:empresaId', createClient);
router.put('/empresa/:empresaId/:clienteId', updateClient);
router.put('/empresa/:empresaId/:clienteId/activate', activateClient);
router.delete('/empresa/:empresaId/:clienteId', deleteClient);

module.exports = router;

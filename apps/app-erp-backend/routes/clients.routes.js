const express = require('express');
const router = express.Router();
const {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} = require('../controllers/clients.controller');

// Rutas de clientes por empresa
router.get('/empresa/:empresaId', getAllClients);
router.get('/empresa/:empresaId/:clienteId', getClientById);
router.post('/empresa/:empresaId', createClient);
router.put('/empresa/:empresaId/:clienteId', updateClient);
router.delete('/empresa/:empresaId/:clienteId', deleteClient);

module.exports = router;

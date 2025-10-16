const ClientModel = require('../models/client.model');

// Obtener todos los clientes
const getAllClients = async (req, res) => {
  try {
    const { empresaId } = req.params;
    const { search } = req.query;

    let clients;
    if (search) {
      clients = await ClientModel.search(empresaId, search);
    } else {
      clients = await ClientModel.findByEmpresa(empresaId);
    }

    res.status(200).json({
      success: true,
      data: clients,
      count: clients.length,
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes',
      error: error.message,
    });
  }
};

// Obtener cliente por ID
const getClientById = async (req, res) => {
  try {
    const { empresaId, clienteId } = req.params;

    const client = await ClientModel.findById(clienteId, empresaId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cliente',
      error: error.message,
    });
  }
};

// Crear cliente
const createClient = async (req, res) => {
  try {
    const { empresaId } = req.params;
    const clientData = {
      ...req.body,
      empresa_id: empresaId,
    };

    // Validaciones básicas
    if (!clientData.nombre || !clientData.nit_ci) {
      return res.status(400).json({
        success: false,
        message: 'El nombre y NIT/CI son requeridos',
      });
    }

    const newClient = await ClientModel.create(clientData);

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: newClient,
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cliente',
      error: error.message,
    });
  }
};

// Actualizar cliente
const updateClient = async (req, res) => {
  try {
    const { empresaId, clienteId } = req.params;
    const clientData = req.body;

    const updatedClient = await ClientModel.update(clienteId, empresaId, clientData);

    if (!updatedClient) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: updatedClient,
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cliente',
      error: error.message,
    });
  }
};

// Eliminar cliente (soft delete)
const deleteClient = async (req, res) => {
  try {
    const { empresaId, clienteId } = req.params;

    const deletedClient = await ClientModel.delete(clienteId, empresaId);

    if (!deletedClient) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cliente eliminado exitosamente',
      data: deletedClient,
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cliente',
      error: error.message,
    });
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};

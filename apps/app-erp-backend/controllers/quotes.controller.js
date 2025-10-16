const QuoteModel = require('../models/quote.model');

// Obtener todas las cotizaciones
const getAllQuotes = async (req, res) => {
  try {
    const { empresaId } = req.query;

    if (!empresaId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere empresaId',
      });
    }

    const quotes = await QuoteModel.findAll(empresaId);

    res.status(200).json({
      success: true,
      data: quotes,
      count: quotes.length,
    });
  } catch (error) {
    console.error('Error al obtener cotizaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cotizaciones',
      error: error.message,
    });
  }
};

// Obtener cotización por ID
const getQuoteById = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { empresaId } = req.query;

    if (!empresaId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere empresaId',
      });
    }

    const quote = await QuoteModel.findById(quoteId, empresaId);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada',
      });
    }

    // Obtener detalles
    const details = await QuoteModel.findDetails(quoteId);

    res.status(200).json({
      success: true,
      data: {
        ...quote,
        productos: details,
      },
    });
  } catch (error) {
    console.error('Error al obtener cotización:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cotización',
      error: error.message,
    });
  }
};

// Crear nueva cotización
const createQuote = async (req, res) => {
  try {
    const quoteData = req.body;
    const { empresaId } = req.query;

    if (!empresaId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere empresaId',
      });
    }

    // Validaciones básicas
    if (!quoteData.fecha_validez || !quoteData.total) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos para crear la cotización',
      });
    }

    // Generar número de cotización si no existe
    if (!quoteData.numero_cotizacion) {
      quoteData.numero_cotizacion = await QuoteModel.generateQuoteNumber(empresaId);
    }

    const newQuote = await QuoteModel.create(quoteData, empresaId);

    res.status(201).json({
      success: true,
      message: 'Cotización creada exitosamente',
      data: newQuote,
    });
  } catch (error) {
    console.error('Error al crear cotización:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cotización',
      error: error.message,
    });
  }
};

// Actualizar cotización
const updateQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const quoteData = req.body;
    const { empresaId } = req.query;

    if (!empresaId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere empresaId',
      });
    }

    const updatedQuote = await QuoteModel.update(quoteId, quoteData, empresaId);

    if (!updatedQuote) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cotización actualizada exitosamente',
      data: updatedQuote,
    });
  } catch (error) {
    console.error('Error al actualizar cotización:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cotización',
      error: error.message,
    });
  }
};

// Actualizar estado de cotización
const updateQuoteStatus = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { estadoId } = req.body;
    const { empresaId } = req.query;

    if (!empresaId || !estadoId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere empresaId y estadoId',
      });
    }

    const updatedQuote = await QuoteModel.updateStatus(quoteId, estadoId, empresaId);

    if (!updatedQuote) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: updatedQuote,
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado',
      error: error.message,
    });
  }
};

// Convertir cotización a pedido
const convertToOrder = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { empresaId } = req.query;

    if (!empresaId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere empresaId',
      });
    }

    const updatedQuote = await QuoteModel.markAsConverted(quoteId, empresaId);

    if (!updatedQuote) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cotización convertida a pedido exitosamente',
      data: updatedQuote,
    });
  } catch (error) {
    console.error('Error al convertir cotización:', error);
    res.status(500).json({
      success: false,
      message: 'Error al convertir cotización',
      error: error.message,
    });
  }
};

// Eliminar cotización
const deleteQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { empresaId } = req.query;

    if (!empresaId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere empresaId',
      });
    }

    const deletedQuote = await QuoteModel.delete(quoteId, empresaId);

    if (!deletedQuote) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cotización eliminada exitosamente',
      data: deletedQuote,
    });
  } catch (error) {
    console.error('Error al eliminar cotización:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cotización',
      error: error.message,
    });
  }
};

// Generar nuevo número de cotización
const generateQuoteNumber = async (req, res) => {
  try {
    const { empresaId } = req.query;

    if (!empresaId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere empresaId',
      });
    }

    const quoteNumber = await QuoteModel.generateQuoteNumber(empresaId);

    res.status(200).json({
      success: true,
      data: { numero_cotizacion: quoteNumber },
    });
  } catch (error) {
    console.error('Error al generar número de cotización:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar número de cotización',
      error: error.message,
    });
  }
};

module.exports = {
  getAllQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  updateQuoteStatus,
  convertToOrder,
  deleteQuote,
  generateQuoteNumber,
};

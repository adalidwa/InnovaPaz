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
    const details = await QuoteModel.findDetails(quoteId, empresaId);

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

    // Validar que haya productos
    if (!quoteData.productos || quoteData.productos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe agregar al menos un producto a la cotización',
      });
    }

    // Validar que todos los productos tengan los campos necesarios
    for (const producto of quoteData.productos) {
      if (!producto.producto_id || !producto.cantidad || !producto.precio_unitario) {
        return res.status(400).json({
          success: false,
          message: 'Todos los productos deben tener producto_id, cantidad y precio_unitario',
        });
      }
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

    // Mensajes de error más específicos
    let errorMessage = 'Error al crear cotización';
    if (error.message.includes('no pertenecen a esta empresa')) {
      errorMessage = 'Algunos productos seleccionados no existen o no pertenecen a esta empresa';
    } else if (error.message.includes('cliente no pertenece')) {
      errorMessage = 'El cliente seleccionado no pertenece a esta empresa';
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
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
    const { estado_cotizacion_id } = req.body;
    const { empresaId } = req.query;

    if (!empresaId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere empresaId',
      });
    }

    if (!estado_cotizacion_id) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere estado_cotizacion_id',
      });
    }

    const updatedQuote = await QuoteModel.updateStatus(quoteId, estado_cotizacion_id, empresaId);

    if (!updatedQuote) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Estado de cotización actualizado exitosamente',
      data: updatedQuote,
    });
  } catch (error) {
    console.error('Error al actualizar estado de cotización:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado de cotización',
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

    const order = await QuoteModel.markAsConverted(quoteId, empresaId);

    res.status(200).json({
      success: true,
      message: 'Cotización convertida a pedido exitosamente',
      data: order,
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

// Generar número de cotización
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

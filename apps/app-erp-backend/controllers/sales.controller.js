const SaleModel = require('../models/sale.model');

// Obtener todas las ventas
const getAllSales = async (req, res) => {
  try {
    const { empresaId } = req.params;
    const { fechaInicio, fechaFin, clienteId, estadoId } = req.query;

    const filters = {
      fechaInicio,
      fechaFin,
      clienteId,
      estadoId,
    };

    const sales = await SaleModel.findByEmpresa(empresaId, filters);

    res.status(200).json({
      success: true,
      data: sales,
      count: sales.length,
    });
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ventas',
      error: error.message,
    });
  }
};

// Obtener venta por ID con detalles
const getSaleById = async (req, res) => {
  try {
    const { empresaId, ventaId } = req.params;

    const sale = await SaleModel.findByIdWithDetails(ventaId, empresaId);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener venta',
      error: error.message,
    });
  }
};

// Crear venta
const createSale = async (req, res) => {
  try {
    const { empresaId } = req.params;
    const { venta, detalles } = req.body;

    // Validaciones básicas
    if (!venta.cliente_id) {
      return res.status(400).json({
        success: false,
        message: 'El cliente es requerido',
      });
    }

    if (!detalles || detalles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe agregar al menos un producto',
      });
    }

    // Validar que todos los detalles tengan los campos necesarios
    for (const detalle of detalles) {
      if (!detalle.producto_id || !detalle.cantidad || !detalle.precio_unitario) {
        return res.status(400).json({
          success: false,
          message: 'Todos los productos deben tener producto_id, cantidad y precio_unitario',
        });
      }
    }

    const ventaData = {
      ...venta,
      empresa_id: empresaId,
    };

    const newSale = await SaleModel.create(ventaData, detalles);

    res.status(201).json({
      success: true,
      message: 'Venta creada exitosamente',
      data: newSale,
    });
  } catch (error) {
    console.error('Error al crear venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear venta',
      error: error.message,
    });
  }
};

// Actualizar estado de venta
const updateSaleStatus = async (req, res) => {
  try {
    const { empresaId, ventaId } = req.params;
    const { estado_venta_id } = req.body;

    if (!estado_venta_id) {
      return res.status(400).json({
        success: false,
        message: 'El estado de venta es requerido',
      });
    }

    const updatedSale = await SaleModel.updateStatus(ventaId, empresaId, estado_venta_id);

    if (!updatedSale) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Estado de venta actualizado exitosamente',
      data: updatedSale,
    });
  } catch (error) {
    console.error('Error al actualizar estado de venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado de venta',
      error: error.message,
    });
  }
};

// Cancelar venta
const cancelSale = async (req, res) => {
  try {
    const { empresaId, ventaId } = req.params;

    const cancelledSale = await SaleModel.cancel(ventaId, empresaId);

    if (!cancelledSale) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Venta cancelada exitosamente',
      data: cancelledSale,
    });
  } catch (error) {
    console.error('Error al cancelar venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar venta',
      error: error.message,
    });
  }
};

// Obtener estadísticas de ventas
const getSalesStats = async (req, res) => {
  try {
    const { empresaId } = req.params;
    const { periodo } = req.query;

    const stats = await SaleModel.getStats(empresaId, periodo || 'month');

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message,
    });
  }
};

module.exports = {
  getAllSales,
  getSaleById,
  createSale,
  updateSaleStatus,
  cancelSale,
  getSalesStats,
};

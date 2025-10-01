import React, { useState, useMemo } from 'react';
import { FaTimes, FaExclamationTriangle, FaWarehouse, FaEye } from 'react-icons/fa';
import Button from '../../../../components/common/Button';
import type { CriticalProduct } from '../../types/inventory';
import './CriticalStockModal.css';

interface CriticalStockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CriticalStockModal: React.FC<CriticalStockModalProps> = ({ isOpen, onClose }) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'critico' | 'bajo'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Mock data - in real app this would come from API
  const criticalProducts: CriticalProduct[] = [
    {
      id: 1,
      name: 'Leche Entera Alquería 1L',
      currentStock: 5,
      minStock: 20,
      maxStock: 100,
      category: 'Lácteos',
      supplier: 'Alquería S.A.',
      lastUpdated: '2024-01-15T10:30:00Z',
      status: 'critico',
      location: 'Refrigerador A-1',
      unit: 'unidades',
    },
    {
      id: 2,
      name: 'Pan Tajado Bimbo 500g',
      currentStock: 12,
      minStock: 25,
      maxStock: 80,
      category: 'Panadería',
      supplier: 'Bimbo Colombia',
      lastUpdated: '2024-01-15T09:15:00Z',
      status: 'bajo',
      location: 'Estante B-2',
      unit: 'unidades',
    },
    {
      id: 3,
      name: 'Aceite Girasol Premier 1L',
      currentStock: 3,
      minStock: 15,
      maxStock: 60,
      category: 'Aceites',
      supplier: 'Premier S.A.',
      lastUpdated: '2024-01-15T08:45:00Z',
      status: 'critico',
      location: 'Estante C-1',
      unit: 'unidades',
    },
    {
      id: 4,
      name: 'Arroz Diana 500g',
      currentStock: 18,
      minStock: 30,
      maxStock: 120,
      category: 'Granos',
      supplier: 'Diana S.A.',
      lastUpdated: '2024-01-15T07:20:00Z',
      status: 'bajo',
      location: 'Bodega Principal',
      unit: 'unidades',
    },
    {
      id: 5,
      name: 'Jabón Protex 120g',
      currentStock: 2,
      minStock: 12,
      maxStock: 50,
      category: 'Aseo Personal',
      supplier: 'Colgate-Palmolive',
      lastUpdated: '2024-01-15T06:30:00Z',
      status: 'critico',
      location: 'Estante D-3',
      unit: 'unidades',
    },
  ];

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(criticalProducts.map((p) => p.category)));
    return uniqueCategories.sort();
  }, []);

  const filteredProducts = useMemo(() => {
    return criticalProducts.filter((product) => {
      const statusMatch = statusFilter === 'all' || product.status === statusFilter;
      const categoryMatch = categoryFilter === 'all' || product.category === categoryFilter;
      return statusMatch && categoryMatch;
    });
  }, [statusFilter, categoryFilter]);

  const getProgressPercentage = (current: number, min: number, max: number) => {
    return Math.min((current / min) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRestock = (productId: string | number) => {
    console.log('Restock product:', productId);
    // TODO: Implement restock functionality
  };

  const handleViewDetails = (productId: string | number) => {
    console.log('View details for product:', productId);
    // TODO: Implement view details functionality
  };

  const handleTransfer = (productId: string | number) => {
    console.log('Transfer product:', productId);
    // TODO: Implement transfer functionality
  };

  if (!isOpen) return null;

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='critical-stock-modal' onClick={(e) => e.stopPropagation()}>
        <div className='modal-header'>
          <h2 className='modal-title'>Gestión de Stock Crítico</h2>
          <button className='modal-close' onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className='modal-body'>
          <div className='modal-filters'>
            <div className='filter-group'>
              <label className='filter-label'>Estado</label>
              <select
                className='filter-select'
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'critico' | 'bajo')}
              >
                <option value='all'>Todos</option>
                <option value='critico'>Crítico</option>
                <option value='bajo'>Bajo</option>
              </select>
            </div>

            <div className='filter-group'>
              <label className='filter-label'>Categoría</label>
              <select
                className='filter-select'
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value='all'>Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className='empty-state'>
              <div className='empty-state-icon'>
                <FaWarehouse />
              </div>
              <h3 className='empty-state-title'>No hay productos críticos</h3>
              <p className='empty-state-text'>
                No se encontraron productos que coincidan con los filtros seleccionados.
              </p>
            </div>
          ) : (
            <div className='critical-products-list'>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`critical-product-item critical-product-item--${product.status}`}
                >
                  <div className='product-header'>
                    <div>
                      <h4 className='product-name'>{product.name}</h4>
                      <p className='product-category'>{product.category}</p>
                    </div>
                    <span className={`product-status-tag status-list-card__tag--${product.status}`}>
                      {product.status === 'critico' ? 'Crítico' : 'Bajo'}
                    </span>
                  </div>

                  <div className='product-details'>
                    <div className='detail-item'>
                      <p className='detail-label'>Stock Actual</p>
                      <p className='detail-value'>
                        {product.currentStock} {product.unit}
                      </p>
                    </div>
                    <div className='detail-item'>
                      <p className='detail-label'>Stock Mínimo</p>
                      <p className='detail-value'>
                        {product.minStock} {product.unit}
                      </p>
                    </div>
                    <div className='detail-item'>
                      <p className='detail-label'>Ubicación</p>
                      <p className='detail-value'>{product.location}</p>
                    </div>
                    <div className='detail-item'>
                      <p className='detail-label'>Proveedor</p>
                      <p className='detail-value'>{product.supplier}</p>
                    </div>
                    <div className='detail-item'>
                      <p className='detail-label'>Última Actualización</p>
                      <p className='detail-value'>{formatDate(product.lastUpdated)}</p>
                    </div>
                  </div>

                  <div className='stock-progress'>
                    <div className='progress-label'>
                      <span className='progress-text'>Nivel de stock</span>
                      <span className='progress-text'>
                        {getProgressPercentage(
                          product.currentStock,
                          product.minStock,
                          product.maxStock
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                    <div className='progress-bar'>
                      <div
                        className={`progress-fill progress-fill--${product.status}`}
                        style={{
                          width: `${getProgressPercentage(product.currentStock, product.minStock, product.maxStock)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className='product-actions'>
                    <button
                      className='action-button action-button--primary'
                      onClick={() => handleRestock(product.id)}
                    >
                      Reabastecer
                    </button>
                    <button
                      className='action-button action-button--secondary'
                      onClick={() => handleViewDetails(product.id)}
                    >
                      <FaEye /> Ver Detalles
                    </button>
                    <button
                      className='action-button action-button--secondary'
                      onClick={() => handleTransfer(product.id)}
                    >
                      Transferir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='modal-footer'>
          <Button variant='secondary' onClick={onClose}>
            Cerrar
          </Button>
          <Button variant='primary' onClick={() => console.log('Generate report')}>
            Generar Reporte
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CriticalStockModal;

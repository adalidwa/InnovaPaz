import React, { useState, useMemo } from 'react';
import { FaTimes, FaExclamationTriangle, FaWarehouse, FaEye } from 'react-icons/fa';
import Button from '../../../../components/common/Button';
import type { CriticalProduct } from '../../types/inventory';
import './CriticalStockModal.css';

interface CriticalStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessType?: 'ferreteria' | 'minimarket' | 'licoreria';
}

const CriticalStockModal: React.FC<CriticalStockModalProps> = ({
  isOpen,
  onClose,
  businessType = 'minimarket',
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'critico' | 'bajo'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const getCriticalProductsByBusinessType = (): CriticalProduct[] => {
    const productsByType = {
      ferreteria: [
        {
          id: 1,
          name: 'Tornillos autorroscantes 1/2" x 8',
          currentStock: 45,
          minStock: 100,
          maxStock: 300,
          category: 'Ferretería',
          supplier: 'Distribuidora Central S.A.',
          lastUpdated: '2024-01-15T10:30:00Z',
          status: 'bajo' as const,
          location: 'Estante F-1',
          unit: 'unidades',
        },
        {
          id: 2,
          name: 'Pintura Viniltex Blanco 1 Galón',
          currentStock: 3,
          minStock: 15,
          maxStock: 60,
          category: 'Pinturas',
          supplier: 'Pintuco S.A.',
          lastUpdated: '2024-01-15T09:15:00Z',
          status: 'critico' as const,
          location: 'Bodega Principal',
          unit: 'galones',
        },
        {
          id: 3,
          name: 'Cable eléctrico #14 AWG',
          currentStock: 12,
          minStock: 25,
          maxStock: 100,
          category: 'Eléctricos',
          supplier: 'Procables Colombia',
          lastUpdated: '2024-01-15T08:45:00Z',
          status: 'bajo' as const,
          location: 'Estante E-2',
          unit: 'metros',
        },
        {
          id: 4,
          name: 'Cemento Portland Argos 50kg',
          currentStock: 8,
          minStock: 20,
          maxStock: 80,
          category: 'Construcción',
          supplier: 'Cementos Argos',
          lastUpdated: '2024-01-15T07:20:00Z',
          status: 'critico' as const,
          location: 'Patio Exterior',
          unit: 'bultos',
        },
        {
          id: 5,
          name: 'Bombillo LED 12W E27',
          currentStock: 15,
          minStock: 30,
          maxStock: 120,
          category: 'Eléctricos',
          supplier: 'Philips Colombia',
          lastUpdated: '2024-01-15T06:30:00Z',
          status: 'bajo' as const,
          location: 'Estante E-1',
          unit: 'unidades',
        },
      ],
      minimarket: [
        {
          id: 1,
          name: 'Leche Entera Alquería 1L',
          currentStock: 8,
          minStock: 25,
          maxStock: 100,
          category: 'Lácteos',
          supplier: 'Alquería S.A.',
          lastUpdated: '2024-01-15T10:30:00Z',
          status: 'critico' as const,
          location: 'Refrigerador A-1',
          unit: 'unidades',
        },
        {
          id: 2,
          name: 'Pan Tajado Bimbo 500g',
          currentStock: 12,
          minStock: 30,
          maxStock: 80,
          category: 'Panadería',
          supplier: 'Bimbo Colombia',
          lastUpdated: '2024-01-15T09:15:00Z',
          status: 'bajo' as const,
          location: 'Estante B-2',
          unit: 'unidades',
        },
        {
          id: 3,
          name: 'Arroz Diana Premium 1kg',
          currentStock: 15,
          minStock: 40,
          maxStock: 120,
          category: 'Granos',
          supplier: 'Diana S.A.',
          lastUpdated: '2024-01-15T08:45:00Z',
          status: 'bajo' as const,
          location: 'Bodega Principal',
          unit: 'unidades',
        },
        {
          id: 4,
          name: 'Aceite Girasol Premier 1L',
          currentStock: 6,
          minStock: 20,
          maxStock: 60,
          category: 'Aceites',
          supplier: 'Premier S.A.',
          lastUpdated: '2024-01-15T07:20:00Z',
          status: 'critico' as const,
          location: 'Estante C-1',
          unit: 'unidades',
        },
        {
          id: 5,
          name: 'Detergente Ariel 1kg',
          currentStock: 9,
          minStock: 25,
          maxStock: 75,
          category: 'Limpieza',
          supplier: 'P&G Colombia',
          lastUpdated: '2024-01-15T06:30:00Z',
          status: 'bajo' as const,
          location: 'Estante D-3',
          unit: 'unidades',
        },
      ],
      licoreria: [
        {
          id: 1,
          name: 'Cerveza Águila 330ml x6 pack',
          currentStock: 15,
          minStock: 50,
          maxStock: 200,
          category: 'Cervezas',
          supplier: 'Bavaria S.A.',
          lastUpdated: '2024-01-15T10:30:00Z',
          status: 'critico' as const,
          location: 'Refrigerador C-1',
          unit: 'six-packs',
        },
        {
          id: 2,
          name: 'Aguardiente Antioqueño 750ml',
          currentStock: 8,
          minStock: 25,
          maxStock: 80,
          category: 'Licores Nacionales',
          supplier: 'FLA Fábrica de Licores',
          lastUpdated: '2024-01-15T09:15:00Z',
          status: 'critico' as const,
          location: 'Estante L-1',
          unit: 'botellas',
        },
        {
          id: 3,
          name: 'Ron Medellín Añejo 750ml',
          currentStock: 5,
          minStock: 15,
          maxStock: 50,
          category: 'Rones',
          supplier: 'Ron Medellín',
          lastUpdated: '2024-01-15T08:45:00Z',
          status: 'critico' as const,
          location: 'Estante L-2',
          unit: 'botellas',
        },
        {
          id: 4,
          name: "Whisky Buchanan's 12 años 750ml",
          currentStock: 2,
          minStock: 8,
          maxStock: 30,
          category: 'Whiskys',
          supplier: 'Diageo Colombia',
          lastUpdated: '2024-01-15T07:20:00Z',
          status: 'critico' as const,
          location: 'Vitrina Premium',
          unit: 'botellas',
        },
        {
          id: 5,
          name: 'Vino Gato Negro Merlot 750ml',
          currentStock: 12,
          minStock: 30,
          maxStock: 90,
          category: 'Vinos',
          supplier: 'Viña San Pedro',
          lastUpdated: '2024-01-15T06:30:00Z',
          status: 'bajo' as const,
          location: 'Estante V-1',
          unit: 'botellas',
        },
      ],
    };

    return productsByType[businessType];
  };

  const criticalProducts = getCriticalProductsByBusinessType();

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
    // Calculate percentage based on current stock relative to minimum stock
    // If current >= min, show 100%, otherwise show percentage of minimum reached
    if (current >= min) {
      return 100;
    }
    return Math.max((current / min) * 100, 5); // Minimum 5% for visibility
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

  if (!isOpen) return null;

  return (
    <div className='critical-stock-modal__overlay' onClick={onClose}>
      <div className='critical-stock-modal' onClick={(e) => e.stopPropagation()}>
        <div className='critical-stock-modal__header'>
          <h2 className='critical-stock-modal__title'>Gestión de Stock Crítico</h2>
          <button className='critical-stock-modal__close' onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className='critical-stock-modal__body'>
          <div className='critical-stock-modal__filters'>
            <div className='critical-stock-modal__filter-group'>
              <label className='critical-stock-modal__filter-label'>Estado</label>
              <select
                className='critical-stock-modal__filter-select'
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'critico' | 'bajo')}
              >
                <option value='all'>Todos</option>
                <option value='critico'>Crítico</option>
                <option value='bajo'>Bajo</option>
              </select>
            </div>

            <div className='critical-stock-modal__filter-group'>
              <label className='critical-stock-modal__filter-label'>Categoría</label>
              <select
                className='critical-stock-modal__filter-select'
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
            <div className='critical-stock-modal__empty-state'>
              <div className='critical-stock-modal__empty-state-icon'>
                <FaWarehouse />
              </div>
              <h3 className='critical-stock-modal__empty-state-title'>No hay productos críticos</h3>
              <p className='critical-stock-modal__empty-state-text'>
                No se encontraron productos que coincidan con los filtros seleccionados.
              </p>
            </div>
          ) : (
            <div className='critical-stock-modal__products-list'>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`critical-stock-modal__product-item critical-stock-modal__product-item--${product.status}`}
                >
                  <div className='critical-stock-modal__product-header'>
                    <div>
                      <h4 className='critical-stock-modal__product-name'>{product.name}</h4>
                      <p className='critical-stock-modal__product-category'>{product.category}</p>
                    </div>
                    <span
                      className={`critical-stock-modal__product-status-tag critical-stock-modal__status-tag--${product.status}`}
                    >
                      {product.status === 'critico' ? 'Crítico' : 'Bajo'}
                    </span>
                  </div>

                  <div className='critical-stock-modal__product-details'>
                    <div className='critical-stock-modal__detail-item'>
                      <p className='critical-stock-modal__detail-label'>Stock Actual</p>
                      <p className='critical-stock-modal__detail-value'>
                        {product.currentStock} {product.unit}
                      </p>
                    </div>
                    <div className='critical-stock-modal__detail-item'>
                      <p className='critical-stock-modal__detail-label'>Stock Mínimo</p>
                      <p className='critical-stock-modal__detail-value'>
                        {product.minStock} {product.unit}
                      </p>
                    </div>
                    <div className='critical-stock-modal__detail-item'>
                      <p className='critical-stock-modal__detail-label'>Ubicación</p>
                      <p className='critical-stock-modal__detail-value'>{product.location}</p>
                    </div>
                    <div className='critical-stock-modal__detail-item'>
                      <p className='critical-stock-modal__detail-label'>Proveedor</p>
                      <p className='critical-stock-modal__detail-value'>{product.supplier}</p>
                    </div>
                    <div className='critical-stock-modal__detail-item'>
                      <p className='critical-stock-modal__detail-label'>Última Actualización</p>
                      <p className='critical-stock-modal__detail-value'>
                        {formatDate(product.lastUpdated)}
                      </p>
                    </div>
                  </div>

                  <div className='critical-stock-modal__stock-progress'>
                    <div className='critical-stock-modal__progress-label'>
                      <span className='critical-stock-modal__progress-text'>Nivel de stock</span>
                      <span className='critical-stock-modal__progress-percentage'>
                        {product.currentStock}/{product.minStock} {product.unit}
                      </span>
                    </div>
                    <div className='critical-stock-modal__progress-bar'>
                      <div
                        className={`critical-stock-modal__progress-fill critical-stock-modal__progress-fill--${product.status}`}
                        style={{
                          width: `${getProgressPercentage(product.currentStock, product.minStock, product.maxStock)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className='critical-stock-modal__product-actions'>
                    <button
                      className='critical-stock-modal__action-button critical-stock-modal__action-button--primary'
                      onClick={() => handleRestock(product.id)}
                    >
                      Reabastecer
                    </button>
                    <button
                      className='critical-stock-modal__action-button critical-stock-modal__action-button--secondary'
                      onClick={() => handleViewDetails(product.id)}
                    >
                      <FaEye /> Ver Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='critical-stock-modal__footer'>
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

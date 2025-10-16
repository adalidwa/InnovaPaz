import StatusTag from '../../../components/common/StatusTag';
import type { ProductLegacy } from '../types/inventory';
import './StockComponent.css';

interface StockComponentProps {
  product: ProductLegacy;
}

function StockComponent({ product }: StockComponentProps) {
  const getStatusConfig = (status: ProductLegacy['status']) => {
    switch (status) {
      case 'critico':
        return { text: 'Crítico', color: 'var(--error-600)', textColor: 'var(--white)' };
      case 'bajo':
        return { text: 'Bajo', color: 'var(--warning-600)', textColor: 'var(--white)' };
      case 'agotado':
        return { text: 'Agotado', color: 'var(--error-800)', textColor: 'var(--white)' };
      default:
        return { text: 'Normal', color: 'var(--sec-600)', textColor: 'var(--white)' };
    }
  };

  const statusConfig = getStatusConfig(product.status);

  // Calcular el porcentaje de stock
  const stockPercentage = product.minStock > 0 ? (product.stock / product.minStock) * 100 : 100;
  const progressPercentage = Math.min(stockPercentage, 100);

  return (
    <div className='stock-card'>
      <div className='stock-header'>
        <h3 className='stock-title'>Stock Actual</h3>
        <StatusTag
          text={statusConfig.text}
          backgroundColor={statusConfig.color}
          textColor={statusConfig.textColor}
          width={80}
          height={24}
        />
      </div>

      <div className='stock-main'>
        <div className='stock-number'>{product.stock}</div>
        <p className='stock-unit'>unidades disponibles</p>
      </div>

      <div className='stock-footer'>
        <div className='stock-min-info'>
          <span className='stock-min-label'>Stock mínimo:</span>
          <span className='stock-min-value'>{product.minStock}</span>
        </div>
        <div className='stock-progress'>
          <div className='stock-progress-bar' style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>
    </div>
  );
}

export default StockComponent;

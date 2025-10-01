import Dinero from '../../../assets/images/Dinero.png';
import type { Product } from '../types/inventory';
import './PricingInfoComponent.css';

interface PricingInfoComponentProps {
  product: Product;
}

function PricingInfoComponent({ product }: PricingInfoComponentProps) {
  // Calcular margen
  const margin = product.price - product.cost;
  const marginPercentage = product.cost > 0 ? (margin / product.cost) * 100 : 0;

  // Calcular valor total en stock
  const stockValue = product.stock * product.price;

  return (
    <div className='pricing-info-card'>
      <div className='pricing-header'>
        <div className='pricing-title-container'>
          <img src={Dinero} alt='Dinero' className='pricing-icon' />
          <h3 className='pricing-title'>Información de Precios</h3>
        </div>
      </div>

      <div className='pricing-content'>
        <div className='pricing-item'>
          <span className='pricing-label'>Precio de venta:</span>
          <span className='pricing-value'>Bs. {product.price.toFixed(2)}</span>
        </div>

        <div className='pricing-item'>
          <span className='pricing-label'>Costo:</span>
          <span className='pricing-value'>Bs. {product.cost.toFixed(2)}</span>
        </div>

        <div className='pricing-item'>
          <span className='pricing-label'>Margen:</span>
          <span className='pricing-value margin-value'>{marginPercentage.toFixed(1)}%</span>
        </div>

        <div className='pricing-divider'></div>

        <div className='pricing-item total'>
          <span className='pricing-label'>Valor en stock:</span>
          <span className='pricing-value stock-value'>Bs. {stockValue.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default PricingInfoComponent;

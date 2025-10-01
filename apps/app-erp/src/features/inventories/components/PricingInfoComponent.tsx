import Dinero from '../../../assets/images/dinero.png';
import './PricingInfoComponent.css';

function PricingInfoComponent() {
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
          <span className='pricing-value'>Bs. 3.5</span>
        </div>

        <div className='pricing-item'>
          <span className='pricing-label'>Costo:</span>
          <span className='pricing-value'>Bs. 2.8</span>
        </div>

        <div className='pricing-item'>
          <span className='pricing-label'>Margen:</span>
          <span className='pricing-value margin-value'>25.0%</span>
        </div>

        <div className='pricing-divider'></div>

        <div className='pricing-item total'>
          <span className='pricing-label'>Valor en stock:</span>
          <span className='pricing-value stock-value'>Bs. 168.00</span>
        </div>
      </div>
    </div>
  );
}

export default PricingInfoComponent;

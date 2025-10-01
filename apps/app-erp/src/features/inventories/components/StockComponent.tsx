import StatusTag from '../../../components/common/StatusTag';
import './StockComponent.css';

function StockComponent() {
  return (
    <div className='stock-card'>
      <div className='stock-header'>
        <h3 className='stock-title'>Stock Actual</h3>
        <StatusTag
          text='Normal'
          backgroundColor='var(--sec-600)'
          textColor='var(--white)'
          width={80}
          height={24}
        />
      </div>

      <div className='stock-main'>
        <div className='stock-number'>48</div>
        <p className='stock-unit'>unidades disponibles</p>
      </div>

      <div className='stock-footer'>
        <div className='stock-min-info'>
          <span className='stock-min-label'>Stock mínimo:</span>
          <span className='stock-min-value'>20</span>
        </div>
        <div className='stock-progress'>
          <div className='stock-progress-bar'></div>
        </div>
      </div>
    </div>
  );
}

export default StockComponent;

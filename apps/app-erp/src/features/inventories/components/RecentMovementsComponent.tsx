import Movimientos from '../../../assets/images/movimiento.png';
import StatusTag from '../../../components/common/StatusTag';
import Button from '../../../components/common/Button';
import './RecentMovementsComponent.css';

function RecentMovementsComponent() {
  return (
    <div className='recent-movements-card'>
      <div className='movements-header'>
        <div className='movements-title-container'>
          <img src={Movimientos} alt='Movimientos' className='movements-icon' />
          <h3 className='movements-title'>Movimientos Recientes</h3>
        </div>
      </div>

      <div className='movements-content'>
        <div className='movement-item entry'>
          <div className='movement-indicator'>+</div>
          <div className='movement-details'>
            <div className='movement-main'>
              <span className='movement-type'>Entrada - 24 unidades</span>
              <StatusTag
                text='Entrada'
                backgroundColor='var(--sec-600)'
                textColor='var(--white)'
                width={80}
                height={24}
              />
            </div>
            <p className='movement-info'>2024-03-20 | Juan Pérez | Compra</p>
          </div>
        </div>

        <div className='movement-item exit'>
          <div className='movement-indicator'>−</div>
          <div className='movement-details'>
            <div className='movement-main'>
              <span className='movement-type'>Salida - 12 unidades</span>
              <StatusTag
                text='Salida'
                backgroundColor='var(--pri-500)'
                textColor='var(--white)'
                width={80}
                height={24}
              />
            </div>
            <p className='movement-info'>2024-03-19 | María López | Venta</p>
          </div>
        </div>

        <div className='movement-item exit'>
          <div className='movement-indicator'>−</div>
          <div className='movement-details'>
            <div className='movement-main'>
              <span className='movement-type'>Salida - 6 unidades</span>
              <StatusTag
                text='Salida'
                backgroundColor='var(--pri-500)'
                textColor='var(--white)'
                width={80}
                height={24}
              />
            </div>
            <p className='movement-info'>2024-03-18 | Carlos Silva | Venta</p>
          </div>
        </div>

        <div className='movement-item entry'>
          <div className='movement-indicator'>+</div>
          <div className='movement-details'>
            <div className='movement-main'>
              <span className='movement-type'>Entrada - 48 unidades</span>
              <StatusTag
                text='Entrada'
                backgroundColor='var(--sec-600)'
                textColor='var(--white)'
                width={80}
                height={24}
              />
            </div>
            <p className='movement-info'>2024-03-17 | Juan Pérez | Restock</p>
          </div>
        </div>
      </div>

      <div className='movements-footer'>
        <Button variant='outline' size='medium' fullWidth>
          Ver Historial Completo
        </Button>
      </div>
    </div>
  );
}

export default RecentMovementsComponent;

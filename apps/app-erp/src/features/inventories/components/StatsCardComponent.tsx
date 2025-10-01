import Estadisitca from '../../../assets/images/Estadisitca.png';
import './StatsCardComponent.css';

function StatsCardComponent() {
  return (
    <div className='stats-card'>
      <div className='stats-header'>
        <div className='stats-title-container'>
          <img src={Estadisitca} alt='Estadística' className='stats-icon' />
          <h3 className='stats-title'>Estadísticas</h3>
        </div>
      </div>

      <div className='stats-content'>
        <div className='stats-item'>
          <span className='stats-label'>Ventas este mes:</span>
          <span className='stats-value'>156 unidades</span>
        </div>

        <div className='stats-item'>
          <span className='stats-label'>Última venta:</span>
          <span className='stats-value'>Hace 2 horas</span>
        </div>

        <div className='stats-item'>
          <span className='stats-label'>Rotación:</span>
          <span className='stats-value rotation-high'>Alta</span>
        </div>
      </div>
    </div>
  );
}

export default StatsCardComponent;

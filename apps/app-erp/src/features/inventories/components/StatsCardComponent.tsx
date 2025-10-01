import Estadisitca from '../../../assets/images/Estadisitca.png';
import type { Product } from '../types/inventory';
import './StatsCardComponent.css';

interface StatsCardComponentProps {
  product: Product;
}

function StatsCardComponent({ product }: StatsCardComponentProps) {
  // Calcular días desde creación
  const createdDate = new Date(product.createdAt);
  const now = new Date();
  const daysSinceCreated = Math.floor(
    (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Simular estadísticas basadas en el producto
  const simulatedSales = Math.floor(Math.random() * 200) + 50;
  const lastSaleHours = Math.floor(Math.random() * 48) + 1;

  // Determinar rotación basada en el stock vs stock mínimo
  const getRotation = () => {
    const ratio = product.stock / product.minStock;
    if (ratio > 2) return { text: 'Baja', class: 'rotation-low' };
    if (ratio > 1) return { text: 'Media', class: 'rotation-medium' };
    return { text: 'Alta', class: 'rotation-high' };
  };

  const rotation = getRotation();

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
          <span className='stats-value'>{simulatedSales} unidades</span>
        </div>

        <div className='stats-item'>
          <span className='stats-label'>Última venta:</span>
          <span className='stats-value'>Hace {lastSaleHours}h</span>
        </div>

        <div className='stats-item'>
          <span className='stats-label'>Rotación:</span>
          <span className={`stats-value ${rotation.class}`}>{rotation.text}</span>
        </div>

        <div className='stats-item'>
          <span className='stats-label'>Días en inventario:</span>
          <span className='stats-value'>{daysSinceCreated} días</span>
        </div>
      </div>
    </div>
  );
}

export default StatsCardComponent;

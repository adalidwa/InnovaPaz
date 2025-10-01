import Invetarios from '../../../assets/icons/Inventarios.png';
import './ProductInfoCard.css';

function ProductInfoCard() {
  return (
    <div className='product-info-card'>
      <div className='card-header'>
        <img src={Invetarios} alt='Inventarios' className='card-icon' />
        <h3 className='card-title'>Información del Producto</h3>
      </div>

      <div className='card-content'>
        <div className='info-row'>
          <div className='info-item'>
            <span className='info-label'>Descripción</span>
            <p className='info-value'>
              Bebida gaseosa sabor cola, envase plástico retornable de 500ml
            </p>
          </div>
          <div className='info-item'>
            <span className='info-label'>Fecha de Vencimiento</span>
            <p className='info-value date'>2024-12-15</p>
          </div>
        </div>

        <div className='info-row'>
          <div className='info-item'>
            <span className='info-label'>Proveedor</span>
            <p className='info-value'>Distribuidora La Paz</p>
          </div>
          <div className='info-item'>
            <span className='info-label'>Lote</span>
            <p className='info-value tag'>LOT2024001</p>
          </div>
        </div>

        <div className='info-row single-column'>
          <div className='info-item'>
            <span className='info-label'>Ubicación</span>
            <p className='info-value'>Pasillo A - Estante 2</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductInfoCard;

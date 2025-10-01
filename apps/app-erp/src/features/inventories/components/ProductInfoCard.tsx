import Invetarios from '../../../assets/icons/Inventarios.png';
import type { Product } from '../types/inventory';
import './ProductInfoCard.css';

interface ProductInfoCardProps {
  product: Product;
}

function ProductInfoCard({ product }: ProductInfoCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-BO');
  };

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
            <p className='info-value'>{product.description || 'Sin descripción disponible'}</p>
          </div>
          <div className='info-item'>
            <span className='info-label'>Fecha de Vencimiento</span>
            <p className='info-value date'>{formatDate(product.expirationDate)}</p>
          </div>
        </div>

        <div className='info-row'>
          <div className='info-item'>
            <span className='info-label'>Categoría</span>
            <p className='info-value'>{product.category}</p>
          </div>
          <div className='info-item'>
            <span className='info-label'>Lote</span>
            <p className='info-value tag'>{product.lot || 'N/A'}</p>
          </div>
        </div>

        <div className='info-row single-column'>
          <div className='info-item'>
            <span className='info-label'>Código del Producto</span>
            <p className='info-value'>{product.code}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductInfoCard;

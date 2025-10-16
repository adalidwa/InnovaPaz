import { useNavigate } from 'react-router-dom';
import TitleDescription from '../../../components/common/TitleDescription';
import type { ProductLegacy } from '../types/inventory';
import './ProductDetails.css';

interface ProductDetailsProps {
  product: ProductLegacy;
}

function ProductDetails({ product }: ProductDetailsProps) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/productos');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#22c55e';
      case 'bajo':
        return '#f59e0b';
      case 'critico':
        return '#ef4444';
      case 'agotado':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Stock Normal';
      case 'bajo':
        return 'Stock Bajo';
      case 'critico':
        return 'Stock Crítico';
      case 'agotado':
        return 'Agotado';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className='product-details-container'>
      <div className='product-header-row'>
        <button className='back-button' onClick={handleGoBack}>
          ←
        </button>

        <div className='product-title-section'>
          <TitleDescription
            title={product.name}
            description={`Código: ${product.code} | ${product.category}`}
            titleSize={24}
            descriptionSize={14}
            titleWeight='semibold'
            descriptionWeight='normal'
            spacing='0.25rem'
            align='left'
          />
        </div>

        <div className='product-status-section'>
          <div className='status-badge' style={{ backgroundColor: getStatusColor(product.status) }}>
            {getStatusText(product.status)}
          </div>
          {product.active ? (
            <div className='active-badge'>Activo</div>
          ) : (
            <div className='inactive-badge'>Inactivo</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;

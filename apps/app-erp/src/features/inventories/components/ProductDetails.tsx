import { useNavigate } from 'react-router-dom';
import TitleDescription from '../../../components/common/TitleDescription';
import type { Product } from '../types/inventory';
import './ProductDetails.css';

interface ProductDetailsProps {
  product: Product;
}

function ProductDetails({ product }: ProductDetailsProps) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/productos');
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
      </div>
    </div>
  );
}

export default ProductDetails;

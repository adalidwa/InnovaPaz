import { useNavigate } from 'react-router-dom';
import TitleDescription from '../../../components/common/TitleDescription';
import Button from '../../../components/common/Button';
import type { Product } from '../types/inventory';
import Editar from '../../../assets/images/Editar.png';
import Eliminar from '../../../assets/images/Delete.png';
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

        <div className='product-actions'>
          <Button
            variant='secondary'
            size='medium'
            icon={<img src={Editar} alt='Editar' />}
            iconPosition='left'
            onClick={() => console.log('Editar producto:', product.name)}
          >
            Editar
          </Button>
          <Button
            variant='warning'
            size='medium'
            icon={<img src={Eliminar} alt='Eliminar' />}
            iconPosition='left'
            onClick={() => console.log('Eliminar producto:', product.name)}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;

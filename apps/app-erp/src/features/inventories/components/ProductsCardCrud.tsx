import Invetarios from '../../../assets/icons/Inventarios.png';
import Ojo from '../../../assets/images/Ojo.png';
import Editar from '../../../assets/images/Editar.png';
import { Button, StatusTag } from '../../../components/common';
import TitleDescription from '../../../components/common/TitleDescription';
import type { Product } from '../types/inventory';
import './ProductsCardCrud.css';
import { useNavigate } from 'react-router-dom';

interface ProductsCardCrudProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDeactivate?: (productId: string) => void;
}

function ProductsCardCrud({ product, onEdit, onDeactivate }: ProductsCardCrudProps) {
  const navigate = useNavigate();

  const getStatusConfig = (status: Product['status']) => {
    switch (status) {
      case 'critico':
        return { text: 'Crítico', color: 'var(--error-600)', textColor: 'var(--white)' };
      case 'bajo':
        return { text: 'Bajo', color: 'var(--warning-600)', textColor: 'var(--white)' };
      case 'agotado':
        return { text: 'Agotado', color: 'var(--error-800)', textColor: 'var(--white)' };
      default:
        return { text: 'Normal', color: 'var(--sec-600)', textColor: 'var(--white)' };
    }
  };

  const statusConfig = getStatusConfig(product.status);

  const handleView = () => {
    navigate(`/productos/ver/${product.id}`);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(product);
    }
  };

  const handleDeactivate = () => {
    if (
      onDeactivate &&
      window.confirm(`¿Estás seguro de que deseas desactivar el producto "${product.name}"?`)
    ) {
      onDeactivate(product.id);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-BO');
  };

  const formatPrice = (price: number | string | null | undefined) => {
    if (price === null || price === undefined) return '0.00';
    const numericPrice = typeof price === 'number' ? price : parseFloat(price.toString());
    return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
  };

  return (
    <div className='product-card'>
      <div className='product-card-header'>
        <div className='product-icon'>
          <img src={Invetarios} alt='Inventarios' />
        </div>
        <StatusTag
          text={statusConfig.text}
          backgroundColor={statusConfig.color}
          textColor={statusConfig.textColor}
          width={60}
          height={24}
          radius={12}
        />
      </div>

      <div className='product-title-section'>
        <TitleDescription
          title={product.name}
          description={`Código: ${product.code} | ${product.category}`}
          titleSize={18}
          descriptionSize={13}
          titleWeight='semibold'
          descriptionWeight='medium'
          spacing={4}
          titleColor='var(--pri-900)'
          descriptionColor='var(--pri-500)'
        />
      </div>

      <div className='product-details'>
        <div className='product-detail-item'>
          <span className='product-detail-label'>Stock:</span>
          <span className='product-detail-value'>{product.stock}</span>
        </div>
        <div className='product-detail-item'>
          <span className='product-detail-label'>Precio:</span>
          <span className='product-detail-value'>Bs. {formatPrice(product.price)}</span>
        </div>
        <div className='product-detail-item'>
          <span className='product-detail-label'>Mínimo:</span>
          <span className='product-detail-value'>{product.minStock}</span>
        </div>
        <div className='product-detail-item'>
          <span className='product-detail-label'>Vencimiento:</span>
          <span className='product-detail-value'>{formatDate(product.expirationDate)}</span>
        </div>
        <div className='product-detail-item'>
          <span className='product-detail-label'>Lote:</span>
          <span className='product-detail-value'>{product.lot || 'N/A'}</span>
        </div>
      </div>

      <div className='product-actions'>
        <Button
          variant='outline'
          size='small'
          icon={<img src={Ojo} alt='Ver' />}
          iconPosition='left'
          onClick={handleView}
        >
          Ver
        </Button>
        <Button variant='secondary' size='small' iconPosition='left' onClick={handleEdit}>
          <img src={Editar} alt='Editar' />
        </Button>
        <Button variant='warning' size='small' iconPosition='left' onClick={handleDeactivate}>
          cambiar estado
        </Button>
      </div>
    </div>
  );
}

export default ProductsCardCrud;

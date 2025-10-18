import Invetarios from '../../../assets/icons/Inventarios.png';
import Ojo from '../../../assets/images/Ojo.png';
import Editar from '../../../assets/images/Editar.png';
import { Button, StatusTag } from '../../../components/common';
import TitleDescription from '../../../components/common/TitleDescription';
import type { ProductLegacy } from '../types/inventory';
import './ProductsCardCrud.css';
import { useNavigate } from 'react-router-dom';

interface ProductsCardCrudProps {
  product: ProductLegacy;
  onEdit?: (product: ProductLegacy) => void;
  onDeactivate?: (productId: string) => void;
}

function ProductsCardCrud({ product, onEdit, onDeactivate }: ProductsCardCrudProps) {
  const navigate = useNavigate();

  const getStatusConfig = () => {
    const stockActual = product.stock || 0;

    // Lógica simplificada basada en stock actual con colores hex
    if (stockActual === 0) {
      return {
        text: 'Agotado',
        color: '#dc2626', // rojo oscuro
        textColor: '#ffffff',
      };
    } else if (stockActual <= 5) {
      // Crítico: 5 unidades o menos
      return {
        text: 'Crítico',
        color: '#ef4444', // rojo
        textColor: '#ffffff',
      };
    } else if (stockActual <= 15) {
      // Bajo: entre 6 y 15 unidades
      return {
        text: 'Bajo',
        color: '#f59e0b', // amarillo/naranja
        textColor: '#ffffff',
      };
    } else if (stockActual <= 30) {
      // Normal: entre 16 y 30 unidades
      return {
        text: 'Normal',
        color: '#3b82f6', // azul
        textColor: '#ffffff',
      };
    } else {
      // Óptimo: más de 30 unidades
      return {
        text: 'Óptimo',
        color: '#10b981', // verde
        textColor: '#ffffff',
      };
    }
  };

  const statusConfig = getStatusConfig();

  const handleView = () => {
    navigate(`ver/${product.id}`);
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
          width={80}
          height={28}
          radius={14}
          className='product-status-tag'
        />
      </div>

      {/* Imagen del producto desde la base de datos */}
      <div className='product-image-section'>
        <img
          src={product.image || '/placeholder-product.png'}
          alt={product.name}
          className='product-image'
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-product.png';
          }}
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

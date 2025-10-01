import Invetarios from '../../../assets/icons/Inventarios.png';
import Ojo from '../../../assets/images/Ojo.png';
import Editar from '../../../assets/images/Editar.png';
import Eliminar from '../../../assets/images/Delete.png';
import { Button, StatusTag } from '../../../components/common';
import TitleDescription from '../../../components/common/TitleDescription';
import './ProductsCardCrud.css';

function ProductsCardCrud() {
  return (
    <div className='product-card'>
      <div className='product-card-header'>
        <div className='product-icon'>
          <img src={Invetarios} alt='Inventarios' />
        </div>
        <StatusTag
          text='Normal'
          backgroundColor='var(--sec-600)'
          textColor='var(--white)'
          width={60}
          height={24}
          radius={12}
        />
      </div>

      <div className='product-title-section'>
        <TitleDescription
          title='Coca Cola 500ml'
          description='Código: COC500 | Bebidas'
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
          <span className='product-detail-value'>48</span>
        </div>
        <div className='product-detail-item'>
          <span className='product-detail-label'>Precio:</span>
          <span className='product-detail-value'>Bs. 3.5</span>
        </div>
        <div className='product-detail-item'>
          <span className='product-detail-label'>Mínimo:</span>
          <span className='product-detail-value'>20</span>
        </div>
        <div className='product-detail-item'>
          <span className='product-detail-label'>Vencimiento:</span>
          <span className='product-detail-value'>2024-12-15</span>
        </div>
        <div className='product-detail-item'>
          <span className='product-detail-label'>Lote:</span>
          <span className='product-detail-value'>LOT2024001</span>
        </div>
      </div>

      <div className='product-actions'>
        <Button
          variant='outline'
          size='small'
          icon={<img src={Ojo} alt='Ver' />}
          iconPosition='left'
        >
          Ver
        </Button>
        <Button
          variant='ghost'
          size='small'
          icon={<img src={Editar} alt='Editar' />}
          iconPosition='left'
        ></Button>
        <Button
          variant='ghost'
          size='small'
          icon={<img src={Eliminar} alt='Eliminar' />}
          iconPosition='left'
        ></Button>
      </div>
    </div>
  );
}

export default ProductsCardCrud;

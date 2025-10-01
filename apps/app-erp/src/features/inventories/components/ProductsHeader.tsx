import './ProductsHeader.css';
import Button from '../../../components/common/Button';

interface ProductsHeaderProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonVariant: string;
  hasIcon: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

function ProductsHeader({
  title,
  subtitle,
  buttonText,
  buttonVariant,
  hasIcon,
  icon,
  iconPosition,
}: ProductsHeaderProps) {
  return (
    <div className='products-header'>
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div>
        <Button
          variant={buttonVariant}
          icon={hasIcon ? icon : undefined}
          iconPosition={iconPosition}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}

export default ProductsHeader;

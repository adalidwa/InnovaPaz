import './ProductsHeader.css';
import Button from '../../../components/common/Button';

interface ProductsHeaderProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary' | 'warning' | 'success' | 'outline' | 'accent' | 'ghost';
  hasIcon?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onButtonClick?: () => void;
}

function ProductsHeader({
  title,
  subtitle,
  buttonText,
  buttonVariant,
  hasIcon = false,
  icon,
  iconPosition = 'left',
  onButtonClick,
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
          size='medium'
          icon={hasIcon ? icon : undefined}
          iconPosition={iconPosition}
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}

export default ProductsHeader;

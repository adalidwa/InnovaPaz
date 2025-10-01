import StatusTag from './StatusTag';

interface ProductStatusProps {
  status?: 'normal' | 'discontinued' | 'limited';
  className?: string;
}

function ProductStatus({ status = 'normal', className = '' }: ProductStatusProps) {
  const getStatusText = () => {
    switch (status) {
      case 'normal':
        return 'Normal';
      case 'discontinued':
        return 'Descontinuado';
      case 'limited':
        return 'Limitado';
      default:
        return 'Normal';
    }
  };

  const getStatusVariant = () => {
    switch (status) {
      case 'normal':
        return 'normal'; // Color turquesa
      case 'discontinued':
        return 'danger';
      case 'limited':
        return 'warning';
      default:
        return 'normal';
    }
  };

  return (
    <StatusTag
      text={getStatusText()}
      variant={getStatusVariant()}
      width='auto'
      height={24}
      radius={12}
      className={className}
    />
  );
}

export default ProductStatus;

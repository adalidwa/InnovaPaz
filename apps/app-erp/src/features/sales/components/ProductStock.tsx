import StatusTag from './StatusTag';

interface ProductStockProps {
  stock: number;
  className?: string;
}

function ProductStock({ stock, className = '' }: ProductStockProps) {
  // Determinar colores del stock según disponibilidad
  const getStockColors = () => {
    if (stock === 0) {
      return {
        backgroundColor: 'var(--acc-50)',
        textColor: 'var(--acc-600)',
      };
    } else if (stock <= 10) {
      return {
        backgroundColor: 'var(--var-50)',
        textColor: 'var(--var-800)',
      };
    } else {
      return {
        backgroundColor: 'var(--sec-100)',
        textColor: 'var(--sec-700)',
      };
    }
  };

  const stockColors = getStockColors();

  return (
    <StatusTag
      text={`Stock: ${stock}`}
      backgroundColor={stockColors.backgroundColor}
      textColor={stockColors.textColor}
      width='auto'
      height={24}
      radius={6}
      className={`product-card__stock-tag ${className}`}
    />
  );
}

export default ProductStock;

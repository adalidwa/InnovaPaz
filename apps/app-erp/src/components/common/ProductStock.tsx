import './ProductCard.css';

interface ProductStockProps {
  stock: number;
  className?: string;
}

function ProductStock({ stock, className = '' }: ProductStockProps) {
  return (
    <span
      className={`product-card__stock ${stock === 0 ? 'product-card__stock--out' : ''} ${className}`}
    >
      Stock: {stock}
    </span>
  );
}

export default ProductStock;

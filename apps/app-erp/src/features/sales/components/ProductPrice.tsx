import './ProductCard.css';

interface ProductPriceProps {
  price: number;
  currency?: string;
  className?: string;
}

function ProductPrice({ price, currency = 'Bs.', className = '' }: ProductPriceProps) {
  return (
    <div className={`product-card-sales__price ${className}`}>
      {currency} {price.toFixed(2)}
    </div>
  );
}

export default ProductPrice;

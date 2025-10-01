import './ProductCard.css';

interface ProductCodeProps {
  code: string;
  className?: string;
}

function ProductCode({ code, className = '' }: ProductCodeProps) {
  return <span className={`product-card__code ${className}`}>{code}</span>;
}

export default ProductCode;

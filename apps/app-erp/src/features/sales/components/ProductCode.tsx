import StatusTag from './StatusTag';

interface ProductCodeProps {
  code: string;
  className?: string;
}

function ProductCode({ code, className = '' }: ProductCodeProps) {
  return (
    <StatusTag
      text={code}
      backgroundColor='var(--pri-100)'
      textColor='var(--pri-600)'
      width='auto'
      height={24}
      radius={6}
      uppercase={true}
      className={`product-card__code-tag ${className}`}
    />
  );
}

export default ProductCode;

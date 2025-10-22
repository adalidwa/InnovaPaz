import './CartSummary.css';

interface CartSummaryProps {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

function CartSummary({ subtotal, taxRate, taxAmount, total }: CartSummaryProps) {
  const formatCurrency = (amount: number) => {
    return `Bs. ${amount.toFixed(2)}`;
  };

  return (
    <div className='cart-summary'>
      <h3 className='cart-summary__title'>Resumen</h3>

      <div className='cart-summary__lines'>
        <div className='cart-summary__line'>
          <span className='cart-summary__label'>Subtotal:</span>
          <span className='cart-summary__value'>{formatCurrency(subtotal)}</span>
        </div>

        <div className='cart-summary__line'>
          <span className='cart-summary__label'>Impuestos ({(taxRate * 100).toFixed(0)}%):</span>
          <span className='cart-summary__value'>{formatCurrency(taxAmount)}</span>
        </div>

        <div className='cart-summary__line cart-summary__line--total'>
          <span className='cart-summary__label'>Total:</span>
          <span className='cart-summary__value cart-summary__value--total'>
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CartSummary;

import React from 'react';
import Select from '../../../components/common/Select';
import './PaymentMethod.css';

interface PaymentMethodProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const paymentOptions = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta_credito', label: 'Tarjeta de Crédito' },
  { value: 'tarjeta_debito', label: 'Tarjeta de Débito' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'qr', label: 'Código QR' },
];

function PaymentMethod({ value, onChange, disabled = false }: PaymentMethodProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'efectivo':
        return (
          <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M11 8C11 9.1 11.9 10 13 10S15 9.1 15 8 14.1 6 13 6 11 6.9 11 8M18 6V4H2V20H4V6H18M20 8V18C20 19.11 19.11 20 18 20H6C4.89 20 4 19.11 4 18V8H18C19.11 8 20 8.89 20 8Z' />
          </svg>
        );
      case 'tarjeta_credito':
      case 'tarjeta_debito':
        return (
          <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4M20 18H4V12H20V18M20 8H4V6H20V8Z' />
          </svg>
        );
      case 'transferencia':
        return (
          <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M14 12C14 14.21 12.21 16 10 16S6 14.21 6 12 7.79 8 10 8 14 9.79 14 12M2 12C2 6.48 6.48 2 12 2S22 6.48 22 12H20C20 7.59 16.41 4 12 4S4 7.59 4 12H2M18 12C18 15.31 15.31 18 12 18S6 15.31 6 12H8C8 14.21 9.79 16 12 16S16 14.21 16 12H18Z' />
          </svg>
        );
      case 'qr':
        return (
          <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M3 11H5V13H3V11M11 5H13V9H11V5M9 11H13V15H9V11M15 11H17V13H15V11M19 11H21V13H19V11M5 15H7V17H5V15M3 5H9V9H3V5M5 7V7H7V7H5M15 5H21V9H15V5M17 7V7H19V7H17M3 15H9V19H3V15M5 17V17H7V17H5Z' />
          </svg>
        );
      default:
        return (
          <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2M13 17H11V15H13V17M13 13H11V7H13V13Z' />
          </svg>
        );
    }
  };

  const selectedMethod = paymentOptions.find((option) => option.value === value);

  return (
    <div className='payment-method'>
      <div className='payment-method__header'>
        <div className='payment-method__icon'>{getPaymentIcon(value)}</div>
        <h3 className='payment-method__title'>Método de Pago</h3>
      </div>

      <Select
        label=''
        options={paymentOptions}
        value={value}
        onChange={handleChange}
        placeholder='Seleccionar método de pago'
        disabled={disabled}
        className='payment-method__select'
      />

      {selectedMethod && (
        <div className='payment-method__selected'>
          <div className='payment-method__selected-icon'>{getPaymentIcon(value)}</div>
          <span className='payment-method__selected-text'>{selectedMethod.label}</span>
        </div>
      )}
    </div>
  );
}

export default PaymentMethod;

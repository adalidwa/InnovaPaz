import React from 'react';
import './BusinessTypeSelect.css';

interface BusinessTypeOption {
  value: string;
  label: string;
}

interface BusinessTypeSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: BusinessTypeOption[];
  disabled?: boolean;
  placeholder?: string;
  theme?: 'light' | 'dark';
  size?: 'small' | 'medium' | 'large';
  id?: string;
  name?: string;
  className?: string;
  textColor?: string;
  backgroundColor?: string;
  optionTextColor?: string;
  optionBackgroundColor?: string;
}

const BusinessTypeSelect: React.FC<BusinessTypeSelectProps> = ({
  value,
  onChange,
  options,
  disabled = false,
  placeholder = 'Selecciona un tipo de negocio',
  theme = 'light',
  size = 'medium',
  id = 'businessType',
  name,
  className = '',
  textColor = 'var(--pri-100)',
  backgroundColor = 'inherit',
  optionTextColor = 'var(--pri-100)',
  optionBackgroundColor = 'var(--pri-900)',
}) => {
  const classes = `business-type-select ${theme} ${size} ${className}`.trim();

  return (
    <select
      id={id}
      name={name || id}
      className={classes}
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{
        color: textColor,
        backgroundColor: backgroundColor,
      }}
    >
      <option value='' disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          style={{
            color: optionTextColor,
            backgroundColor: optionBackgroundColor,
          }}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default BusinessTypeSelect;

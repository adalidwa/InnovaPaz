import './Select.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.ComponentProps<'select'> {
  label?: string;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

function Select({
  className = '',
  label,
  required,
  id,
  options,
  placeholder = 'Seleccionar...',
  ...props
}: SelectProps) {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className='select-wrapper'>
      {label && (
        <label htmlFor={selectId} className='select-label'>
          {label}
          {required && <span className='select-required'>*</span>}
        </label>
      )}
      <select id={selectId} className={`select ${className}`} required={required} {...props}>
        <option value='' disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Select;

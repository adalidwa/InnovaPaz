import './Input.css';

interface InputProps extends React.ComponentProps<'input'> {
  label?: string;
  required?: boolean;
}

function Input({ className = '', type = 'text', label, required, id, ...props }: InputProps) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className='input-wrapper'>
      {label && (
        <label htmlFor={inputId} className='input-label'>
          {label}
          {required && <span className='input-required'>*</span>}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        className={`input ${className}`}
        required={required}
        {...props}
      />
    </div>
  );
}

export default Input;

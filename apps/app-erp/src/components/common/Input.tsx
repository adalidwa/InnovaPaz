import './Input.css';

function Input({ className = '', type = 'text', ...props }: React.ComponentProps<'input'>) {
  return <input type={type} className={`input ${className}`} {...props} />;
}

export default Input;

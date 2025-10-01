import React from 'react';
import '../../assets/styles/theme.css';
import './Button.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'warning' | 'success' | 'outline' | 'accent';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

function Button({
  children,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  rounded = 'md',
}: ButtonProps) {
  const getButtonClasses = () => {
    const classes = ['btn', `btn-${variant}`, `btn-${size}`, `btn-rounded-${rounded}`];

    if (fullWidth) classes.push('btn-full-width');
    if (loading) classes.push('btn-loading');
    if (className) classes.push(className);

    return classes.join(' ');
  };

  const renderIcon = () => {
    if (loading) {
      return null; // El spinner se maneja con CSS
    }

    if (icon) {
      return (
        <span
          className={`btn-icon ${iconPosition === 'left' ? 'btn-icon-left' : 'btn-icon-right'}`}
        >
          {icon}
        </span>
      );
    }

    return null;
  };

  return (
    <button
      type={type}
      className={getButtonClasses()}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {iconPosition === 'left' && renderIcon()}
      {loading ? 'Cargando...' : children}
      {iconPosition === 'right' && !loading && renderIcon()}
    </button>
  );
}

export default Button;

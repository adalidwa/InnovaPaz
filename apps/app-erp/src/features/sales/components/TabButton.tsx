import React from 'react';
import Button from '../../../components/common/Button';
import './TabButton.css';

interface TabButtonProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

function TabButton({
  children,
  isActive = false,
  onClick,
  icon,
  disabled = false,
}: TabButtonProps) {
  return (
    <Button
      variant={isActive ? 'primary' : 'outline'}
      size='medium'
      icon={icon}
      onClick={onClick}
      disabled={disabled}
      className={`tab-button ${isActive ? 'tab-button--active' : 'tab-button--inactive'}`}
      rounded='md'
    >
      {children}
    </Button>
  );
}

export default TabButton;

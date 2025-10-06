import { useState } from 'react';
import Button from '../../../components/common/Button';
import './ShoppingNavigation.css';

interface ShoppingNavigationProps {
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
}

const tabs = [
  {
    id: 'proveedores',
    label: 'Proveedores',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M16 4C18.21 4 20 5.79 20 8S18.21 12 16 12 12 10.21 12 8 13.79 4 16 4M16 14C20.42 14 24 15.79 24 18V20H8V18C8 15.79 11.58 14 16 14M6 6H2V4H6V6M6 10H2V8H6V10M6 14H2V12H6V14Z' />
      </svg>
    ),
  },
  {
    id: 'ordenes-compra',
    label: 'Órdenes de Compra',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M19 7H16V6C16 4.9 15.1 4 14 4H10C8.9 4 8 4.9 8 6V7H5C3.9 7 3 7.9 3 9V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V9C21 7.9 20.1 7 19 7M10 6H14V7H10V6M19 20H5V9H7V11H9V9H15V11H17V9H19V20Z' />
      </svg>
    ),
  },
  {
    id: 'recepciones',
    label: 'Recepciones',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2M12 8L11.5 10L12 12L12.5 10L12 8M8 16L10.5 20.5L11 22L8.5 17.5L8 16M16 16L15.5 17.5L13 22L13.5 20.5L16 16Z' />
      </svg>
    ),
  },
  {
    id: 'cotizaciones',
    label: 'Cotizaciones',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20Z' />
      </svg>
    ),
  },
  {
    id: 'contratos',
    label: 'Contratos',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M15 3V5H17.59L12 10.59L9.88 8.47L2.59 15.76L4 17.17L9.88 11.29L12 13.41L18.41 7H21V5H15M15 8V10H21V8H15M15 13V15H21V13H15Z' />
      </svg>
    ),
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V5H19V19M17 12H12V17H17V12M11 7H6V12H11V7Z' />
      </svg>
    ),
  },
];

function ShoppingNavigation({ defaultTab = 'proveedores', onTabChange }: ShoppingNavigationProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className='shopping-navigation'>
      <div className='shopping-navigation__tabs'>
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'outline'}
            size='medium'
            icon={tab.icon}
            iconPosition='left'
            onClick={() => handleTabClick(tab.id)}
            className={`shopping-navigation__tab ${activeTab === tab.id ? 'shopping-navigation__tab--active' : ''}`}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default ShoppingNavigation;

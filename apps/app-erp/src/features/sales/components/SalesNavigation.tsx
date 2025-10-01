import React, { useState } from 'react';
import TabButton from './TabButton';
import './SalesNavigation.css';

interface SalesNavigationProps {
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
}

const tabs = [
  {
    id: 'punto-venta',
    label: 'Punto de Venta',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z' />
      </svg>
    ),
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M16 4C18.21 4 20 5.79 20 8S18.21 12 16 12 12 10.21 12 8 13.79 4 16 4M16 14C20.42 14 24 15.79 24 18V20H8V18C8 15.79 11.58 14 16 14M6 6H2V4H6V6M6 10H2V8H6V10M6 14H2V12H6V14Z' />
      </svg>
    ),
  },
  {
    id: 'historial',
    label: 'Historial',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M13.5 8H12V13L16.28 15.54L17 14.33L13.5 12.25V8M13 3C8.03 3 4 7.03 4 12H1L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5S20 8.13 20 12 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 20 10.5 21 13 21C17.97 21 22 16.97 22 12S17.97 3 13 3' />
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
    id: 'pedidos',
    label: 'Pedidos',
    icon: (
      <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M19 7H16V6C16 4.9 15.1 4 14 4H10C8.9 4 8 4.9 8 6V7H5C3.9 7 3 7.9 3 9V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V9C21 7.9 20.1 7 19 7M10 6H14V7H10V6M19 20H5V9H7V11H9V9H15V11H17V9H19V20Z' />
      </svg>
    ),
  },
];

function SalesNavigation({ defaultTab = 'punto-venta', onTabChange }: SalesNavigationProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className='sales-navigation'>
      <div className='sales-navigation__container'>
        <div className='sales-navigation__tabs'>
          {tabs.map((tab) => (
            <div key={tab.id} className='sales-navigation__tab-item'>
              <TabButton
                isActive={activeTab === tab.id}
                onClick={() => handleTabClick(tab.id)}
                icon={tab.icon}
              >
                <span className='sales-navigation__tab-label'>{tab.label}</span>
              </TabButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SalesNavigation;

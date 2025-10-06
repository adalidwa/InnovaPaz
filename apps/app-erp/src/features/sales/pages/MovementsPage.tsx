import { useState } from 'react';
import '../../../assets/styles/theme.css';
import {
  SalesNavigation,
  PointOfSale,
  ClientsTable,
  SalesHistory,
  QuotesManagement,
} from '../components';
import TitleDescription from '../../../components/common/TitleDescription';
import './MovementsPage.css';

function MovementsPage() {
  const [activeTab, setActiveTab] = useState('punto-venta');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'punto-venta':
        return <PointOfSale />;
      case 'clientes':
        return <ClientsTable />;
      case 'historial':
        return <SalesHistory />;
      case 'cotizaciones':
        return <QuotesManagement />;
      case 'pedidos':
        return (
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              background: 'var(--white)',
              margin: '32px',
              borderRadius: '8px',
              border: '1px solid var(--pri-200)',
            }}
          >
            <h3 style={{ font: 'var(--font-20)', color: 'var(--pri-900)', marginBottom: '16px' }}>
              Gestión de Pedidos
            </h3>
            <p style={{ font: 'var(--font-14)', color: 'var(--pri-600)' }}>
              Módulo de pedidos en desarrollo...
            </p>
          </div>
        );
      default:
        return <PointOfSale />;
    }
  };

  return (
    <main>
      <div className='sales-navigation__title-container'>
        <TitleDescription
          title='Módulo de Ventas'
          description='Gestión completa de ventas, clientes, cotizaciones y pedidos'
          titleSize={31}
          descriptionSize={16}
          titleWeight='bold'
          descriptionWeight='normal'
          align='left'
        />
        <SalesNavigation defaultTab={activeTab} onTabChange={handleTabChange} />
      </div>
      <div>{renderContent()}</div>
    </main>
  );
}

export default MovementsPage;

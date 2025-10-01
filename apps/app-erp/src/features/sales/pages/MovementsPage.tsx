import { useState } from 'react';
import '../../../assets/styles/theme.css';
import { SalesNavigation, PointOfSale } from '../components';
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
              Gestión de Clientes
            </h3>
            <p style={{ font: 'var(--font-14)', color: 'var(--pri-600)' }}>
              Módulo de clientes en desarrollo...
            </p>
          </div>
        );
      case 'historial':
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
              Historial de Ventas
            </h3>
            <p style={{ font: 'var(--font-14)', color: 'var(--pri-600)' }}>
              Módulo de historial en desarrollo...
            </p>
          </div>
        );
      case 'cotizaciones':
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
              Cotizaciones
            </h3>
            <p style={{ font: 'var(--font-14)', color: 'var(--pri-600)' }}>
              Módulo de cotizaciones en desarrollo...
            </p>
          </div>
        );
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

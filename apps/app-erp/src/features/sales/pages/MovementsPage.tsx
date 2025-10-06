import { useState } from 'react';
import '../../../assets/styles/theme.css';
import {
  SalesNavigation,
  PointOfSale,
  ClientsTable,
  SalesHistory,
  QuotesManagement,
  OrdersManagement,
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
        return <OrdersManagement />;
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

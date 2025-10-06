import { useState } from 'react';
import '../../../assets/styles/theme.css';
import './ShoppingPage.css';
import TitleDescription from '../../../components/common/TitleDescription';
import { ShoppingNavigation } from '../components';
import ProvidersPage from './ProvidersPage';
import PurchaseOrdersPage from './PurchaseOrdersPage';
import ReceptionsPage from './ReceptionsPage';
import QuotesPage from './QuotesPage';
import ContractsPage from './ContractsPage';
import ReportsPage from './ReportsPage';

function ShoppingPage() {
  const [activeTab, setActiveTab] = useState('proveedores');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'proveedores':
        return <ProvidersPage />;
      case 'ordenes-compra':
        return <PurchaseOrdersPage />;
      case 'recepciones':
        return <ReceptionsPage />;
      case 'cotizaciones':
        return <QuotesPage />;
      case 'contratos':
        return <ContractsPage />;
      case 'reportes':
        return <ReportsPage />;
      default:
        return <ProvidersPage />;
    }
  };

  return (
    <main>
      <div className='shopping-navigation__title-container'>
        <TitleDescription
          title='Módulo de Compras'
          description='Gestión completa de compras, proveedores, órdenes y contratos'
          titleSize={31}
          descriptionSize={16}
          titleWeight='bold'
          descriptionWeight='normal'
          align='left'
        />
        <ShoppingNavigation defaultTab={activeTab} onTabChange={handleTabChange} />
      </div>
      <div>{renderContent()}</div>
    </main>
  );
}

export default ShoppingPage;

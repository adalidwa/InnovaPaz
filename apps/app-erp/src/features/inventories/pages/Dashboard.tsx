import React, { useState } from 'react';
import ProductsHeader from '../components/ProductsHeader';
import SummaryCardsRow from '../components/ui/SummaryCardsRow';
import StatusListCard from '../components/ui/StatusListCard';
import CriticalStockModal from '../components/ui/CriticalStockModal';
import './Dashboard.css';

interface DashboardProps {
  businessType?: 'ferreteria' | 'minimarket' | 'licoreria';
}

const Dashboard: React.FC<DashboardProps> = ({ businessType = 'minimarket' }) => {
  const [showAllMovements, setShowAllMovements] = useState(false);
  const [showCriticalStockModal, setShowCriticalStockModal] = useState(false);

  const getMovementsByBusinessType = () => {
    const baseMovements = {
      ferreteria: [
        { product: 'Martillo Stanley 16oz', category: 'Herramientas' },
        { product: 'Tornillos autorroscantes 1"', category: 'Ferretería' },
        { product: 'Pintura Viniltex Blanco 1Gal', category: 'Pinturas' },
        { product: 'Cable eléctrico #12 AWG', category: 'Eléctricos' },
        { product: 'Tubo PVC 4" x 6m', category: 'Plomería' },
        { product: 'Cemento Portland 50kg', category: 'Construcción' },
        { product: 'Lija para madera #120', category: 'Abrasivos' },
        { product: 'Candado Master Lock 40mm', category: 'Seguridad' },
        { product: 'Manguera jardín 1/2" x 15m', category: 'Jardín' },
        { product: 'Bombillo LED 9W E27', category: 'Eléctricos' },
        { product: 'Silicona transparente 300ml', category: 'Adhesivos' },
        { product: 'Destornillador Phillips #2', category: 'Herramientas' },
        { product: 'Cinta aislante 3M', category: 'Eléctricos' },
        { product: 'Rodillo pintura 9"', category: 'Pinturas' },
        { product: 'Llave stillson 10"', category: 'Herramientas' },
      ],
      minimarket: [
        { product: 'Leche Alquería 1L', category: 'Lácteos' },
        { product: 'Pan Bimbo tajado 500g', category: 'Panadería' },
        { product: 'Arroz Diana 500g', category: 'Granos' },
        { product: 'Aceite Girasol Premier 1L', category: 'Aceites' },
        { product: 'Gaseosa Coca-Cola 1.5L', category: 'Bebidas' },
        { product: 'Huevos AA x30 unidades', category: 'Proteínas' },
        { product: 'Jabón Protex 120g', category: 'Aseo' },
        { product: 'Pasta Doria 500g', category: 'Granos' },
        { product: 'Atún Van Camps 170g', category: 'Enlatados' },
        { product: 'Papel higiénico Scott 4 rollos', category: 'Aseo' },
        { product: 'Detergente Ariel 500g', category: 'Limpieza' },
        { product: 'Yogurt Alpina 1L', category: 'Lácteos' },
        { product: 'Galletas Noel Saltín 500g', category: 'Snacks' },
        { product: 'Salchicha Zenú 500g', category: 'Embutidos' },
        { product: 'Shampoo Head & Shoulders 400ml', category: 'Cuidado personal' },
      ],
      licoreria: [
        { product: 'Aguardiente Antioqueño 750ml', category: 'Licores nacionales' },
        { product: 'Ron Medellín Añejo 750ml', category: 'Rones' },
        { product: 'Cerveza Águila 330ml x6', category: 'Cervezas' },
        { product: "Whisky Buchanan's 12 años 750ml", category: 'Whiskys' },
        { product: 'Vodka Smirnoff 750ml', category: 'Vodkas' },
        { product: 'Vino Gato Negro Cabernet 750ml', category: 'Vinos' },
        { product: 'Cerveza Corona 355ml x12', category: 'Cervezas' },
        { product: 'Tequila José Cuervo 750ml', category: 'Tequilas' },
        { product: 'Brandy Tres Esquinas 750ml', category: 'Brandys' },
        { product: 'Cerveza Poker 330ml x30', category: 'Cervezas' },
        { product: 'Champagne Chandon 750ml', category: 'Espumosos' },
        { product: 'Licor Baileys 750ml', category: 'Cremas' },
        { product: 'Cerveza Heineken 330ml x6', category: 'Cervezas' },
        { product: 'Gin Bombay 750ml', category: 'Ginebras' },
        { product: 'Pisco Tres Esquinas 750ml', category: 'Piscos' },
      ],
    };

    return baseMovements[businessType];
  };

  const getCriticalProductsByBusinessType = () => {
    const criticalProducts = {
      ferreteria: [
        { product: 'Tornillos autorroscantes 1/2"', stock: 45, min: 100 },
        { product: 'Pintura Viniltex Blanco 1Gal', stock: 3, min: 15 },
        { product: 'Cable eléctrico #14 AWG', stock: 12, min: 25 },
        { product: 'Cemento Portland 50kg', stock: 8, min: 20 },
        { product: 'Bombillo LED 12W E27', stock: 15, min: 30 },
        { product: 'Tubo PVC 2" x 6m', stock: 5, min: 12 },
        { product: 'Lija para metal #80', stock: 25, min: 50 },
      ],
      minimarket: [
        { product: 'Leche Alquería 1L', stock: 8, min: 25 },
        { product: 'Pan Bimbo tajado 500g', stock: 12, min: 30 },
        { product: 'Arroz Diana 1kg', stock: 15, min: 40 },
        { product: 'Aceite Girasol Premier 1L', stock: 6, min: 20 },
        { product: 'Huevos AA x30 unidades', stock: 4, min: 15 },
        { product: 'Detergente Ariel 1kg', stock: 9, min: 25 },
        { product: 'Papel higiénico Scott 12 rollos', stock: 18, min: 35 },
      ],
      licoreria: [
        { product: 'Cerveza Águila 330ml x6', stock: 15, min: 50 },
        { product: 'Aguardiente Antioqueño 750ml', stock: 8, min: 25 },
        { product: 'Ron Medellín Añejo 750ml', stock: 5, min: 15 },
        { product: 'Cerveza Poker 330ml x30', stock: 3, min: 10 },
        { product: "Whisky Buchanan's 12 años 750ml", stock: 2, min: 8 },
        { product: 'Vino Gato Negro Merlot 750ml', stock: 12, min: 30 },
        { product: 'Cerveza Corona 355ml x12', stock: 7, min: 20 },
      ],
    };

    return criticalProducts[businessType];
  };

  const products = getMovementsByBusinessType();
  const criticalProductsData = getCriticalProductsByBusinessType();

  const allMovements = products.map((item, index) => ({
    id: index + 1,
    title: index % 2 === 0 ? `Entrada de ${item.product}` : `Salida de ${item.product}`,
    time: [
      '08:00 AM',
      '09:15 AM',
      '10:30 AM',
      '11:45 AM',
      '01:20 PM',
      '02:30 PM',
      '03:45 PM',
      '04:15 PM',
      '05:00 PM',
      '06:30 PM',
      '07:45 PM',
      '08:20 PM',
      '09:10 PM',
      '10:05 PM',
      '11:30 PM',
    ][index],
    tag: {
      label: index % 2 === 0 ? 'Entrada' : 'Salida',
      type: index % 2 === 0 ? ('entrada' as const) : ('salida' as const),
    },
    value: [50, 20, 30, 15, 40, 25, 60, 35, 45, 10, 55, 18, 70, 22, 65][index] || 30,
  }));

  const displayedMovements = showAllMovements ? allMovements : allMovements.slice(0, 7);

  const criticalProducts = criticalProductsData.map((item, index) => ({
    id: index + 1,
    title: item.product,
    subtitle: `Stock: ${item.stock} | Mínimo: ${item.min}`,
    tag: {
      label: item.stock <= item.min * 0.3 ? 'Crítico' : 'Bajo',
      type: item.stock <= item.min * 0.3 ? ('critico' as const) : ('bajo' as const),
    },
    hasIcon: true,
  }));

  return (
    <div className='dashboard'>
      <ProductsHeader
        title='Dashboard de Inventario'
        subtitle={`Resumen general de tu ${businessType === 'ferreteria' ? 'ferretería' : businessType === 'licoreria' ? 'licorería' : 'minimarket'}`}
        buttonText='Generar reporte'
        buttonVariant='primary'
        hasIcon={false}
      />
      <SummaryCardsRow />
      <div className='dashboard-row'>
        <StatusListCard
          title='Movimientos Recientes'
          items={displayedMovements}
          buttonLabel={showAllMovements ? 'Ver menos' : 'Ver todos los movimientos'}
          buttonVariant='secondary'
          buttonClassName='status-list-card__button--blue-border'
          onButtonClick={() => setShowAllMovements(!showAllMovements)}
        />
        <StatusListCard
          title='Productos Críticos'
          items={criticalProducts}
          buttonLabel='Gestionar stock critico'
          buttonVariant='warning'
          buttonClassName='status-list-card__button--text-primary'
          onButtonClick={() => setShowCriticalStockModal(true)}
        />
      </div>

      <CriticalStockModal
        isOpen={showCriticalStockModal}
        onClose={() => setShowCriticalStockModal(false)}
        businessType={businessType}
      />
    </div>
  );
};

export default Dashboard;

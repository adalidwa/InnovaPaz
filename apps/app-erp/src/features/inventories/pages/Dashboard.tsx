import React, { useState, useEffect } from 'react';
import ProductsHeader from '../components/ProductsHeader';
import SummaryCardsRow from '../components/ui/SummaryCardsRow';
import StatusListCard from '../components/ui/StatusListCard';
import CriticalStockModal from '../components/ui/CriticalStockModal';
import {
  inventoryMovementsService,
  type MovimientoInventario,
  type ProductoCritico,
} from '../services/inventoryMovementsService';
import { useUser } from '../../users/hooks/useContextBase';
import './Dashboard.css';

interface DashboardProps {
  businessType?: 'ferreteria' | 'minimarket' | 'licoreria';
}

const Dashboard: React.FC<DashboardProps> = ({ businessType = 'minimarket' }) => {
  const { user } = useUser();
  const [showAllMovements, setShowAllMovements] = useState(false);
  const [showCriticalStockModal, setShowCriticalStockModal] = useState(false);
  const [recentMovements, setRecentMovements] = useState<MovimientoInventario[]>([]);
  const [criticalProductsData, setCriticalProductsData] = useState<ProductoCritico[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos reales de la base de datos
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.empresa_id) return;

      try {
        setLoading(true);

        // Cargar movimientos recientes y productos críticos en paralelo
        const [movementsResponse, criticalResponse] = await Promise.all([
          inventoryMovementsService.getRecentMovements(user.empresa_id, 15),
          inventoryMovementsService.getCriticalProducts(user.empresa_id),
        ]);

        setRecentMovements(movementsResponse);
        setCriticalProductsData(criticalResponse);
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.empresa_id]);

  // Convertir movimientos de BD al formato esperado por StatusListCard
  const allMovements = recentMovements.map((movement) => {
    const isEntrada =
      movement.tipo_movimiento.toLowerCase().includes('entrada') ||
      movement.tipo_movimiento.toLowerCase().includes('ingreso');
    const fecha = new Date(movement.fecha_movimiento);

    return {
      id: movement.movimiento_id,
      title: `${isEntrada ? 'Entrada' : 'Salida'} de ${movement.nombre_producto}`,
      time: fecha.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      tag: {
        label: isEntrada ? 'Entrada' : 'Salida',
        type: isEntrada ? ('entrada' as const) : ('salida' as const),
      },
      value: movement.cantidad,
    };
  });

  const displayedMovements = showAllMovements ? allMovements : allMovements.slice(0, 7);

  // Convertir productos críticos de BD al formato esperado por StatusListCard
  const criticalProducts = criticalProductsData.map((product) => {
    const stockPercentage = product.stock_minimo > 0 ? product.stock / product.stock_minimo : 0;
    const isCritical = stockPercentage <= 0.3;

    return {
      id: product.producto_id,
      title: product.nombre_producto,
      subtitle: `Stock: ${product.stock} | Mínimo: ${product.stock_minimo || 'No definido'}`,
      tag: {
        label: isCritical ? 'Crítico' : 'Bajo',
        type: isCritical ? ('critico' as const) : ('bajo' as const),
      },
      hasIcon: true,
    };
  });

  if (loading) {
    return (
      <div className='dashboard'>
        <ProductsHeader title='Dashboard de Inventario' subtitle='Cargando datos...' />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          Cargando información del dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className='dashboard'>
      <ProductsHeader
        title='Dashboard de Inventario'
        subtitle={`Resumen general de tu ${businessType === 'ferreteria' ? 'ferretería' : businessType === 'licoreria' ? 'licorería' : 'minimarket'}`}
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

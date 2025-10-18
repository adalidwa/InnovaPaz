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
import { useCompanyConfig } from '../../../contexts/CompanyConfigContext';
import './Dashboard.css';

interface DashboardProps {
  businessType?: 'ferreteria' | 'minimarket' | 'licoreria';
}

const Dashboard: React.FC<DashboardProps> = () => {
  const { user } = useUser();
  const { config } = useCompanyConfig();
  const [showCriticalStockModal, setShowCriticalStockModal] = useState(false);
  const [showAllMovements, setShowAllMovements] = useState(false);
  const [recentMovements, setRecentMovements] = useState<MovimientoInventario[]>([]);
  const [criticalProductsData, setCriticalProductsData] = useState<ProductoCritico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener el nombre correcto del tipo de negocio
  const getBusinessTypeName = (tipoNegocio: string): string => {
    if (!tipoNegocio) return 'negocio';

    // Los valores ya vienen normalizados del backend (ferreteria, licoreria, minimarket)
    const businessTypes: Record<string, string> = {
      minimarket: 'minimarket',
      ferreteria: 'ferretería',
      licoreria: 'licorería',
    };

    const normalizedType = tipoNegocio.toLowerCase().trim();
    return businessTypes[normalizedType] || 'negocio';
  };

  // Generar subtítulo dinámico
  const getDashboardSubtitle = (): string => {
    const businessTypeName = getBusinessTypeName(config.tipoNegocio);
    return `Resumen general de tu ${businessTypeName}`;
  };

  // Cargar datos reales de la base de datos
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.empresa_id) return;

      try {
        setLoading(true);
        setError(null);

        // Cargar movimientos recientes y productos críticos en paralelo
        const [movementsResponse, criticalResponse] = await Promise.all([
          inventoryMovementsService.getRecentMovements(user.empresa_id, 15),
          inventoryMovementsService.getCriticalProducts(user.empresa_id),
        ]);

        // Asegurar que siempre tenemos arrays válidos
        setRecentMovements(Array.isArray(movementsResponse) ? movementsResponse : []);
        setCriticalProductsData(Array.isArray(criticalResponse) ? criticalResponse : []);
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        setError('Error al cargar los datos del dashboard. Usando datos por defecto.');
        // Asegurar que tenemos arrays vacíos en caso de error
        setRecentMovements([]);
        setCriticalProductsData([]);
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
      <ProductsHeader title='Dashboard de Inventario' subtitle={getDashboardSubtitle()} />
      {error && (
        <div
          style={{
            padding: '1rem',
            margin: '1rem 0',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            color: '#856404',
          }}
        >
          <strong>Aviso:</strong> {error}
        </div>
      )}
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
        businessType={
          getBusinessTypeName(config.tipoNegocio) as 'ferreteria' | 'minimarket' | 'licoreria'
        }
      />
    </div>
  );
};

export default Dashboard;

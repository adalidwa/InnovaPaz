import React, { useState } from 'react';
import {
  IoAnalytics,
  IoDownload,
  IoDocument,
  IoTrendingUp,
  IoTrendingDown,
  IoCheckmarkCircle,
} from 'react-icons/io5';

// Imports locales
import './ReportsPage.css';
import { useReports, useReportModals } from '../hooks/hooks';

// Imports de componentes
import TitleDescription from '../../../components/common/TitleDescription';
import Button from '../../../components/common/Button';
import StatusTag from '../../../components/common/StatusTag';
import Modal from '../../../components/common/Modal';
import Table from '../../../components/common/Table';

// Interfaces for table data
interface StockProduct {
  id: number;
  product: string;
  currentStock: number;
  minStock: number;
  status: string;
}

const PAGE_INFO = {
  title: 'Reportes y Análisis de Compras',
  description: 'Dashboard ejecutivo y reportes operativos del módulo',
};

const ReportsPage: React.FC = () => {
  const {
    monthlyPurchases,
    accumulatedSavings,
    averageDeliveryTime,
    supplierPurchases,
    supplierPerformance,
    stockProducts,
    formatCurrency,
  } = useReports();

  const {
    showExportModal,
    showReportModal,
    showAnalysisModal,
    showEvaluationModal,
    openExportModal,
    closeExportModal,
    openReportModal,
    closeReportModal,
    openAnalysisModal,
    closeAnalysisModal,
    openEvaluationModal,
    closeEvaluationModal,
  } = useReportModals();

  const [stockFilter, setStockFilter] = useState('all');

  // Filter products based on stock status
  const getStockPercentage = (current: number, min: number) => {
    return Math.round((current / min) * 100);
  };

  const filteredProducts =
    stockFilter === 'all'
      ? stockProducts
      : stockProducts.filter((product) => {
          const percentage = getStockPercentage(product.currentStock, product.minStock);
          return stockFilter === 'critical' ? percentage < 100 : percentage >= 100;
        });

  const getStockStatusStyle = (status: string) => {
    if (status === 'Crítico') {
      return {
        backgroundColor: 'var(--danger-100)',
        textColor: 'var(--danger-800)',
      };
    }
    return {
      backgroundColor: 'var(--sec-100)',
      textColor: 'var(--sec-800)',
    };
  };

  const handleExportData = (type: string) => {
    // Export functionality - replaced with alert for demo
    alert(`Exportando datos de ${type}...`);
    closeExportModal();
  };

  const handleGenerateReport = (type: string) => {
    // Report generation functionality - replaced with alert for demo
    alert(`Generando reporte ${type}...`);
    closeReportModal();
  };

  // Configure supplier purchases table
  const supplierPurchasesColumns = [
    {
      key: 'name',
      header: 'Proveedor',
      width: '40%',
    },
    {
      key: 'amount',
      header: 'Monto',
      width: '30%',
      className: 'text-center',
      render: (value: number) => formatCurrency(value),
    },
    {
      key: 'percentage',
      header: '% del Total',
      width: '30%',
      className: 'text-center',
      render: (value: number) => `${value}%`,
    },
  ];

  // Configure supplier performance table
  const supplierPerformanceColumns = [
    {
      key: 'name',
      header: 'Proveedor',
      width: '50%',
    },
    {
      key: 'rating',
      header: 'Rating',
      width: '25%',
      className: 'text-center',
      render: (value: number) => <div className='rating'>{value} ★</div>,
    },
    {
      key: 'compliance',
      header: 'Cumplimiento',
      width: '25%',
      className: 'text-center',
      render: (value: number) => `${value}%`,
    },
  ];

  // Configure stock products table
  const stockProductsColumns = [
    {
      key: 'product',
      header: 'Producto',
      width: '30%',
    },
    {
      key: 'currentStock',
      header: 'Stock Actual',
      width: '15%',
      className: 'text-center',
    },
    {
      key: 'minStock',
      header: 'Stock Mínimo',
      width: '15%',
      className: 'text-center',
    },
    {
      key: 'percentage',
      header: '% Disponible',
      width: '15%',
      className: 'text-center',
      render: (_: unknown, row: StockProduct) => {
        const percentage = getStockPercentage(row.currentStock, row.minStock);
        return <div className='percentage'>{percentage}%</div>;
      },
    },
    {
      key: 'status',
      header: 'Estado',
      width: '25%',
      className: 'text-center',
      render: (_: unknown, row: StockProduct) => {
        const percentage = getStockPercentage(row.currentStock, row.minStock);
        const status = percentage < 100 ? 'Crítico' : 'Normal';
        const statusStyle = getStockStatusStyle(status);

        return (
          <StatusTag
            text={status}
            backgroundColor={statusStyle.backgroundColor}
            textColor={statusStyle.textColor}
          />
        );
      },
    },
  ];

  return (
    <div className='reports-page'>
      {/* Header without action button */}
      <div className='reports-header'>
        <TitleDescription
          title={PAGE_INFO.title}
          description={PAGE_INFO.description}
          titleSize={32}
          descriptionSize={16}
        />
      </div>

      {/* KPI Cards Section */}
      <div className='reports-kpi-section'>
        <div className='kpi-card'>
          <div className='kpi-content'>
            <div className='kpi-header'>
              <h3>Compras del Mes</h3>
              <IoTrendingUp size={24} className='kpi-icon positive' />
            </div>
            <div className='kpi-value'>{formatCurrency(monthlyPurchases.amount)}</div>
            <div className='kpi-trend positive'>↑ {monthlyPurchases.trend}% vs mes anterior</div>
          </div>
        </div>

        <div className='kpi-card'>
          <div className='kpi-content'>
            <div className='kpi-header'>
              <h3>Ahorro Acumulado</h3>
              <IoAnalytics size={24} className='kpi-icon secondary' />
            </div>
            <div className='kpi-value'>{formatCurrency(accumulatedSavings.amount)}</div>
            <div className='kpi-description'>Por negociación y cotizaciones</div>
          </div>
        </div>

        <div className='kpi-card'>
          <div className='kpi-content'>
            <div className='kpi-header'>
              <h3>Tiempo Promedio Entrega</h3>
              <IoTrendingDown size={24} className='kpi-icon positive' />
            </div>
            <div className='kpi-value'>{averageDeliveryTime.days} días</div>
            <div className='kpi-trend positive'>
              ↓ {averageDeliveryTime.improvement} días vs promedio
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Spending Section */}
      <div className='reports-section'>
        <div className='section-header'>
          <h3>Compras por Proveedor</h3>
          <Button variant='secondary' onClick={openExportModal} icon={<IoDownload />} size='small'>
            Exportar
          </Button>
        </div>
        <Table
          data={supplierPurchases}
          columns={supplierPurchasesColumns}
          emptyMessage='No se encontraron datos de compras por proveedor'
        />
      </div>

      {/* Supplier Performance Section */}
      <div className='reports-section'>
        <div className='section-header'>
          <h3>Desempeño de Proveedores</h3>
          <Button variant='secondary' onClick={openExportModal} icon={<IoDownload />} size='small'>
            Exportar
          </Button>
        </div>
        <Table
          data={supplierPerformance}
          columns={supplierPerformanceColumns}
          emptyMessage='No se encontraron datos de desempeño de proveedores'
        />
      </div>

      {/* Stock Products Section */}
      <div className='reports-section'>
        <div className='section-header'>
          <h3>Productos vs Stock Mínimo</h3>
          <div className='section-actions'>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className='filter-select'
            >
              <option value='all'>Todos</option>
              <option value='critical'>Críticos</option>
              <option value='normal'>Normales</option>
            </select>
            <Button
              variant='secondary'
              onClick={openExportModal}
              icon={<IoDownload />}
              size='small'
            >
              Exportar CSV
            </Button>
          </div>
        </div>

        <Table
          data={filteredProducts}
          columns={stockProductsColumns}
          emptyMessage='No se encontraron productos que coincidan con el filtro'
        />
      </div>

      {/* Quick Actions Section */}
      <div className='reports-section'>
        <h3>Acciones Rápidas</h3>
        <div className='quick-actions'>
          <Button
            variant='primary'
            onClick={openExportModal}
            icon={<IoDownload />}
            className='action-button'
          >
            Exportar Todo
          </Button>

          <Button
            variant='secondary'
            onClick={openReportModal}
            icon={<IoDocument />}
            className='action-button'
          >
            Reporte Mensual
          </Button>

          <Button
            variant='secondary'
            onClick={openAnalysisModal}
            icon={<IoAnalytics />}
            className='action-button'
          >
            Análisis Precios
          </Button>

          <Button
            variant='secondary'
            onClick={openEvaluationModal}
            icon={<IoCheckmarkCircle />}
            className='action-button'
          >
            Evaluación Proveedores
          </Button>
        </div>
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={closeExportModal}
        title='Exportar Datos'
        message='Seleccione el tipo de datos que desea exportar:'
        modalType='info'
        showCancelButton={true}
        confirmButtonText='Exportar'
        cancelButtonText='Cancelar'
        onConfirm={() => handleExportData('seleccionados')}
        onCancel={closeExportModal}
      />

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={closeReportModal}
        title='Generar Reporte Mensual'
        message='¿Desea generar el reporte mensual de compras? Este incluirá todas las transacciones y análisis del mes actual.'
        modalType='info'
        showCancelButton={true}
        confirmButtonText='Generar'
        cancelButtonText='Cancelar'
        onConfirm={() => handleGenerateReport('mensual')}
        onCancel={closeReportModal}
      />

      {/* Analysis Modal */}
      <Modal
        isOpen={showAnalysisModal}
        onClose={closeAnalysisModal}
        title='Análisis de Precios'
        message='El análisis de precios comparará las cotizaciones actuales con históricos y proveedores alternativos.'
        modalType='info'
        showCancelButton={true}
        confirmButtonText='Iniciar Análisis'
        cancelButtonText='Cancelar'
        onConfirm={() => handleGenerateReport('precios')}
        onCancel={closeAnalysisModal}
      />

      {/* Evaluation Modal */}
      <Modal
        isOpen={showEvaluationModal}
        onClose={closeEvaluationModal}
        title='Evaluación de Proveedores'
        message='Se generará un reporte completo de desempeño de proveedores basado en cumplimiento, calidad y tiempos de entrega.'
        modalType='info'
        showCancelButton={true}
        confirmButtonText='Evaluar'
        cancelButtonText='Cancelar'
        onConfirm={() => handleGenerateReport('evaluacion')}
        onCancel={closeEvaluationModal}
      />
    </div>
  );
};

export default ReportsPage;

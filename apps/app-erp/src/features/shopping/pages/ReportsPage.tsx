import React, { useState } from 'react';
import '../../../assets/styles/theme.css';
import './ReportsPage.css';
import TitleDescription from '../../../components/common/TitleDescription';
import Button from '../../../components/common/Button';
import Select from '../../../components/common/Select';
import StatusTag from '../../../components/common/StatusTag';
import Modal from '../../../components/common/Modal';
import Table from '../../../components/common/Table';
import {
  IoAnalytics,
  IoDownload,
  IoTrendingUp,
  IoTrendingDown,
  IoClose,
  IoTime,
  IoStar,
} from 'react-icons/io5';
import {
  useReports,
  type StockAnalysis,
  type PurchasesByProvider,
  type ProviderPerformance,
} from '../hooks/hooks';

const pageInfo = {
  title: 'Reportes y Análisis de Compras',
  description: 'Dashboard ejecutivo y reportes operativos del módulo',
};

function ReportsPage() {
  // Hook para reportes
  const {
    getKPIs,
    getPurchasesByProvider,
    getProviderPerformance,
    getStockAnalysis,
    stockFilter,
    handleStockFilterChange,
    exportPurchasesByProvider,
    exportProviderPerformance,
    exportStockAnalysis,
    exportAll,
    generateMonthlyReport,
    analyzePrices,
    evaluateProviders,
    formatCurrency,
  } = useReports();

  // Estados para modales
  const [showPriceAnalysisModal, setShowPriceAnalysisModal] = useState(false);
  const [showProviderEvaluationModal, setShowProviderEvaluationModal] = useState(false);
  const [priceAnalysis, setPriceAnalysis] = useState<any>(null);
  const [providerEvaluation, setProviderEvaluation] = useState<any>(null);

  // Obtener datos
  const kpis = getKPIs();
  const purchasesByProvider = getPurchasesByProvider();
  const providerPerformance = getProviderPerformance();
  const stockAnalysis = getStockAnalysis();

  // Opciones para filtro de stock
  const stockFilterOptions = [
    { value: 'all', label: 'Todos los productos' },
    { value: 'critical', label: 'Solo críticos' },
    { value: 'normal', label: 'Solo normales' },
  ];

  // Handlers para análisis
  const handlePriceAnalysis = () => {
    const analysis = analyzePrices();
    setPriceAnalysis(analysis);
    setShowPriceAnalysisModal(true);
  };

  const handleProviderEvaluation = () => {
    const evaluation = evaluateProviders();
    setProviderEvaluation(evaluation);
    setShowProviderEvaluationModal(true);
  };

  // Configuración de tabla para stock
  const stockTableColumns = [
    {
      key: 'productName',
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
      render: (value: number) => `${value}%`,
    },
    {
      key: 'status',
      header: 'Estado',
      width: '25%',
      className: 'text-center',
      render: (value: string) => {
        const isCritical = value === 'Crítico';
        return (
          <StatusTag
            text={value}
            backgroundColor={isCritical ? 'var(--acc-100)' : 'var(--sec-100)'}
            textColor={isCritical ? 'var(--acc-800)' : 'var(--sec-800)'}
          />
        );
      },
    },
  ];

  return (
    <div className='reports-page'>
      <div className='reports-header'>
        <div className='reports-titleSection'>
          <TitleDescription
            title={pageInfo.title}
            description={pageInfo.description}
            titleSize={32}
            descriptionSize={16}
          />
        </div>
      </div>

      <div className='reports-content'>
        {/* KPIs Section */}
        <div className='kpis-section'>
          <div className='kpi-card'>
            <div className='kpi-header'>
              <h3>Compras del Mes</h3>
              {kpis.monthlyPurchases.trend === 'up' ? (
                <IoTrendingUp size={24} color='var(--sec-600)' />
              ) : (
                <IoTrendingDown size={24} color='var(--acc-600)' />
              )}
            </div>
            <div className='kpi-value'>{formatCurrency(kpis.monthlyPurchases.amount)}</div>
            <div className='kpi-trend'>↑ {kpis.monthlyPurchases.percentage}% vs mes anterior</div>
          </div>

          <div className='kpi-card'>
            <div className='kpi-header'>
              <h3>Ahorro Acumulado</h3>
              <IoAnalytics size={24} color='var(--pri-600)' />
            </div>
            <div className='kpi-value'>{formatCurrency(kpis.accumulatedSavings.amount)}</div>
            <div className='kpi-description'>{kpis.accumulatedSavings.description}</div>
          </div>

          <div className='kpi-card'>
            <div className='kpi-header'>
              <h3>Tiempo Promedio Entrega</h3>
              <IoTime size={24} color='var(--warning-600)' />
            </div>
            <div className='kpi-value'>{kpis.averageDeliveryTime.days} días</div>
            <div className='kpi-trend'>
              ↓ {Math.abs(kpis.averageDeliveryTime.change)} días vs promedio
            </div>
          </div>
        </div>

        {/* Compras por Proveedor */}
        <div className='reports-section'>
          <div className='section-header'>
            <h3>Compras por Proveedor</h3>
            <Button
              variant='secondary'
              onClick={exportPurchasesByProvider}
              icon={<IoDownload />}
              size='small'
            >
              Exportar
            </Button>
          </div>

          <div className='provider-purchases-list'>
            {purchasesByProvider.map((provider) => (
              <div key={provider.id} className='provider-item'>
                <div className='provider-info'>
                  <div className='provider-name'>{provider.name}</div>
                  <div className='provider-amount'>{formatCurrency(provider.amount)}</div>
                </div>
                <div className='provider-percentage'>{provider.percentage}% del total</div>
              </div>
            ))}
          </div>
        </div>

        {/* Desempeño de Proveedores */}
        <div className='reports-section'>
          <div className='section-header'>
            <h3>Desempeño de Proveedores</h3>
            <Button
              variant='secondary'
              onClick={exportProviderPerformance}
              icon={<IoDownload />}
              size='small'
            >
              Exportar
            </Button>
          </div>

          <div className='performance-table'>
            <div className='performance-header'>
              <div>Proveedor</div>
              <div>Rating</div>
              <div>Cumplimiento</div>
            </div>
            {providerPerformance.map((provider) => (
              <div key={provider.id} className='performance-row'>
                <div className='performance-provider'>{provider.name}</div>
                <div className='performance-rating'>
                  {provider.rating} <IoStar color='var(--warning-500)' />
                </div>
                <div className='performance-compliance'>{provider.compliance}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Productos vs Stock Mínimo */}
        <div className='reports-section'>
          <div className='section-header'>
            <h3>Productos vs Stock Mínimo</h3>
            <div className='section-actions'>
              <Select
                value={stockFilter}
                onChange={(e) => handleStockFilterChange(e.target.value as any)}
                options={stockFilterOptions}
                className='filter-select'
              />
              <Button
                variant='secondary'
                onClick={exportStockAnalysis}
                icon={<IoDownload />}
                size='small'
              >
                Exportar CSV
              </Button>
            </div>
          </div>

          <div className='stock-table'>
            <Table
              data={stockAnalysis}
              columns={stockTableColumns}
              emptyMessage='No hay productos que coincidan con el filtro'
            />
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className='reports-section'>
          <div className='section-header'>
            <h3>Acciones Rápidas</h3>
          </div>

          <div className='quick-actions'>
            <Button
              variant='primary'
              onClick={exportAll}
              icon={<IoDownload />}
              className='action-button'
            >
              Exportar Todo
            </Button>

            <Button
              variant='secondary'
              onClick={generateMonthlyReport}
              icon={<IoAnalytics />}
              className='action-button'
            >
              Reporte Mensual
            </Button>

            <Button
              variant='accent'
              onClick={handlePriceAnalysis}
              icon={<IoTrendingUp />}
              className='action-button'
            >
              Análisis Precios
            </Button>

            <Button
              variant='success'
              onClick={handleProviderEvaluation}
              icon={<IoStar />}
              className='action-button'
            >
              Evaluación Proveedores
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Análisis de Precios */}
      {showPriceAnalysisModal && priceAnalysis && (
        <div className='modal-overlay'>
          <div className='analysis-modal'>
            <div className='analysis-modal-header'>
              <h3>Análisis de Precios</h3>
              <button
                className='analysis-modal-close'
                onClick={() => setShowPriceAnalysisModal(false)}
                type='button'
              >
                <IoClose size={20} />
              </button>
            </div>

            <div className='analysis-modal-body'>
              <div className='analysis-info'>
                <div className='analysis-row'>
                  <label>Total de productos analizados:</label>
                  <span>{priceAnalysis.totalProducts}</span>
                </div>
                <div className='analysis-row'>
                  <label>Variación promedio de precios:</label>
                  <span>{priceAnalysis.averageVariation}%</span>
                </div>
                <div className='analysis-row'>
                  <label>Mejores ofertas:</label>
                  <span>{priceAnalysis.bestDeals.join(', ')}</span>
                </div>
                <div className='analysis-row'>
                  <label>Recomendación:</label>
                  <span>{priceAnalysis.recommendation}</span>
                </div>
              </div>
            </div>

            <div className='analysis-modal-footer'>
              <Button
                variant='secondary'
                onClick={() => setShowPriceAnalysisModal(false)}
                className='modal-button'
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Evaluación de Proveedores */}
      {showProviderEvaluationModal && providerEvaluation && (
        <div className='modal-overlay'>
          <div className='analysis-modal'>
            <div className='analysis-modal-header'>
              <h3>Evaluación de Proveedores</h3>
              <button
                className='analysis-modal-close'
                onClick={() => setShowProviderEvaluationModal(false)}
                type='button'
              >
                <IoClose size={20} />
              </button>
            </div>

            <div className='analysis-modal-body'>
              <div className='analysis-info'>
                <div className='analysis-row'>
                  <label>Mejor proveedor:</label>
                  <span>
                    {providerEvaluation.topPerformer.name} ({providerEvaluation.topPerformer.rating}{' '}
                    ★)
                  </span>
                </div>
                <div className='analysis-row'>
                  <label>Rating promedio:</label>
                  <span>{providerEvaluation.averageRating} ★</span>
                </div>
                <div className='analysis-row'>
                  <label>Proveedores que necesitan mejora:</label>
                  <span>
                    {providerEvaluation.improvementNeeded.length === 0
                      ? 'Ninguno'
                      : providerEvaluation.improvementNeeded.map((p: any) => p.name).join(', ')}
                  </span>
                </div>
              </div>
            </div>

            <div className='analysis-modal-footer'>
              <Button
                variant='secondary'
                onClick={() => setShowProviderEvaluationModal(false)}
                className='modal-button'
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;

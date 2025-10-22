import SummaryCard from './SummaryCard';
import { FaCube, FaDollarSign, FaExclamationTriangle, FaExchangeAlt } from 'react-icons/fa';
import { useProductsContext } from '../../context/ProductsContext';
import './SummaryCardsRow.css';

const SummaryCardsRow = () => {
  const { allProducts } = useProductsContext();

  // Calcular métricas reales
  const totalProducts = allProducts.length;

  // Calcular valor total del inventario (precio * stock)
  const totalInventoryValue = allProducts.reduce((total, product) => {
    return total + product.price * product.stock;
  }, 0);

  // Calcular productos críticos (stock <= minStock)
  const criticalProducts = allProducts.filter(
    (product) => product.stock <= product.minStock
  ).length;

  // Calcular porcentajes (comparado con datos simulados anteriores)
  const totalProductsPercentage = totalProducts > 1200 ? '+' : '-';
  const totalProductsPercent = Math.abs(((totalProducts - 1200) / 1200) * 100).toFixed(1);

  const inventoryValuePercentage = totalInventoryValue > 340000 ? '+' : '-';
  const inventoryValuePercent = Math.abs(((totalInventoryValue - 340000) / 340000) * 100).toFixed(
    1
  );

  const criticalPercentage = criticalProducts < 15 ? '+' : '-';
  const criticalPercent = Math.abs(((criticalProducts - 15) / 15) * 100).toFixed(1);

  return (
    <div className='summary-cards-row'>
      <SummaryCard
        title='Total Productos'
        value={totalProducts}
        percentage={`${totalProductsPercentage}${totalProductsPercent}%`}
        isPositive={totalProducts >= 1200}
        icon={<FaCube />}
      />
      <SummaryCard
        title='Valor Inventario'
        value={Math.round(totalInventoryValue)}
        percentage={`${inventoryValuePercentage}${inventoryValuePercent}%`}
        isPositive={totalInventoryValue >= 340000}
        icon={<FaDollarSign />}
      />
      <SummaryCard
        title='Productos Críticos'
        value={criticalProducts}
        percentage={`${criticalPercentage}${criticalPercent}%`}
        isPositive={criticalProducts <= 15}
        icon={<FaExclamationTriangle />}
      />
      <SummaryCard
        title='Movimientos Hoy'
        value={8}
        percentage='0.5%'
        isPositive={false}
        icon={<FaExchangeAlt />}
      />
    </div>
  );
};

export default SummaryCardsRow;

import PricingInfoComponent from '../components/PricingInfoComponent';
import ProductDetails from '../components/ProductDetails';
import ProductInfoCard from '../components/ProductInfoCard';
import RecentMovementsComponent from '../components/RecentMovementsComponent';
import StatsCardComponent from '../components/StatsCardComponent';
import StockComponent from '../components/StockComponent';
import './SeeInventories.css';

function SeeInventories() {
  return (
    <div>
      <ProductDetails />
      <div className='info-stock-container'>
        <ProductInfoCard />
        <StockComponent />
      </div>
      <div className='secondary-info-container'>
        <RecentMovementsComponent />
        <div className='side-cards-container'>
          <PricingInfoComponent />
          <StatsCardComponent />
        </div>
      </div>
    </div>
  );
}

export default SeeInventories;

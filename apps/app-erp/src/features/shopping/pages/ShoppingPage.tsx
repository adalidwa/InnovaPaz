import { useNavigate } from 'react-router-dom';
import '../../../assets/styles/theme.css';
import './ShoppingPage.css';
import ShoppingCard from '../components/ShoppingCard';
import TitleDescription from '../../../components/common/TitleDescription';
import Input from '../../../components/common/Input';
import {
  IoStorefront,
  IoPeople,
  IoDocumentText,
  IoDownload,
  IoPricetag,
  IoContract,
  IoAnalytics,
  IoSearch,
} from 'react-icons/io5';
import { useShoppingModules, type ShoppingModule } from '../hooks/hooks';

type Status = 'Normal' | 'Revisar';

const pageInfo = {
  title: 'Compras',
  description: 'Administra el inventario de tu minimarket',
};

const resolveIcon = (name: ShoppingModule['icon'], color: string) => {
  switch (name) {
    case 'store':
      return <IoStorefront color={color} />;
    case 'people':
      return <IoPeople color={color} />;
    case 'doc':
      return <IoDocumentText color={color} />;
    case 'download':
      return <IoDownload color={color} />;
    case 'tag':
      return <IoPricetag color={color} />;
    case 'contract':
      return <IoContract color={color} />;
    case 'analytics':
    default:
      return <IoAnalytics color={color} />;
  }
};

const statusStyle = (status: Status) => {
  if (status === 'Normal') {
    return {
      tagBg: 'var(--sec-100)',
      tagText: 'var(--sec-800)',
      iconColor: 'var(--sec-700)',
      buttonVariant: 'success' as const,
    };
  }
  return {
    tagBg: 'var(--acc-100)',
    tagText: 'var(--acc-800)',
    iconColor: 'var(--acc-700)',
    buttonVariant: 'accent' as const,
  };
};

function ShoppingPage() {
  const navigate = useNavigate();

  // Use shopping modules hook instead of hardcoded data
  const { modules, searchTerm, getModuleQuantity, getModuleStatus, handleSearchChange } =
    useShoppingModules();

  const handleCardClick = (module: ShoppingModule) => {
    if (module.route) {
      navigate(module.route);
    }
  };

  return (
    <div className='shopping-page'>
      <div className='shopping-header'>
        <TitleDescription
          title={pageInfo.title}
          description={pageInfo.description}
          titleSize={32}
          descriptionSize={16}
        />
        <div className='shopping-search'>
          <Input
            placeholder='Buscar en compras...'
            value={searchTerm}
            onChange={handleSearchChange}
            leftIcon={<IoSearch color='var(--pri-500)' />}
            className='search-input'
          />
        </div>
      </div>
      <div className='shopping-grid'>
        {modules.map((module) => {
          const status = getModuleStatus(module);
          const quantity = getModuleQuantity(module.id);
          const style = statusStyle(status);

          return (
            <ShoppingCard
              key={module.id}
              statusText={status}
              statusBgColor={style.tagBg}
              statusTextColor={style.tagText}
              icon={resolveIcon(module.icon, style.iconColor)}
              title={module.title}
              description={module.description}
              type={module.type}
              quantity={quantity}
              buttonText='Ver'
              buttonVariant={style.buttonVariant}
              onButtonClick={() => handleCardClick(module)}
              titleSize={25}
              descriptionSize={16}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ShoppingPage;

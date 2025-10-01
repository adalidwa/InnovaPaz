import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

type Status = 'Normal' | 'Revisar';

interface ShoppingItem {
  status: Status;
  title: string;
  description: string;
  type: string;
  quantity: number;
  icon: 'store' | 'people' | 'doc' | 'download' | 'tag' | 'contract' | 'analytics';
  route?: string;
}

const pageInfo = {
  title: 'Compras',
  description: 'Administra el inventario de tu minimarket',
};

const data: ShoppingItem[] = [
  {
    status: 'Normal',
    title: 'Provisionamiento',
    description: 'Define umbrales de stock para reabastecimiento automático',
    type: 'Productos',
    quantity: 400,
    icon: 'store',
    route: 'provisioning',
  },
  {
    status: 'Revisar',
    title: 'Proveedores',
    description: 'Administra tus proveedores y evalúa su desempeño',
    type: 'Proveedores',
    quantity: 400,
    icon: 'people',
  },
  {
    status: 'Normal',
    title: 'Órdenes de Compra',
    description: 'Gestiona tus órdenes de compra y recepciones',
    type: 'Órdenes',
    quantity: 400,
    icon: 'doc',
  },
  {
    status: 'Normal',
    title: 'Recepciones',
    description: 'Registra recepciones de mercadería y gestiona devoluciones',
    type: 'Recepciones',
    quantity: 400,
    icon: 'download',
  },
  {
    status: 'Normal',
    title: 'Cotizaciones',
    description: 'Compara precios entre proveedores para mejores decisiones',
    type: 'Cotizaciones',
    quantity: 400,
    icon: 'tag',
  },
  {
    status: 'Revisar',
    title: 'Contratos',
    description: 'Administra contratos comerciales con proveedores',
    type: 'Contratos',
    quantity: 400,
    icon: 'contract',
  },
  {
    status: 'Normal',
    title: 'Reportes',
    description: 'Dashboard ejecutivo y reportes operativos de compras',
    type: 'Compras',
    quantity: 400,
    icon: 'analytics',
  },
];

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

const resolveIcon = (name: ShoppingItem['icon'], color: string) => {
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

function ShoppingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredData = data.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCardClick = (item: ShoppingItem) => {
    if (item.route) {
      navigate(item.route);
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
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<IoSearch color='var(--pri-500)' />}
            className='search-input'
          />
        </div>
      </div>
      <div className='shopping-grid'>
        {filteredData.map((item, idx) => {
          const style = statusStyle(item.status);
          return (
            <ShoppingCard
              key={`${item.title}-${idx}`}
              statusText={item.status}
              statusBgColor={style.tagBg}
              statusTextColor={style.tagText}
              icon={resolveIcon(item.icon, style.iconColor)}
              title={item.title}
              description={item.description}
              type={item.type}
              quantity={item.quantity}
              buttonText='Ver'
              buttonVariant={style.buttonVariant}
              onButtonClick={() => handleCardClick(item)}
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

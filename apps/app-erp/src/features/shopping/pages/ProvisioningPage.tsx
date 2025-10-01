import { useState } from 'react';
import './ProvisioningPage.css';
import TitleDescription from '../../../components/common/TitleDescription';
import Input from '../../../components/common/Input';
import Table from '../../../components/common/Table';
import StatusTag from '../../../components/common/StatusTag';
import Pagination from '../../../components/common/Pagination';
import { IoSearch } from 'react-icons/io5';

type ProductStatus = 'Normal' | 'Critico';

interface ProductItem {
  id: number;
  product: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  status: ProductStatus;
}

const pageInfo = {
  title: 'Provisionamiento',
  description: 'Define umbrales de stock para reabastecimiento automático',
};

const productData: ProductItem[] = [
  {
    id: 1,
    product: 'CocaCola 2L Embotelladora Boliviana',
    currentStock: 15,
    minStock: 20,
    maxStock: 100,
    status: 'Critico',
  },
  {
    id: 2,
    product: 'Pepsi 2L Embotelladora del Oriente',
    currentStock: 8,
    minStock: 15,
    maxStock: 80,
    status: 'Critico',
  },
  {
    id: 3,
    product: 'Agua Vital 2L sin Gas',
    currentStock: 45,
    minStock: 30,
    maxStock: 150,
    status: 'Normal',
  },
  {
    id: 4,
    product: 'Leche Pil Entera 1L',
    currentStock: 25,
    minStock: 20,
    maxStock: 100,
    status: 'Normal',
  },
  {
    id: 5,
    product: 'Pan Blanco Grande Ideal',
    currentStock: 12,
    minStock: 25,
    maxStock: 80,
    status: 'Critico',
  },
  {
    id: 6,
    product: 'Arroz Carolina Extra 1kg',
    currentStock: 60,
    minStock: 40,
    maxStock: 200,
    status: 'Normal',
  },
  {
    id: 7,
    product: 'Aceite Fino 1L',
    currentStock: 18,
    minStock: 15,
    maxStock: 75,
    status: 'Normal',
  },
  {
    id: 8,
    product: 'Azúcar Blanca Guabirá 1kg',
    currentStock: 5,
    minStock: 20,
    maxStock: 100,
    status: 'Critico',
  },
  {
    id: 9,
    product: 'Huevos Frescos Docena',
    currentStock: 35,
    minStock: 25,
    maxStock: 120,
    status: 'Normal',
  },
  {
    id: 10,
    product: 'Detergente Ace Polvo 1kg',
    currentStock: 22,
    minStock: 15,
    maxStock: 60,
    status: 'Normal',
  },
  {
    id: 11,
    product: 'Jabón Bolivar Multiuso',
    currentStock: 8,
    minStock: 12,
    maxStock: 50,
    status: 'Critico',
  },
  {
    id: 12,
    product: 'Fideos Cayambe 500g',
    currentStock: 40,
    minStock: 30,
    maxStock: 150,
    status: 'Normal',
  },
  {
    id: 13,
    product: 'Yogurt Gloria Natural 1L',
    currentStock: 28,
    minStock: 20,
    maxStock: 90,
    status: 'Normal',
  },
  {
    id: 14,
    product: 'Cerveza Paceña 620ml',
    currentStock: 6,
    minStock: 24,
    maxStock: 120,
    status: 'Critico',
  },
  {
    id: 15,
    product: 'Queso Fresco El Ceibo 500g',
    currentStock: 18,
    minStock: 15,
    maxStock: 60,
    status: 'Normal',
  },
];

const ITEMS_PER_PAGE = 10;

function ProvisioningPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = productData.filter(
    (item) =>
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleEditProduct = (product: ProductItem) => {
    console.log('Editar producto:', product);
  };

  const handleBuyProduct = (product: ProductItem) => {
    console.log('Comprar producto:', product);
  };

  const getStatusStyle = (status: ProductStatus) => {
    if (status === 'Normal') {
      return {
        backgroundColor: 'var(--sec-100)',
        textColor: 'var(--sec-800)',
      };
    }
    return {
      backgroundColor: 'var(--acc-100)',
      textColor: 'var(--acc-800)',
    };
  };

  const tableColumns = [
    {
      key: 'product',
      header: 'Producto',
      width: '30%',
    },
    {
      key: 'currentStock',
      header: 'Stock Actual',
      width: '12%',
      className: 'textCenter',
    },
    {
      key: 'minStock',
      header: 'Stock Mínimo',
      width: '12%',
      className: 'textCenter',
    },
    {
      key: 'maxStock',
      header: 'Stock Máximo',
      width: '12%',
      className: 'textCenter',
    },
    {
      key: 'status',
      header: 'Estado',
      width: '15%',
      className: 'textCenter',
      render: (value: ProductStatus) => {
        const style = getStatusStyle(value);
        return (
          <StatusTag
            text={value}
            backgroundColor={style.backgroundColor}
            textColor={style.textColor}
          />
        );
      },
    },
  ];

  const tableActions = [
    {
      label: 'Editar',
      onClick: handleEditProduct,
      variant: 'primary' as const,
      show: () => true,
    },
    {
      label: 'Comprar',
      onClick: handleBuyProduct,
      variant: 'danger' as const,
      show: (row: ProductItem) => row.status === 'Critico',
    },
  ];

  return (
    <div className='provisioningPage'>
      <div className='provisioningHeader'>
        <TitleDescription
          title={pageInfo.title}
          description={pageInfo.description}
          titleSize={32}
          descriptionSize={16}
        />
        <div className='provisioningSearch'>
          <Input
            placeholder='Buscar en provisionamiento...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<IoSearch color='var(--pri-500)' />}
            className='search-input'
          />
        </div>
      </div>

      <div className='provisioningTable'>
        <Table
          data={currentData}
          columns={tableColumns}
          actions={tableActions}
          emptyMessage='No se encontraron productos'
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredData.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemName='productos'
        />
      </div>
    </div>
  );
}

export default ProvisioningPage;

import { useState } from 'react';
import './ProvidersPage.css';
import ProviderCard from '../components/ProviderCard';
import TitleDescription from '../../../components/common/TitleDescription';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import { IoSearch, IoAdd } from 'react-icons/io5';

interface Provider {
  id: number;
  title: string;
  description: string;
  nit: string;
  contact: string;
  phone: string;
}

const pageInfo = {
  title: 'Gestión de Proveedores',
  description: 'Administra tus proveedores y evalúa su desempeño',
};

const providersData: Provider[] = [
  {
    id: 1,
    title: 'Embotelladora Boliviana',
    description: 'Define umbrales de stock para reabastecimiento automático',
    nit: '5555555555',
    contact: 'Carlos Mamani',
    phone: '77999888',
  },
  {
    id: 2,
    title: 'Distribuidora Altiplano',
    description: 'Proveedor especializado en productos de consumo masivo',
    nit: '1234567890',
    contact: 'María Gonzales',
    phone: '78123456',
  },
  {
    id: 3,
    title: 'Alimentos del Valle S.R.L.',
    description: 'Distribuidor de productos alimenticios frescos y conservados',
    nit: '9876543210',
    contact: 'José Vargas',
    phone: '79654321',
  },
  {
    id: 4,
    title: 'Comercial Paceña',
    description: 'Importador y distribuidor de productos internacionales',
    nit: '4567891230',
    contact: 'Ana Quispe',
    phone: '76987654',
  },
  {
    id: 5,
    title: 'Lacteos Santa Cruz',
    description: 'Especialista en productos lácteos y derivados',
    nit: '7890123456',
    contact: 'Roberto Silva',
    phone: '75456789',
  },
  {
    id: 6,
    title: 'Bebidas Refrescantes Ltda.',
    description: 'Distribuidor exclusivo de bebidas carbonatadas y jugos',
    nit: '3216549870',
    contact: 'Carmen Rodríguez',
    phone: '74789123',
  },
  {
    id: 7,
    title: 'Panificadora El Sol',
    description: 'Proveedor de productos de panadería y repostería',
    nit: '6549873210',
    contact: 'Miguel Torres',
    phone: '73159753',
  },
  {
    id: 8,
    title: 'Carnes Finas Cochabamba',
    description: 'Especialista en carnes rojas, blancas y embutidos',
    nit: '9513574680',
    contact: 'Patricia Mendoza',
    phone: '72741852',
  },
  {
    id: 9,
    title: 'Verduras del Campo',
    description: 'Proveedor de frutas y verduras frescas de temporada',
    nit: '7531594860',
    contact: 'Fernando Castro',
    phone: '71963741',
  },
  {
    id: 10,
    title: 'Productos de Limpieza Max',
    description: 'Distribuidor de productos de limpieza e higiene personal',
    nit: '8642097531',
    contact: 'Sandra Morales',
    phone: '70852963',
  },
  {
    id: 11,
    title: 'Snacks Andinos',
    description: 'Fabricante de bocadillos y snacks regionales',
    nit: '1597534862',
    contact: 'Daniel Rojas',
    phone: '79741852',
  },
  {
    id: 12,
    title: 'Helados Artesanales',
    description: 'Productor de helados y postres congelados',
    nit: '9517536420',
    contact: 'Lucia Fernández',
    phone: '78963741',
  },
  {
    id: 13,
    title: 'Cereales Nutritivos S.A.',
    description: 'Distribuidor de cereales, granos y legumbres',
    nit: '3579514682',
    contact: 'Alberto Vega',
    phone: '77159357',
  },
  {
    id: 14,
    title: 'Condimentos Tradicionales',
    description: 'Especias, condimentos y sazonadores naturales',
    nit: '6428135790',
    contact: 'Rosa Chávez',
    phone: '76357951',
  },
  {
    id: 15,
    title: 'Bebidas Energéticas Pro',
    description: 'Distribuidor de bebidas deportivas y energizantes',
    nit: '1472583690',
    contact: 'Oscar Jiménez',
    phone: '75951357',
  },
  {
    id: 16,
    title: 'Chocolates Amazónicos',
    description: 'Productor de chocolates artesanales y confites',
    nit: '9630741852',
    contact: 'Elena Herrera',
    phone: '74159753',
  },
  {
    id: 17,
    title: 'Productos Orgánicos Vida',
    description: 'Alimentos orgánicos certificados y productos naturales',
    nit: '7418529630',
    contact: 'Raúl Paredes',
    phone: '73357159',
  },
  {
    id: 18,
    title: 'Conservas del Altiplano',
    description: 'Especialista en conservas de frutas y verduras',
    nit: '2583691470',
    contact: 'Gloria Salinas',
    phone: '72753951',
  },
  {
    id: 19,
    title: 'Aceites Premium',
    description: 'Distribuidor de aceites vegetales y vinagres',
    nit: '8529637410',
    contact: 'Andrés Delgado',
    phone: '71951357',
  },
  {
    id: 20,
    title: 'Productos Gourmet Ltda.',
    description: 'Importador de productos gourmet y delicatessen',
    nit: '1593578426',
    contact: 'Valeria Ramos',
    phone: '70357951',
  },
];

function ProvidersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredProviders = providersData.filter(
    (provider) =>
      provider.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.nit.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProviders = filteredProviders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleProviderClick = (provider: Provider) => {
    console.log('Ver historial de:', provider.title);
    // Aquí se puede navegar a una página de historial del proveedor
  };

  const handleAddProvider = () => {
    console.log('Agregar nuevo proveedor');
    // Aquí se puede abrir un modal o navegar a formulario
  };

  return (
    <div className='providers-page'>
      <div className='providers-header'>
        <TitleDescription
          title={pageInfo.title}
          description={pageInfo.description}
          titleSize={32}
          descriptionSize={16}
        />
        <div className='providers-search-and-add'>
          <div className='providers-search'>
            <Input
              placeholder='Buscar proveedores...'
              value={searchTerm}
              onChange={handleSearchChange}
              leftIcon={<IoSearch color='var(--pri-500)' />}
              className='search-input'
            />
          </div>
          <Button onClick={handleAddProvider} variant='primary' className='providers-add-button'>
            <IoAdd />
            Nuevo Proveedor
          </Button>
        </div>
      </div>

      <div className='providers-grid'>
        {currentProviders.map((provider) => (
          <ProviderCard
            key={provider.id}
            title={provider.title}
            description={provider.description}
            nit={provider.nit}
            contact={provider.contact}
            phone={provider.phone}
            buttonText='Ver historial'
            buttonVariant='primary'
            onButtonClick={() => handleProviderClick(provider)}
            titleSize={20}
            descriptionSize={14}
          />
        ))}
      </div>

      {filteredProviders.length > itemsPerPage && (
        <div className='providers-pagination'>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredProviders.length}
            itemsPerPage={itemsPerPage}
            itemName='proveedores'
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {filteredProviders.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--pri-600)',
            fontSize: '1.125rem',
          }}
        >
          No se encontraron proveedores que coincidan con tu búsqueda.
        </div>
      )}
    </div>
  );
}

export default ProvidersPage;

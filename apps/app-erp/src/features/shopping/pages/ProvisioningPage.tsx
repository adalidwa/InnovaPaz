import { useState } from 'react';
import './ProvisioningPage.css';
import TitleDescription from '../../../components/common/TitleDescription';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Table from '../../../components/common/Table';
import StatusTag from '../../../components/common/StatusTag';
import Pagination from '../../../components/common/Pagination';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { IoSearch, IoClose, IoAdd, IoTrash } from 'react-icons/io5';

type ProductStatus = 'Normal' | 'Critico';

interface ProductItem {
  id: number;
  product: string;
  supplier: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  status: ProductStatus;
}

const pageInfo = {
  title: 'Provisionamiento',
  description: 'Define umbrales de stock para reabastecimiento automático',
};

const supplierOptions = [
  { value: 'embotelladora-boliviana', label: 'Embotelladora Boliviana S.A.' },
  { value: 'embotelladora-oriente', label: 'Embotelladora del Oriente' },
  { value: 'vital', label: 'Vital S.A.' },
  { value: 'pil', label: 'PIL Andina S.A.' },
  { value: 'ideal', label: 'Panadería Ideal' },
  { value: 'carolina', label: 'Industrias Carolina' },
  { value: 'fino', label: 'Aceites Fino Ltda.' },
  { value: 'guabira', label: 'Ingenio Guabirá' },
  { value: 'granja-local', label: 'Granja Local San Juan' },
  { value: 'ace', label: 'Productos Ace Bolivia' },
  { value: 'bolivar', label: 'Jabones Bolívar' },
  { value: 'cayambe', label: 'Molinos Cayambe' },
  { value: 'gloria', label: 'Gloria S.A.' },
  { value: 'pacena', label: 'Cervecería Paceña' },
  { value: 'ceibo', label: 'El Ceibo Ltda.' },
];

const productData: ProductItem[] = [
  {
    id: 1,
    product: 'CocaCola 2L',
    supplier: 'Embotelladora Boliviana S.A.',
    currentStock: 15,
    minStock: 20,
    maxStock: 100,
    status: 'Critico',
  },
  {
    id: 2,
    product: 'Pepsi 2L',
    supplier: 'Embotelladora del Oriente',
    currentStock: 8,
    minStock: 15,
    maxStock: 80,
    status: 'Critico',
  },
  {
    id: 3,
    product: 'Agua Vital 2L sin Gas',
    supplier: 'Vital S.A.',
    currentStock: 45,
    minStock: 30,
    maxStock: 150,
    status: 'Normal',
  },
  {
    id: 4,
    product: 'Leche Pil Entera 1L',
    supplier: 'PIL Andina S.A.',
    currentStock: 25,
    minStock: 20,
    maxStock: 100,
    status: 'Normal',
  },
  {
    id: 5,
    product: 'Pan Blanco Grande',
    supplier: 'Panadería Ideal',
    currentStock: 12,
    minStock: 25,
    maxStock: 80,
    status: 'Critico',
  },
  {
    id: 6,
    product: 'Arroz Carolina Extra 1kg',
    supplier: 'Industrias Carolina',
    currentStock: 60,
    minStock: 40,
    maxStock: 200,
    status: 'Normal',
  },
  {
    id: 7,
    product: 'Aceite Fino 1L',
    supplier: 'Aceites Fino Ltda.',
    currentStock: 18,
    minStock: 15,
    maxStock: 75,
    status: 'Normal',
  },
  {
    id: 8,
    product: 'Azúcar Blanca Guabirá 1kg',
    supplier: 'Ingenio Guabirá',
    currentStock: 5,
    minStock: 20,
    maxStock: 100,
    status: 'Critico',
  },
  {
    id: 9,
    product: 'Huevos Frescos Docena',
    supplier: 'Granja Local San Juan',
    currentStock: 35,
    minStock: 25,
    maxStock: 120,
    status: 'Normal',
  },
  {
    id: 10,
    product: 'Detergente Ace Polvo 1kg',
    supplier: 'Productos Ace Bolivia',
    currentStock: 22,
    minStock: 15,
    maxStock: 60,
    status: 'Normal',
  },
  {
    id: 11,
    product: 'Jabón Bolivar Multiuso',
    supplier: 'Jabones Bolívar',
    currentStock: 8,
    minStock: 12,
    maxStock: 50,
    status: 'Critico',
  },
  {
    id: 12,
    product: 'Fideos Cayambe 500g',
    supplier: 'Molinos Cayambe',
    currentStock: 40,
    minStock: 30,
    maxStock: 150,
    status: 'Normal',
  },
  {
    id: 13,
    product: 'Yogurt Gloria Natural 1L',
    supplier: 'Gloria S.A.',
    currentStock: 28,
    minStock: 20,
    maxStock: 90,
    status: 'Normal',
  },
  {
    id: 14,
    product: 'Cerveza Paceña 620ml',
    supplier: 'Cervecería Paceña',
    currentStock: 6,
    minStock: 24,
    maxStock: 120,
    status: 'Critico',
  },
  {
    id: 15,
    product: 'Queso Fresco El Ceibo 500g',
    supplier: 'El Ceibo Ltda.',
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
  const [products, setProducts] = useState(productData);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [editForm, setEditForm] = useState({
    product: '',
    supplier: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    product: '',
    supplier: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
  });

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyProduct, setBuyProduct] = useState<ProductItem | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<ProductItem | null>(null);

  const filteredData = products.filter(
    (item) =>
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, endIndex);

  const generateNewId = () => {
    return Math.max(...products.map((p) => p.id)) + 1;
  };

  const getSupplierLabel = (value: string) => {
    const supplier = supplierOptions.find((option) => option.value === value);
    return supplier ? supplier.label : value;
  };

  const handleAddProduct = () => {
    setAddForm({
      product: '',
      supplier: '',
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
    });
    setShowAddModal(true);
  };

  const handleSaveAdd = () => {
    if (addForm.product.trim() && addForm.supplier) {
      const newProduct: ProductItem = {
        id: generateNewId(),
        product: addForm.product,
        supplier: getSupplierLabel(addForm.supplier),
        currentStock: addForm.currentStock,
        minStock: addForm.minStock,
        maxStock: addForm.maxStock,
        status: addForm.currentStock < addForm.minStock ? 'Critico' : 'Normal',
      };
      setProducts([...products, newProduct]);
      setShowAddModal(false);
    }
  };

  const handleEditProduct = (product: ProductItem) => {
    setSelectedProduct(product);
    const supplierValue =
      supplierOptions.find((option) => option.label === product.supplier)?.value || '';
    setEditForm({
      product: product.product,
      supplier: supplierValue,
      currentStock: product.currentStock,
      minStock: product.minStock,
      maxStock: product.maxStock,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (selectedProduct && editForm.product.trim() && editForm.supplier) {
      const updatedProducts = products.map((product) => {
        if (product.id === selectedProduct.id) {
          const updatedProduct = {
            ...product,
            product: editForm.product,
            supplier: getSupplierLabel(editForm.supplier),
            currentStock: editForm.currentStock,
            minStock: editForm.minStock,
            maxStock: editForm.maxStock,
            status: (editForm.currentStock < editForm.minStock
              ? 'Critico'
              : 'Normal') as ProductStatus,
          };
          return updatedProduct;
        }
        return product;
      });
      setProducts(updatedProducts);
      setShowEditModal(false);
      setSelectedProduct(null);
    }
  };

  const handleDeleteClick = () => {
    if (selectedProduct) {
      setDeleteProduct(selectedProduct);
      setShowDeleteModal(true);
      setShowEditModal(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteProduct) {
      const updatedProducts = products.filter((product) => product.id !== deleteProduct.id);
      setProducts(updatedProducts);
      setShowDeleteModal(false);
      setDeleteProduct(null);
      setSelectedProduct(null);
    }
  };

  const handleBuyProduct = (product: ProductItem) => {
    setBuyProduct(product);
    setShowBuyModal(true);
  };

  const handleConfirmBuy = () => {
    if (buyProduct) {
      const updatedProducts = products.map((product) => {
        if (product.id === buyProduct.id) {
          const newStock = product.currentStock + 50;
          return {
            ...product,
            currentStock: newStock,
            status: (newStock < product.minStock ? 'Critico' : 'Normal') as ProductStatus,
          };
        }
        return product;
      });
      setProducts(updatedProducts);
      setShowBuyModal(false);
      setBuyProduct(null);
    }
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
      render: (value: string, row: ProductItem) => (
        <div className='productCell'>
          <div className='productName'>{value}</div>
          <div className='productSupplier'>{row.supplier}</div>
        </div>
      ),
    },
    {
      key: 'currentStock',
      header: 'Stock Actual',
      width: '12%',
      className: 'text-center',
    },
    {
      key: 'minStock',
      header: 'Stock Mínimo',
      width: '12%',
      className: 'text-center',
    },
    {
      key: 'maxStock',
      header: 'Stock Máximo',
      width: '12%',
      className: 'text-center',
    },
    {
      key: 'status',
      header: 'Estado',
      width: '15%',
      className: 'text-center',
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
    <div className='provisioning-page'>
      <div className='provisioning-header'>
        <div className='provisioningTitleSection'>
          <TitleDescription
            title={pageInfo.title}
            description={pageInfo.description}
            titleSize={32}
            descriptionSize={16}
          />
          <Button
            variant='primary'
            onClick={handleAddProduct}
            icon={<IoAdd />}
            className='addProductButton'
          >
            Agregar Producto
          </Button>
        </div>
        <div className='provisioning-search'>
          <Input
            placeholder='Buscar productos o proveedores...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<IoSearch color='var(--pri-500)' />}
            className='search-input'
          />
        </div>
      </div>

      <div className='provisioning-table'>
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

      {(showEditModal || showAddModal) && (
        <div className='modalOverlay'>
          <div className='editModal'>
            <div className='editModalHeader'>
              <h3>{showEditModal ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h3>
              <button
                className='editModalClose'
                onClick={() => {
                  setShowEditModal(false);
                  setShowAddModal(false);
                  setSelectedProduct(null);
                }}
                type='button'
              >
                <IoClose size={20} />
              </button>
            </div>
            <div className='editModalBody'>
              <div className='editModalField'>
                <label>Nombre del Producto:</label>
                <Input
                  type='text'
                  value={showEditModal ? editForm.product : addForm.product}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (showEditModal) {
                      setEditForm({ ...editForm, product: value });
                    } else {
                      setAddForm({ ...addForm, product: value });
                    }
                  }}
                  placeholder='Ingrese el nombre del producto'
                  className='editModalInput'
                />
              </div>
              <div className='editModalField'>
                <label>Proveedor:</label>
                <Select
                  value={showEditModal ? editForm.supplier : addForm.supplier}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (showEditModal) {
                      setEditForm({ ...editForm, supplier: value });
                    } else {
                      setAddForm({ ...addForm, supplier: value });
                    }
                  }}
                  options={supplierOptions}
                  placeholder='Seleccionar proveedor'
                  className='editModalInput'
                />
              </div>
              <div className='editModalField'>
                <label>Stock Actual:</label>
                <Input
                  type='number'
                  value={
                    showEditModal
                      ? editForm.currentStock.toString()
                      : addForm.currentStock.toString()
                  }
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (showEditModal) {
                      setEditForm({ ...editForm, currentStock: value });
                    } else {
                      setAddForm({ ...addForm, currentStock: value });
                    }
                  }}
                  className='editModalInput'
                />
              </div>
              <div className='editModalField'>
                <label>Stock Mínimo:</label>
                <Input
                  type='number'
                  value={showEditModal ? editForm.minStock.toString() : addForm.minStock.toString()}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (showEditModal) {
                      setEditForm({ ...editForm, minStock: value });
                    } else {
                      setAddForm({ ...addForm, minStock: value });
                    }
                  }}
                  className='editModalInput'
                />
              </div>
              <div className='editModalField'>
                <label>Stock Máximo:</label>
                <Input
                  type='number'
                  value={showEditModal ? editForm.maxStock.toString() : addForm.maxStock.toString()}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (showEditModal) {
                      setEditForm({ ...editForm, maxStock: value });
                    } else {
                      setAddForm({ ...addForm, maxStock: value });
                    }
                  }}
                  className='editModalInput'
                />
              </div>
            </div>
            <div className='editModalFooter'>
              {showEditModal && (
                <Button
                  variant='accent'
                  onClick={handleDeleteClick}
                  icon={<IoTrash />}
                  className='deleteButton'
                >
                  Eliminar
                </Button>
              )}
              <div className='editModalMainButtons'>
                <Button
                  variant='secondary'
                  onClick={() => {
                    setShowEditModal(false);
                    setShowAddModal(false);
                    setSelectedProduct(null);
                  }}
                  className='editModalButton'
                >
                  Cancelar
                </Button>
                <Button
                  variant='primary'
                  onClick={showEditModal ? handleSaveEdit : handleSaveAdd}
                  className='editModalButton'
                >
                  {showEditModal ? 'Guardar' : 'Agregar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        title='Confirmar Compra'
        message={`¿Está seguro que desea comprar más stock de "${buyProduct?.product}"? Se agregarán 50 unidades al inventario.`}
        modalType='warning'
        showCancelButton={true}
        confirmButtonText='Confirmar Compra'
        cancelButtonText='Cancelar'
        onConfirm={handleConfirmBuy}
        onCancel={() => setShowBuyModal(false)}
      />

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title='Eliminar Producto'
        message={`¿Está seguro que desea eliminar el producto "${deleteProduct?.product}"? Esta acción no se puede deshacer.`}
        modalType='error'
        showCancelButton={true}
        confirmButtonText='Eliminar'
        cancelButtonText='Cancelar'
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

export default ProvisioningPage;

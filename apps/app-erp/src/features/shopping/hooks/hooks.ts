import { useState, useMemo, useEffect } from 'react';
import {
  providersApi,
  productsApi,
  purchaseOrdersApi,
  receptionsApi,
  contractsApi,
} from '../services/shoppingApi';

// Tipos
export interface Provider {
  id: number;
  title: string;
  description: string;
  nit: string;
  contact: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface HistoryItem {
  id: number;
  date: string;
  type: 'purchase' | 'order' | 'payment';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface ProductItem {
  id: number;
  product: string;
  supplierId: number;
  supplierName: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  status: 'Normal' | 'Critico';
}

export interface ShoppingModule {
  id: number;
  title: string;
  description: string;
  type: string;
  icon: 'store' | 'people' | 'doc' | 'download' | 'tag' | 'contract' | 'analytics';
  route: string;
  isActive: boolean;
  priority: 'high' | 'medium' | 'low';
}

// Constantes
const ITEMS_PER_PAGE = 10;
const HISTORY_ITEMS_PER_PAGE = 5;

// Utilidades privadas
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-BO');
};

const sanitizeNumericInput = (value: string, maxLength: number): string => {
  return value.replace(/[^0-9]/g, '').slice(0, maxLength);
};

const sanitizeEmailInput = (value: string): string => {
  return value.toLowerCase().trim();
};

// Hook para tabla de proveedores
export const useProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Cargar proveedores desde la API
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const data = await providersApi.getAll();
        setProviders(data);
      } catch (error) {
        console.error('Error loading providers:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProviders();
  }, []);

  // Filtrado de proveedores
  const filteredProviders = useMemo(() => {
    return providers.filter(
      (provider) =>
        provider.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.nit.includes(searchTerm)
    );
  }, [providers, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredProviders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProviders = filteredProviders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const addProvider = async (newProvider: Omit<Provider, 'id'>): Promise<void> => {
    try {
      const createdProvider = await providersApi.create(newProvider);
      setProviders((prev) => [...prev, createdProvider]);
    } catch (error) {
      console.error('Error creating provider:', error);
      throw error;
    }
  };

  const validateProvider = (provider: Omit<Provider, 'id'>): string | null => {
    if (!provider.title.trim()) return 'El nombre de la empresa es obligatorio';
    if (!provider.nit.trim()) return 'El NIT es obligatorio';
    if (provider.nit.length < 7) return 'El NIT debe tener al menos 7 dígitos';
    if (!provider.contact.trim()) return 'La persona de contacto es obligatoria';
    if (provider.phone && provider.phone.length < 7)
      return 'El teléfono debe tener al menos 7 dígitos';
    if (provider.email && !validateEmail(provider.email))
      return 'Por favor ingrese un email válido';
    return null;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  return {
    providers,
    currentProviders,
    filteredProviders,
    searchTerm,
    currentPage,
    totalPages,
    loading,
    addProvider,
    validateProvider,
    handleSearchChange,
    handlePageChange,
    ITEMS_PER_PAGE,
  };
};

// Hook para productos de provisioning
export const useProducts = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Cargar productos y proveedores desde la API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, providersData] = await Promise.all([
          productsApi.getAll(),
          providersApi.getAll(),
        ]);

        // Mapear productos de API a formato ProductItem
        const mappedProducts: ProductItem[] = productsData.map((p) => ({
          id: p.id,
          product: p.name,
          supplierId: p.supplier_id || 0,
          supplierName: p.supplier_name || '',
          currentStock: p.current_stock,
          minStock: p.min_stock,
          maxStock: p.max_stock,
          status: p.current_stock < p.min_stock ? 'Critico' : 'Normal',
        }));

        setProducts(mappedProducts);
        setProviders(providersData);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtrado de productos
  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Obtener opciones de proveedores para select
  const getSupplierOptions = () => {
    return providers.map((provider) => ({
      value: provider.id.toString(),
      label: provider.title,
    }));
  };

  const getSupplierName = (supplierId: number): string => {
    const supplier = providers.find((p) => p.id === supplierId);
    return supplier ? supplier.title : 'Proveedor desconocido';
  };

  const addProduct = async (newProduct: {
    product: string;
    supplierId: number;
    currentStock: number;
    minStock: number;
    maxStock: number;
  }): Promise<void> => {
    try {
      const productData = {
        name: newProduct.product,
        supplier_id: newProduct.supplierId,
        supplier_name: getSupplierName(newProduct.supplierId),
        current_stock: newProduct.currentStock,
        min_stock: newProduct.minStock,
        max_stock: newProduct.maxStock,
        status: newProduct.currentStock < newProduct.minStock ? 'Critico' : 'Normal',
      };

      const created = await productsApi.create(productData);

      const mappedProduct: ProductItem = {
        id: created.id,
        product: created.name,
        supplierId: created.supplier_id || 0,
        supplierName: created.supplier_name || '',
        currentStock: created.current_stock,
        minStock: created.min_stock,
        maxStock: created.max_stock,
        status: created.current_stock < created.min_stock ? 'Critico' : 'Normal',
      };

      setProducts((prev) => [...prev, mappedProduct]);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  const updateProduct = async (
    productId: number,
    updates: {
      product: string;
      supplierId: number;
      currentStock: number;
      minStock: number;
      maxStock: number;
    }
  ): Promise<void> => {
    try {
      const productData = {
        name: updates.product,
        supplier_id: updates.supplierId,
        supplier_name: getSupplierName(updates.supplierId),
        current_stock: updates.currentStock,
        min_stock: updates.minStock,
        max_stock: updates.maxStock,
        status: updates.currentStock < updates.minStock ? 'Critico' : 'Normal',
      };

      await productsApi.update(productId, productData);

      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? {
                ...product,
                ...updates,
                supplierName: getSupplierName(updates.supplierId),
                status: updates.currentStock < updates.minStock ? 'Critico' : 'Normal',
              }
            : product
        )
      );
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId: number): Promise<void> => {
    try {
      await productsApi.delete(productId);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const buyProduct = (productId: number, quantity: number = 50): void => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              currentStock: product.currentStock + quantity,
              status: product.currentStock + quantity < product.minStock ? 'Critico' : 'Normal',
            }
          : product
      )
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  return {
    products,
    currentProducts,
    filteredProducts,
    searchTerm,
    currentPage,
    totalPages,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    buyProduct,
    getSupplierOptions,
    getSupplierName,
    handleSearchChange,
    handlePageChange,
    ITEMS_PER_PAGE,
  };
};

// Hook para módulos de shopping - mantenemos datos estáticos ya que no están en BD
export const useShoppingModules = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, providersData, contractsData] = await Promise.all([
          productsApi.getAll(),
          providersApi.getAll(),
          contractsApi.getAll(),
        ]);
        setProducts(
          productsData.map((p) => ({
            id: p.id,
            product: p.name,
            supplierId: p.supplier_id || 0,
            supplierName: p.supplier_name || '',
            currentStock: p.current_stock,
            minStock: p.min_stock,
            maxStock: p.max_stock,
            status: p.current_stock < p.min_stock ? ('Critico' as const) : ('Normal' as const),
          }))
        );
        setProviders(providersData);
        setContracts(contractsData);
      } catch (error) {
        console.error('Error loading shopping modules data:', error);
      }
    };
    loadData();
  }, []);

  // Módulos estáticos
  const modules: ShoppingModule[] = [
    {
      id: 1,
      title: 'Provisionamiento',
      description: 'Define umbrales de stock para reabastecimiento automático',
      type: 'Productos',
      icon: 'store',
      route: 'provisioning',
      isActive: true,
      priority: 'high',
    },
    {
      id: 2,
      title: 'Proveedores',
      description: 'Administra tus proveedores y evalúa su desempeño',
      type: 'Proveedores',
      icon: 'people',
      route: 'providers',
      isActive: true,
      priority: 'medium',
    },
    {
      id: 3,
      title: 'Órdenes de Compra',
      description: 'Gestiona tus órdenes de compra y recepciones',
      type: 'Órdenes',
      icon: 'doc',
      route: 'purchase-orders',
      isActive: true,
      priority: 'medium',
    },
    {
      id: 4,
      title: 'Recepciones',
      description: 'Registra recepciones de mercadería y gestiona devoluciones',
      type: 'Recepciones',
      icon: 'download',
      route: 'receptions',
      isActive: true,
      priority: 'medium',
    },
    {
      id: 5,
      title: 'Cotizaciones',
      description: 'Compara precios entre proveedores para mejores decisiones',
      type: 'Cotizaciones',
      icon: 'tag',
      route: 'quotes',
      isActive: true,
      priority: 'medium',
    },
    {
      id: 6,
      title: 'Contratos',
      description: 'Administra contratos comerciales con proveedores',
      type: 'Contratos',
      icon: 'contract',
      route: 'contracts',
      isActive: true,
      priority: 'medium',
    },
    {
      id: 7,
      title: 'Reportes',
      description: 'Dashboard ejecutivo y reportes operativos de compras',
      type: 'Compras',
      icon: 'analytics',
      route: 'reports',
      isActive: true,
      priority: 'high',
    },
  ];

  // Filtrado de módulos
  const filteredModules = useMemo(() => {
    return modules.filter(
      (module) =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Calcular cantidades dinámicas basadas en datos reales
  const getModuleQuantity = (moduleId: number): number => {
    switch (moduleId) {
      case 1: // Provisionamiento
        return products.length;
      case 2: // Proveedores
        return providers.length;
      case 3: // Órdenes de Compra
        return 2;
      case 4: // Recepciones
        return 0;
      case 5: // Cotizaciones
        return 12;
      case 6: // Contratos
        return contracts.length;
      case 7: // Reportes
        return providers.length + products.length;
      default:
        return 0;
    }
  };

  // Determinar status basado en prioridad y estado activo
  const getModuleStatus = (module: ShoppingModule): 'Normal' | 'Revisar' => {
    if (!module.isActive && module.priority === 'medium') return 'Revisar';
    if (module.priority === 'high' && module.isActive) return 'Normal';
    return 'Normal';
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  return {
    modules: filteredModules,
    searchTerm,
    getModuleQuantity,
    getModuleStatus,
    handleSearchChange,
  };
};

// Hook para tabla de historial
export const useHistory = () => {
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar historial cuando se selecciona un proveedor
  useEffect(() => {
    if (!selectedProviderId) {
      setHistoryData([]);
      return;
    }

    const loadHistory = async () => {
      setLoading(true);
      try {
        const orders = await providersApi.getHistory(selectedProviderId).map((order) => ({
          id: order.id,
          date: order.date,
          type: 'order' as const,
          description: `Orden ${order.order_number} - ${order.total_items} items`,
          amount: parseFloat(order.total_amount.toString()),
          status:
            order.status === 'pending' || order.status === 'Pendiente'
              ? ('pending' as const)
              : ('completed' as const),
        }));
        setHistoryData(providerOrders);
      } catch (error) {
        console.error('Error loading provider history:', error);
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [selectedProviderId]);

  // Filtrado de historial
  const filteredHistory = useMemo(() => {
    return historyData.filter(
      (item) =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [historyData, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredHistory.length / HISTORY_ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * HISTORY_ITEMS_PER_PAGE;
  const currentHistoryItems = filteredHistory.slice(
    startIndex,
    startIndex + HISTORY_ITEMS_PER_PAGE
  );

  // Calcular total de compras completadas
  const getTotalAmount = (): number => {
    return filteredHistory
      .filter((item) => item.status === 'completed')
      .reduce((total, item) => total + item.amount, 0);
  };

  // Utilidades para mostrar datos
  const getStatusColor = (status: HistoryItem['status']) => {
    const statusColors = {
      completed: { bg: 'var(--sec-100)', text: 'var(--sec-800)' },
      pending: { bg: 'var(--warning-100)', text: 'var(--warning-800)' },
      cancelled: { bg: 'var(--acc-100)', text: 'var(--acc-800)' },
    };
    return statusColors[status] || { bg: 'var(--pri-100)', text: 'var(--pri-800)' };
  };

  const getTypeIcon = (type: HistoryItem['type']): string => {
    const typeIcons = {
      purchase: '🛒',
      order: '📋',
      payment: '💰',
    };
    return typeIcons[type] || '📄';
  };

  const getStatusText = (status: HistoryItem['status']): string => {
    const statusTexts = {
      completed: 'Completado',
      pending: 'Pendiente',
      cancelled: 'Cancelado',
    };
    return statusTexts[status] || status;
  };

  const selectProvider = (providerId: number): void => {
    setSelectedProviderId(providerId);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const clearSelection = (): void => {
    setSelectedProviderId(null);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  return {
    selectedProviderId,
    historyData: filteredHistory,
    currentHistoryItems,
    searchTerm,
    currentPage,
    totalPages,
    loading,
    getTotalAmount,
    getStatusColor,
    getTypeIcon,
    getStatusText,
    selectProvider,
    clearSelection,
    handleSearchChange,
    handlePageChange,
    formatCurrency,
    formatDate,
    HISTORY_ITEMS_PER_PAGE,
  };
};

// Hook para manejo de modales
export const useModal = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  return {
    showAddModal,
    showHistoryModal,
    openAddModal: () => setShowAddModal(true),
    closeAddModal: () => setShowAddModal(false),
    openHistoryModal: () => setShowHistoryModal(true),
    closeHistoryModal: () => setShowHistoryModal(false),
  };
};

// Hook para formulario de agregar proveedor
export const useProviderForm = () => {
  const initialForm = {
    title: '',
    description: '',
    nit: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
  };

  const [form, setForm] = useState(initialForm);

  const updateField = (field: keyof typeof form, value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = (): void => {
    setForm(initialForm);
  };

  const handleFormInputChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      switch (field) {
        case 'nit':
          value = sanitizeNumericInput(value, 13);
          break;
        case 'phone':
          value = sanitizeNumericInput(value, 8);
          break;
        case 'email':
          value = sanitizeEmailInput(value);
          break;
        default:
          value = field === 'title' || field === 'contact' ? value.trim() : value;
      }

      updateField(field, value);
    };

  return {
    form,
    updateField,
    resetForm,
    handleFormInputChange,
  };
};

// Hook para formulario de productos
export const useProductForm = () => {
  const initialForm = {
    product: '',
    supplierId: 0,
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
  };

  const [form, setForm] = useState(initialForm);

  const updateField = (field: keyof typeof form, value: string | number): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = (): void => {
    setForm(initialForm);
  };

  const loadProduct = (product: ProductItem): void => {
    setForm({
      product: product.product,
      supplierId: product.supplierId,
      currentStock: product.currentStock,
      minStock: product.minStock,
      maxStock: product.maxStock,
    });
  };

  const validateProduct = (): string | null => {
    if (!form.product.trim()) return 'El nombre del producto es obligatorio';
    if (!form.supplierId) return 'Debe seleccionar un proveedor';
    if (form.minStock < 0) return 'El stock mínimo no puede ser negativo';
    if (form.maxStock < form.minStock) return 'El stock máximo debe ser mayor al mínimo';
    if (form.currentStock < 0) return 'El stock actual no puede ser negativo';
    return null;
  };

  return {
    form,
    updateField,
    resetForm,
    loadProduct,
    validateProduct,
  };
};

// Tipos para Purchase Orders
export interface PurchaseOrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: number;
  orderNumber: string;
  date: string;
  supplierId: number;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalItems: number;
  totalAmount: number;
  status: 'Pendiente' | 'Recibido';
  createdBy: string;
  notes?: string;
  receivedDate?: string;
  receivedBy?: string;
}

// Hook para Purchase Orders
export const usePurchaseOrders = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Cargar órdenes y proveedores desde la API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [ordersData, providersData] = await Promise.all([
          purchaseOrdersApi.getAll(),
          providersApi.getAll(),
        ]);

        // Mapear órdenes de API a formato PurchaseOrder
        const mappedOrders: PurchaseOrder[] = ordersData.map((o) => ({
          id: o.id,
          orderNumber: o.order_number,
          date: o.date,
          supplierId: o.supplier_id,
          supplierName: o.supplier_name,
          items: o.items.map((item) => ({
            id: item.product_id,
            productName: item.product_name,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            total: item.total,
          })),
          totalItems: o.total_items,
          totalAmount: o.total_amount,
          status: o.status === 'pending' ? 'Pendiente' : 'Recibido',
          createdBy: 'Admin',
          notes: o.notes,
        }));

        setOrders(mappedOrders);
        setProviders(providersData);
      } catch (error) {
        console.error('Error loading purchase orders:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtrado de órdenes
  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const generateOrderNumber = (): string => {
    const maxNumber = Math.max(
      ...orders.map((o) => parseInt(o.orderNumber.replace(/\D/g, '')) || 0),
      0
    );
    return `PO-2024-${String(maxNumber + 1).padStart(3, '0')}`;
  };

  // Obtener opciones de proveedores
  const getSupplierOptions = () => {
    return providers.map((provider) => ({
      value: provider.id.toString(),
      label: provider.title,
    }));
  };

  const getSupplierName = (supplierId: number): string => {
    const supplier = providers.find((p) => p.id === supplierId);
    return supplier ? supplier.title : 'Proveedor desconocido';
  };

  // Agregar nueva orden
  const addOrder = async (newOrderData: {
    supplierId: number;
    items: Omit<PurchaseOrderItem, 'id'>[];
    notes?: string;
  }): Promise<void> => {
    try {
      const orderData = {
        order_number: generateOrderNumber(),
        date: new Date().toISOString().split('T')[0],
        supplier_id: newOrderData.supplierId,
        supplier_name: getSupplierName(newOrderData.supplierId),
        items: newOrderData.items.map((item) => ({
          product_id: 1, // TODO: obtener del producto real
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total: item.total,
        })),
        status: 'pending',
        notes: newOrderData.notes || '',
        total_items: newOrderData.items.length,
        total_amount: newOrderData.items.reduce((sum, item) => sum + item.total, 0),
      };

      const created = await purchaseOrdersApi.create(orderData);

      const mappedOrder: PurchaseOrder = {
        id: created.id,
        orderNumber: created.order_number,
        date: created.date,
        supplierId: created.supplier_id,
        supplierName: created.supplier_name,
        items: created.items.map((item) => ({
          id: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          total: item.total,
        })),
        totalItems: created.total_items,
        totalAmount: created.total_amount,
        status: 'Pendiente',
        createdBy: 'Admin',
        notes: created.notes,
      };

      setOrders((prev) => [mappedOrder, ...prev]);
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
  };

  // Recibir orden (cambiar estado)
  const receiveOrder = async (orderId: number): Promise<void> => {
    try {
      await purchaseOrdersApi.update(orderId, { status: 'received' });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: 'Recibido' as const,
                receivedDate: new Date().toISOString().split('T')[0],
                receivedBy: 'Admin',
              }
            : order
        )
      );
    } catch (error) {
      console.error('Error receiving order:', error);
      throw error;
    }
  };

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  return {
    orders,
    currentOrders,
    filteredOrders,
    searchTerm,
    currentPage,
    totalPages,
    loading,
    addOrder,
    receiveOrder,
    getSupplierOptions,
    getSupplierName,
    generateOrderNumber,
    handleSearchChange,
    handlePageChange,
    formatCurrency,
    formatDate,
    ITEMS_PER_PAGE,
  };
};

// Hook para formulario de nueva orden
export const usePurchaseOrderForm = () => {
  const initialFormState = {
    supplierId: 0,
    notes: '',
    items: [] as Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>,
  };

  const [form, setForm] = useState(initialFormState);
  const [currentItem, setCurrentItem] = useState({
    productName: '',
    quantity: 1,
    unitPrice: 0,
  });

  const updateField = (field: keyof typeof form, value: any): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateCurrentItem = (field: keyof typeof currentItem, value: any): void => {
    setCurrentItem((prev) => ({ ...prev, [field]: value }));
  };

  const addItem = (): void => {
    if (!currentItem.productName || currentItem.quantity <= 0 || currentItem.unitPrice <= 0) {
      return;
    }

    const total = currentItem.quantity * currentItem.unitPrice;
    const newItem = {
      productName: currentItem.productName,
      quantity: currentItem.quantity,
      unitPrice: currentItem.unitPrice,
      total,
    };

    setForm((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    setCurrentItem({
      productName: '',
      quantity: 1,
      unitPrice: 0,
    });
  };

  const removeItem = (index: number): void => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const getTotalAmount = (): number => {
    return form.items.reduce((sum, item) => sum + item.total, 0);
  };

  const resetForm = (): void => {
    setForm(initialFormState);
    setCurrentItem({
      productName: '',
      quantity: 1,
      unitPrice: 0,
    });
  };

  const validateForm = (): string | null => {
    if (!form.supplierId) return 'Debe seleccionar un proveedor';
    if (form.items.length === 0) return 'Debe agregar al menos un producto';
    return null;
  };

  return {
    form,
    currentItem,
    updateField,
    updateCurrentItem,
    addItem,
    removeItem,
    getTotalAmount,
    resetForm,
    validateForm,
  };
};

// Hook para modales de Purchase Orders
export const usePurchaseOrderModals = () => {
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showViewOrderModal, setShowViewOrderModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  const openNewOrderModal = () => setShowNewOrderModal(true);
  const closeNewOrderModal = () => setShowNewOrderModal(false);

  const openViewOrderModal = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setShowViewOrderModal(true);
  };
  const closeViewOrderModal = () => {
    setShowViewOrderModal(false);
    setSelectedOrder(null);
  };

  const openReceiveModal = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setShowReceiveModal(true);
  };
  const closeReceiveModal = () => {
    setShowReceiveModal(false);
    setSelectedOrder(null);
  };

  return {
    showNewOrderModal,
    showViewOrderModal,
    showReceiveModal,
    selectedOrder,
    openNewOrderModal,
    closeNewOrderModal,
    openViewOrderModal,
    closeViewOrderModal,
    openReceiveModal,
    closeReceiveModal,
  };
};

// Los demás hooks (recepciones, contratos, reportes) se mantienen igual por ahora
// ya que son más complejos y requieren más análisis

// Interfaces para recepciones
export interface Reception {
  id: number;
  purchaseOrderId: number;
  orderNumber: string;
  supplierId: number;
  supplierName: string;
  date: string;
  items: ReceptionItem[];
  status: 'completed' | 'pending';
}

export interface ReceptionItem {
  productId: number;
  productName: string;
  quantity: number;
  lotNumber: string;
  expiryDate: string;
}

export interface Return {
  id: number;
  productId: number;
  productName: string;
  supplierId: number;
  supplierName: string;
  quantity: number;
  reason: string;
  reasonText: string;
  observations: string;
  date: string;
  status: 'completed' | 'pending';
}

export interface ReturnReason {
  value: string;
  label: string;
}

// Hook para recepciones
export const useReceptions = () => {
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [returns, setReturns] = useState<Return[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const receptionsData = await receptionsApi.getAll();

        const mappedReceptions: Reception[] = receptionsData.map((r) => ({
          id: r.id,
          purchaseOrderId: 0, // TODO
          orderNumber: r.order_number || '',
          supplierId: r.supplier_id || 0,
          supplierName: r.supplier_name || '',
          date: r.date,
          items: r.items.map((item) => ({
            productId: item.product_id,
            productName: item.product_name,
            quantity: item.received_quantity,
            lotNumber: '',
            expiryDate: '',
          })),
          status: r.status as 'completed' | 'pending',
        }));

        setReceptions(mappedReceptions);
      } catch (error) {
        console.error('Error loading receptions:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getPurchaseOrderOptions = () => {
    return [{ value: '', label: 'Seleccionar orden...' }];
  };

  const getProductOptions = () => {
    return [{ value: '', label: 'Buscar producto...' }];
  };

  const getSupplierOptions = () => {
    return [{ value: '', label: 'Seleccionar proveedor...' }];
  };

  const getReturnReasonOptions = () => {
    const returnReasons: ReturnReason[] = [
      { value: 'damaged', label: 'Producto dañado' },
      { value: 'expired', label: 'Producto vencido' },
      { value: 'wrong_product', label: 'Producto incorrecto' },
      { value: 'wrong_quantity', label: 'Cantidad incorrecta' },
      { value: 'quality_issues', label: 'Problemas de calidad' },
      { value: 'not_ordered', label: 'No fue pedido' },
      { value: 'other', label: 'Otro motivo' },
    ];

    return [
      { value: '', label: 'Seleccionar motivo...' },
      ...returnReasons.map((reason) => ({
        value: reason.value,
        label: reason.label,
      })),
    ];
  };

  const addReception = async (receptionData: {
    purchaseOrderId: number;
    date: string;
    items: Omit<ReceptionItem, 'productName'>[];
  }): Promise<void> => {
    // TODO: implement
  };

  const addReturn = (returnData: {
    productId: number;
    supplierId: number;
    quantity: number;
    reason: string;
    observations: string;
  }): void => {
    // TODO: implement
  };

  const getMovementHistory = (): any[] => {
    return [];
  };

  const getMovementDetails = (movementId: string) => {
    return null;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  return {
    receptions,
    returns,
    searchTerm,
    currentPage,
    loading,
    getPurchaseOrderOptions,
    getProductOptions,
    getSupplierOptions,
    getReturnReasonOptions,
    addReception,
    addReturn,
    getMovementHistory,
    getMovementDetails,
    handleSearchChange,
    handlePageChange,
    formatDate,
    formatCurrency,
  };
};

// Tipos para Contracts
export interface Contract {
  id: number;
  title: string;
  description: string;
  supplierId: number;
  supplierName: string;
  type: string;
  status: 'active' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  terms: {
    discount?: string;
    paymentDays: number;
    fixedPrice?: string;
  };
  daysUntilExpiration: number;
  alertsEnabled: boolean;
  documentPath?: string;
  createdBy: string;
  createdDate: string;
  notes?: string;
}

export interface ContractType {
  value: string;
  label: string;
}

// Hook para Contracts
export const useContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [contractsData, providersData] = await Promise.all([
          contractsApi.getAll(),
          providersApi.getAll(),
        ]);

        // Mapear contratos de API a formato Contract
        const mappedContracts: Contract[] = contractsData.map((c) => {
          const daysUntilExpiration = Math.ceil(
            (new Date(c.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          return {
            id: c.id,
            title: c.contract_number,
            description: c.type,
            supplierId: c.provider_id,
            supplierName: c.provider_name,
            type: c.type,
            status: c.status as 'active' | 'expired' | 'pending',
            startDate: c.start_date,
            endDate: c.end_date,
            terms:
              typeof c.terms === 'string' ? JSON.parse(c.terms) : c.terms || { paymentDays: 30 },
            daysUntilExpiration,
            alertsEnabled: c.renewal_alert,
            documentPath: c.document_path,
            createdBy: 'Admin',
            createdDate: c.start_date,
            notes: '',
          };
        });

        setContracts(mappedContracts);
        setProviders(providersData);
      } catch (error) {
        console.error('Error loading contracts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtrado de contratos
  const filteredContracts = useMemo(() => {
    return contracts.filter(
      (contract) =>
        contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contracts, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredContracts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentContracts = filteredContracts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getSupplierOptions = () => {
    return providers.map((provider) => ({
      value: provider.id.toString(),
      label: provider.title,
    }));
  };

  const getContractTypeOptions = () => {
    const contractTypes: ContractType[] = [
      { value: 'supply', label: 'Suministro' },
      { value: 'fixed_price', label: 'Precio Fijo' },
      { value: 'framework', label: 'Marco' },
    ];
    return contractTypes;
  };

  const getSupplierName = (supplierId: number): string => {
    const supplier = providers.find((p) => p.id === supplierId);
    return supplier ? supplier.title : 'Proveedor desconocido';
  };

  const calculateDaysUntilExpiration = (endDate: string): number => {
    const today = new Date();
    const expirationDate = new Date(endDate);
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const addContract = async (newContractData: {
    title: string;
    description: string;
    supplierId: number;
    type: string;
    startDate: string;
    endDate: string;
    terms: {
      discount?: string;
      paymentDays: number;
      fixedPrice?: string;
    };
    alertsEnabled: boolean;
    notes?: string;
  }): Promise<void> => {
    try {
      const contractData = {
        contract_number: `CONT-${Date.now()}`,
        provider_id: newContractData.supplierId,
        provider_name: getSupplierName(newContractData.supplierId),
        type: newContractData.type,
        start_date: newContractData.startDate,
        end_date: newContractData.endDate,
        amount: 0,
        status: 'active',
        terms: JSON.stringify(newContractData.terms),
        document_path: '',
        renewal_alert: newContractData.alertsEnabled,
      };

      const created = await contractsApi.create(contractData);

      const mappedContract: Contract = {
        id: created.id,
        title: created.contract_number,
        description: created.type,
        supplierId: created.provider_id,
        supplierName: created.provider_name,
        type: created.type,
        status: created.status as 'active' | 'expired' | 'pending',
        startDate: created.start_date,
        endDate: created.end_date,
        terms: typeof created.terms === 'string' ? JSON.parse(created.terms) : created.terms,
        daysUntilExpiration: calculateDaysUntilExpiration(created.end_date),
        alertsEnabled: created.renewal_alert,
        documentPath: created.document_path,
        createdBy: 'Admin',
        createdDate: created.start_date,
        notes: newContractData.notes || '',
      };

      setContracts((prev) => [mappedContract, ...prev]);
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  };

  const renewContract = async (contractId: number, newEndDate: string): Promise<void> => {
    try {
      const contract = contracts.find((c) => c.id === contractId);
      if (!contract) return;

      await contractsApi.update(contractId, {
        end_date: newEndDate,
        status: 'active',
      });

      setContracts((prev) =>
        prev.map((contract) =>
          contract.id === contractId
            ? {
                ...contract,
                endDate: newEndDate,
                status: 'active' as const,
                daysUntilExpiration: calculateDaysUntilExpiration(newEndDate),
              }
            : contract
        )
      );
    } catch (error) {
      console.error('Error renewing contract:', error);
      throw error;
    }
  };

  const getContractsByStatus = (status: Contract['status']) => {
    return contracts.filter((contract) => contract.status === status);
  };

  const getExpiringContracts = () => {
    return contracts.filter(
      (contract) =>
        contract.status === 'active' &&
        contract.daysUntilExpiration <= 30 &&
        contract.daysUntilExpiration > 0
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  return {
    contracts,
    currentContracts,
    filteredContracts,
    searchTerm,
    currentPage,
    totalPages,
    loading,
    addContract,
    renewContract,
    getContractsByStatus,
    getExpiringContracts,
    getSupplierOptions,
    getContractTypeOptions,
    getSupplierName,
    calculateDaysUntilExpiration,
    handleSearchChange,
    handlePageChange,
    formatCurrency,
    formatDate,
    ITEMS_PER_PAGE,
  };
};

// Hook para formulario de nuevo contrato
export const useContractForm = () => {
  const initialFormState = {
    title: '',
    description: '',
    supplierId: 0,
    type: '',
    startDate: '',
    endDate: '',
    terms: {
      discount: '',
      paymentDays: 30,
      fixedPrice: '',
    },
    alertsEnabled: true,
    notes: '',
    documentFile: null as File | null,
  };

  const [form, setForm] = useState(initialFormState);

  const updateField = (field: keyof typeof form, value: any): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateTermsField = (field: keyof typeof form.terms, value: any): void => {
    setForm((prev) => ({
      ...prev,
      terms: { ...prev.terms, [field]: value },
    }));
  };

  const resetForm = (): void => {
    setForm(initialFormState);
  };

  const validateForm = (): string | null => {
    if (!form.title.trim()) return 'El título es obligatorio';
    if (!form.description.trim()) return 'La descripción es obligatoria';
    if (!form.supplierId) return 'Debe seleccionar un proveedor';
    if (!form.type) return 'Debe seleccionar un tipo de contrato';
    if (!form.startDate) return 'La fecha de inicio es obligatoria';
    if (!form.endDate) return 'La fecha de vencimiento es obligatoria';
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      return 'La fecha de vencimiento debe ser posterior a la fecha de inicio';
    }
    if (form.terms.paymentDays <= 0) return 'Los días de pago deben ser mayor a 0';
    return null;
  };

  return {
    form,
    updateField,
    updateTermsField,
    resetForm,
    validateForm,
  };
};

// Hook para modales de Contracts
export const useContractModals = () => {
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [showViewDocumentModal, setShowViewDocumentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const openNewContractModal = () => setShowNewContractModal(true);
  const closeNewContractModal = () => setShowNewContractModal(false);

  const openViewDocumentModal = (contract: Contract) => {
    setSelectedContract(contract);
    setShowViewDocumentModal(true);
  };
  const closeViewDocumentModal = () => {
    setShowViewDocumentModal(false);
    setSelectedContract(null);
  };

  const openHistoryModal = (contract: Contract) => {
    setSelectedContract(contract);
    setShowHistoryModal(true);
  };
  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedContract(null);
  };

  const openRenewModal = (contract: Contract) => {
    setSelectedContract(contract);
    setShowRenewModal(true);
  };
  const closeRenewModal = () => {
    setShowRenewModal(false);
    setSelectedContract(null);
  };

  return {
    showNewContractModal,
    showViewDocumentModal,
    showHistoryModal,
    showRenewModal,
    selectedContract,
    openNewContractModal,
    closeNewContractModal,
    openViewDocumentModal,
    closeViewDocumentModal,
    openHistoryModal,
    closeHistoryModal,
    openRenewModal,
    closeRenewModal,
  };
};

// Hooks de reportes se mantienen igual (datos generados)
export interface ReportKPIs {
  monthlyPurchases: {
    amount: number;
    percentage: number;
    trend: 'up' | 'down';
  };
  accumulatedSavings: {
    amount: number;
    description: string;
  };
  averageDeliveryTime: {
    days: number;
    change: number;
    trend: 'up' | 'down';
  };
}

export interface PurchasesByProvider {
  id: number;
  name: string;
  amount: number;
  percentage: number;
}

export interface ProviderPerformance {
  id: number;
  name: string;
  rating: number;
  compliance: number;
}

export interface StockAnalysis {
  productId: number;
  productName: string;
  currentStock: number;
  minStock: number;
  percentage: number;
  status: 'Normal' | 'Crítico';
}

export interface ReportsData {
  kpis: ReportKPIs;
  purchasesByProvider: PurchasesByProvider[];
  providerPerformance: ProviderPerformance[];
  stockAnalysis: StockAnalysis[];
}

export const useReports = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const productsData = await productsApi.getAll();
        const mappedProducts: ProductItem[] = productsData.map((p) => ({
          id: p.id,
          product: p.name,
          supplierId: p.supplier_id || 0,
          supplierName: p.supplier_name || '',
          currentStock: p.current_stock,
          minStock: p.min_stock,
          maxStock: p.max_stock,
          status: p.current_stock < p.min_stock ? 'Critico' : 'Normal',
        }));
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error loading reports data:', error);
      }
    };
    loadData();
  }, []);

  const monthlyPurchases = {
    amount: 24580,
    trend: 12,
  };

  const accumulatedSavings = {
    amount: 2340,
  };

  const averageDeliveryTime = {
    days: 3.2,
    improvement: 0.5,
  };

  const supplierPurchases: PurchasesByProvider[] = [
    { id: 1, name: 'Embotelladora Boliviana', amount: 12500, percentage: 50.9 },
    { id: 2, name: 'CBN', amount: 8900, percentage: 36.2 },
    { id: 3, name: 'Distribuidora Central', amount: 3180, percentage: 12.9 },
  ];

  const supplierPerformance: ProviderPerformance[] = [
    { id: 1, name: 'Embotelladora Boliviana', rating: 4.5, compliance: 95 },
    { id: 2, name: 'CBN', rating: 4.8, compliance: 98 },
    { id: 3, name: 'Distribuidora Central', rating: 4.2, compliance: 90 },
  ];

  const stockProducts = products.map((item) => ({
    id: item.id,
    product: item.product,
    currentStock: item.currentStock,
    minStock: item.minStock,
    status: item.status,
  }));

  return {
    monthlyPurchases,
    accumulatedSavings,
    averageDeliveryTime,
    supplierPurchases,
    supplierPerformance,
    stockProducts,
    formatCurrency,
    formatDate,
  };
};

export const useReportModals = () => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);

  const openExportModal = () => setShowExportModal(true);
  const closeExportModal = () => setShowExportModal(false);

  const openReportModal = () => setShowReportModal(true);
  const closeReportModal = () => setShowReportModal(false);

  const openAnalysisModal = () => setShowAnalysisModal(true);
  const closeAnalysisModal = () => setShowAnalysisModal(false);

  const openEvaluationModal = () => setShowEvaluationModal(true);
  const closeEvaluationModal = () => setShowEvaluationModal(false);

  return {
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
  };
};

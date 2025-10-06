import { useState, useMemo } from 'react';
import dbData from '../data/db.json';

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
  const [providers, setProviders] = useState<Provider[]>(dbData.providers);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

  const generateNewId = (): number => {
    return Math.max(...providers.map((p) => p.id)) + 1;
  };

  const addProvider = (newProvider: Omit<Provider, 'id'>): void => {
    const provider: Provider = {
      ...newProvider,
      id: generateNewId(),
    };
    setProviders((prev) => [...prev, provider]);
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
    addProvider,
    validateProvider,
    handleSearchChange,
    handlePageChange,
    ITEMS_PER_PAGE,
  };
};

// Hook para productos de provisioning
export const useProducts = () => {
  const [products, setProducts] = useState<ProductItem[]>(dbData.products as ProductItem[]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

  const generateNewProductId = (): number => {
    return Math.max(...products.map((p) => p.id)) + 1;
  };

  // Obtener opciones de proveedores para select
  const getSupplierOptions = () => {
    return dbData.providers.map((provider) => ({
      value: provider.id.toString(),
      label: provider.title,
    }));
  };

  const getSupplierName = (supplierId: number): string => {
    const supplier = dbData.providers.find((p) => p.id === supplierId);
    return supplier ? supplier.title : 'Proveedor desconocido';
  };

  const addProduct = (newProduct: {
    product: string;
    supplierId: number;
    currentStock: number;
    minStock: number;
    maxStock: number;
  }): void => {
    const product: ProductItem = {
      id: generateNewProductId(),
      product: newProduct.product,
      supplierId: newProduct.supplierId,
      supplierName: getSupplierName(newProduct.supplierId),
      currentStock: newProduct.currentStock,
      minStock: newProduct.minStock,
      maxStock: newProduct.maxStock,
      status: newProduct.currentStock < newProduct.minStock ? 'Critico' : 'Normal',
    };
    setProducts((prev) => [...prev, product]);
  };

  const updateProduct = (
    productId: number,
    updates: {
      product: string;
      supplierId: number;
      currentStock: number;
      minStock: number;
      maxStock: number;
    }
  ): void => {
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
  };

  const deleteProduct = (productId: number): void => {
    setProducts((prev) => prev.filter((product) => product.id !== productId));
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

// Hook para módulos de shopping
export const useShoppingModules = () => {
  const [modules] = useState<ShoppingModule[]>(dbData.shoppingModules as ShoppingModule[]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrado de módulos
  const filteredModules = useMemo(() => {
    return modules.filter(
      (module) =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [modules, searchTerm]);

  // Calcular cantidades dinámicas basadas en datos reales
  const getModuleQuantity = (moduleId: number): number => {
    switch (moduleId) {
      case 1: // Provisionamiento
        return dbData.products.length;
      case 2: // Proveedores
        return dbData.providers.length;
      case 3: // Órdenes de Compra
        return 2; // Número de órdenes de ejemplo en PurchaseOrdersPage
      case 4: // Recepciones
        return (dbData.receptions?.length || 0) + (dbData.returns?.length || 0); // Total de movimientos
      case 5: // Cotizaciones
        return 12; // Placeholder
      case 6: // Contratos
        return (dbData.contracts || []).length; // Número de contratos
      case 7: // Reportes
        return (
          (dbData.reports?.purchasesByProvider?.length || 0) +
          (dbData.reports?.providerPerformance?.length || 0) +
          (dbData.reports?.stockAnalysis?.length || 0)
        ); // Total elementos de reportes
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

  // Obtener historial del proveedor seleccionado
  const getProviderHistory = (providerId: number): HistoryItem[] => {
    const historyKey = providerId.toString();
    // Si no existe historial para este proveedor, retornar array vacío
    // en lugar de generar datos de ejemplo
    return (dbData.historyData as Record<string, HistoryItem[]>)[historyKey] || [];
  };

  const historyData = selectedProviderId ? getProviderHistory(selectedProviderId) : [];

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
  const [orders, setOrders] = useState<PurchaseOrder[]>(dbData.purchaseOrders as PurchaseOrder[]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

  const generateNewOrderId = (): number => {
    return Math.max(...orders.map((o) => o.id), 0) + 1;
  };

  const generateOrderNumber = (): string => {
    const maxNumber = Math.max(
      ...orders.map((o) => parseInt(o.orderNumber.replace('#', '')) || 0),
      0
    );
    return `#${maxNumber + 1}`;
  };

  // Obtener opciones de proveedores
  const getSupplierOptions = () => {
    return dbData.providers.map((provider) => ({
      value: provider.id.toString(),
      label: provider.title,
    }));
  };

  const getSupplierName = (supplierId: number): string => {
    const supplier = dbData.providers.find((p) => p.id === supplierId);
    return supplier ? supplier.title : 'Proveedor desconocido';
  };

  // Agregar nueva orden
  const addOrder = (newOrderData: {
    supplierId: number;
    items: Omit<PurchaseOrderItem, 'id'>[];
    notes?: string;
  }): void => {
    const totalAmount = newOrderData.items.reduce((sum, item) => sum + item.total, 0);
    const totalItems = newOrderData.items.length;

    const newOrder: PurchaseOrder = {
      id: generateNewOrderId(),
      orderNumber: generateOrderNumber(),
      date: new Date().toISOString().split('T')[0],
      supplierId: newOrderData.supplierId,
      supplierName: getSupplierName(newOrderData.supplierId),
      items: newOrderData.items.map((item, index) => ({ ...item, id: index + 1 })),
      totalItems,
      totalAmount,
      status: 'Pendiente',
      createdBy: 'Admin',
      notes: newOrderData.notes || '',
    };

    setOrders((prev) => [newOrder, ...prev]);
  };

  // Recibir orden (cambiar estado)
  const receiveOrder = (orderId: number): void => {
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

// Interfaces para recepciones
export interface PurchaseOrder {
  id: number;
  orderNumber: string;
  supplierId: number;
  supplierName: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  productId: number;
  productName: string;
  quantityOrdered: number;
  quantityReceived: number;
}

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
  const [receptions, setReceptions] = useState<Reception[]>(dbData.receptions as Reception[]);
  const [returns, setReturns] = useState<Return[]>(dbData.returns as Return[]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Obtener opciones para formularios
  const getPurchaseOrderOptions = () => {
    return [
      { value: '', label: 'Seleccionar orden...' },
      ...(dbData.purchaseOrders as PurchaseOrder[]).map((order) => ({
        value: order.id.toString(),
        label: `${order.orderNumber} - ${order.supplierName}`,
      })),
    ];
  };

  const getProductOptions = () => {
    return [
      { value: '', label: 'Buscar producto...' },
      ...dbData.products.map((product) => ({
        value: product.id.toString(),
        label: `${product.product}`,
      })),
    ];
  };

  const getSupplierOptions = () => {
    return [
      { value: '', label: 'Seleccionar proveedor...' },
      ...dbData.providers.map((provider) => ({
        value: provider.id.toString(),
        label: provider.title,
      })),
    ];
  };

  const getReturnReasonOptions = () => {
    return [
      { value: '', label: 'Seleccionar motivo...' },
      ...(dbData.returnReasons as ReturnReason[]).map((reason) => ({
        value: reason.value,
        label: reason.label,
      })),
    ];
  };

  // Generar ID único
  const generateNewReceptionId = (): number => {
    return Math.max(...receptions.map((r) => r.id)) + 1;
  };

  const generateNewReturnId = (): number => {
    return Math.max(...returns.map((r) => r.id)) + 1;
  };

  // Agregar nueva recepción
  const addReception = (receptionData: {
    purchaseOrderId: number;
    date: string;
    items: Omit<ReceptionItem, 'productName'>[];
  }): void => {
    const purchaseOrder = (dbData.purchaseOrders as PurchaseOrder[]).find(
      (po) => po.id === receptionData.purchaseOrderId
    );

    if (!purchaseOrder) return;

    const newReception: Reception = {
      id: generateNewReceptionId(),
      purchaseOrderId: receptionData.purchaseOrderId,
      orderNumber: purchaseOrder.orderNumber,
      supplierId: purchaseOrder.supplierId,
      supplierName: purchaseOrder.supplierName,
      date: receptionData.date,
      items: receptionData.items.map((item) => {
        const product = dbData.products.find((p) => p.id === item.productId);
        return {
          ...item,
          productName: product?.product || 'Producto desconocido',
        };
      }),
      status: 'completed',
    };

    setReceptions((prev) => [...prev, newReception]);
  };

  // Agregar nueva devolución
  const addReturn = (returnData: {
    productId: number;
    supplierId: number;
    quantity: number;
    reason: string;
    observations: string;
  }): void => {
    const product = dbData.products.find((p) => p.id === returnData.productId);
    const supplier = dbData.providers.find((p) => p.id === returnData.supplierId);
    const reasonInfo = (dbData.returnReasons as ReturnReason[]).find(
      (r) => r.value === returnData.reason
    );

    if (!product || !supplier || !reasonInfo) return;

    const newReturn: Return = {
      id: generateNewReturnId(),
      productId: returnData.productId,
      productName: product.product,
      supplierId: returnData.supplierId,
      supplierName: supplier.title,
      quantity: returnData.quantity,
      reason: returnData.reason,
      reasonText: reasonInfo.label,
      observations: returnData.observations,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    };

    setReturns((prev) => [...prev, newReturn]);
  };

  // Combinar recepciones y devoluciones para el historial
  const getMovementHistory = () => {
    const receptionHistory = receptions.map((reception) => ({
      id: `reception-${reception.id}`,
      type: 'reception' as const,
      title: `Recepción - ${reception.orderNumber}`,
      description: `${reception.supplierName} - ${reception.items.reduce((sum, item) => sum + item.quantity, 0)} unidades`,
      date: formatDate(reception.date),
      icon: '📦',
      data: reception,
    }));

    const returnHistory = returns.map((returnItem) => ({
      id: `return-${returnItem.id}`,
      type: 'return' as const,
      title: `Devolución - ${returnItem.productName}`,
      description: `${returnItem.reasonText} - ${returnItem.quantity} unidades`,
      date: formatDate(returnItem.date),
      icon: '↩️',
      data: returnItem,
    }));

    return [...receptionHistory, ...returnHistory].sort(
      (a, b) =>
        new Date(b.data.date || b.date).getTime() - new Date(a.data.date || a.date).getTime()
    );
  };

  // Obtener detalles de un movimiento
  const getMovementDetails = (movementId: string) => {
    if (movementId.startsWith('reception-')) {
      const id = parseInt(movementId.split('-')[1]);
      return receptions.find((r) => r.id === id);
    } else if (movementId.startsWith('return-')) {
      const id = parseInt(movementId.split('-')[1]);
      return returns.find((r) => r.id === id);
    }
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
  const [contracts, setContracts] = useState<Contract[]>((dbData.contracts as Contract[]) || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

  const generateNewContractId = (): number => {
    return Math.max(...contracts.map((c) => c.id), 0) + 1;
  };

  // Obtener opciones de proveedores
  const getSupplierOptions = () => {
    return dbData.providers.map((provider) => ({
      value: provider.id.toString(),
      label: provider.title,
    }));
  };

  // Obtener tipos de contrato
  const getContractTypeOptions = () => {
    return (dbData.contractTypes as ContractType[]) || [];
  };

  const getSupplierName = (supplierId: number): string => {
    const supplier = dbData.providers.find((p) => p.id === supplierId);
    return supplier ? supplier.title : 'Proveedor desconocido';
  };

  // Calcular días hasta vencimiento
  const calculateDaysUntilExpiration = (endDate: string): number => {
    const today = new Date();
    const expirationDate = new Date(endDate);
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Agregar nuevo contrato
  const addContract = (newContractData: {
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
  }): void => {
    const daysUntilExpiration = calculateDaysUntilExpiration(newContractData.endDate);
    const status = daysUntilExpiration < 0 ? 'expired' : 'active';

    const newContract: Contract = {
      id: generateNewContractId(),
      title: newContractData.title,
      description: newContractData.description,
      supplierId: newContractData.supplierId,
      supplierName: getSupplierName(newContractData.supplierId),
      type: newContractData.type,
      status,
      startDate: newContractData.startDate,
      endDate: newContractData.endDate,
      terms: newContractData.terms,
      daysUntilExpiration,
      alertsEnabled: newContractData.alertsEnabled,
      createdBy: 'Admin',
      createdDate: new Date().toISOString().split('T')[0],
      notes: newContractData.notes || '',
    };

    setContracts((prev) => [newContract, ...prev]);
  };

  // Renovar contrato
  const renewContract = (contractId: number, newEndDate: string): void => {
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
  };

  // Obtener contratos por estado
  const getContractsByStatus = (status: Contract['status']) => {
    return contracts.filter((contract) => contract.status === status);
  };

  // Obtener contratos próximos a vencer (30 días o menos)
  const getExpiringContracts = () => {
    return contracts.filter(
      (contract) =>
        contract.status === 'active' &&
        contract.daysUntilExpiration <= 30 &&
        contract.daysUntilExpiration > 0
    );
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
    contracts,
    currentContracts,
    filteredContracts,
    searchTerm,
    currentPage,
    totalPages,
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

// Interfaces para reportes
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

// Hook para reportes
// Hook para reportes
export const useReports = () => {
  const [stockFilter, setStockFilter] = useState<'all' | 'critical' | 'normal'>('all');

  // Generate data from existing JSON data instead of expecting dbData.reports
  const generateReportsData = (): ReportsData => {
    // Calculate monthly purchases from history data (simulate)
    const monthlyPurchases = {
      amount: 24580,
      percentage: 12,
      trend: 'up' as 'up' | 'down',
    };

    const accumulatedSavings = {
      amount: 2340,
      description: 'Por negociación y cotizaciones',
    };

    const averageDeliveryTime = {
      days: 3.2,
      change: 0.5,
      trend: 'down' as 'up' | 'down',
    };

    // Generate purchases by provider data
    const purchasesByProvider: PurchasesByProvider[] = [
      { id: 1, name: 'Embotelladora Boliviana', amount: 12500, percentage: 50.9 },
      { id: 2, name: 'CBN', amount: 8900, percentage: 36.2 },
      { id: 3, name: 'Distribuidora Central', amount: 3180, percentage: 12.9 },
    ];

    // Generate provider performance data
    const providerPerformance: ProviderPerformance[] = [
      { id: 1, name: 'Embotelladora Boliviana', rating: 4.5, compliance: 95 },
      { id: 2, name: 'CBN', rating: 4.8, compliance: 98 },
      { id: 3, name: 'Distribuidora Central', rating: 4.2, compliance: 90 },
    ];

    // Generate stock analysis from products data
    const stockAnalysis: StockAnalysis[] = dbData.products.map((product) => ({
      productId: product.id,
      productName: product.product,
      currentStock: product.currentStock,
      minStock: product.minStock,
      percentage: Math.round((product.currentStock / product.minStock) * 100),
      status: product.status as 'Normal' | 'Crítico',
    }));

    return {
      kpis: {
        monthlyPurchases,
        accumulatedSavings,
        averageDeliveryTime,
      },
      purchasesByProvider,
      providerPerformance,
      stockAnalysis,
    };
  };

  const reports = generateReportsData();

  // Formatear moneda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-BO');
  };

  // Return data in the format expected by ReportsPage
  const monthlyPurchases = {
    amount: reports.kpis.monthlyPurchases.amount,
    trend: reports.kpis.monthlyPurchases.percentage,
  };

  const accumulatedSavings = {
    amount: reports.kpis.accumulatedSavings.amount,
  };

  const averageDeliveryTime = {
    days: reports.kpis.averageDeliveryTime.days,
    improvement: reports.kpis.averageDeliveryTime.change,
  };

  const supplierPurchases = reports.purchasesByProvider;
  const supplierPerformance = reports.providerPerformance;

  // Filter stock products based on current filter
  const stockProducts = reports.stockAnalysis.map((item) => ({
    id: item.productId,
    product: item.productName,
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

// Hook for Report Modals
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

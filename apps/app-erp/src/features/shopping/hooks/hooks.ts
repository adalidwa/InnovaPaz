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
        return 24; // Placeholder
      case 4: // Recepciones
        return 18; // Placeholder
      case 5: // Cotizaciones
        return 12; // Placeholder
      case 6: // Contratos
        return 8; // Placeholder
      case 7: // Reportes
        return 15; // Placeholder
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

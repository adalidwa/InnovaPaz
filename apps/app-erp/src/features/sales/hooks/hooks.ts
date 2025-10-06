import { useState, useMemo } from 'react';
import dbData from '../data/db.json';

// Tipos para Sales
export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  nit: string;
  address: string;
  type: 'regular' | 'corporate' | 'wholesale';
  creditLimit: number;
  currentDebt: number;
  lastPurchase: string;
}

export interface Product {
  id: number;
  name: string;
  code: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock: number;
  status: 'Disponible' | 'Bajo Stock' | 'Crítico';
}

export interface SaleProduct {
  id: number;
  name: string;
  code: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  clientId: number;
  clientName: string;
  date: string;
  time: string;
  products: SaleProduct[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'credit' | 'debit' | 'transfer';
  status: 'completed' | 'pending' | 'cancelled';
}

export interface Order {
  id: number;
  clientId: number;
  clientName: string;
  date: string;
  deliveryDate: string;
  products: SaleProduct[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
}

export interface Quote {
  id: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  validUntil: string;
  products: SaleProduct[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface HistoryItem {
  id: number;
  date: string;
  type: 'sale' | 'payment' | 'credit' | 'refund';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface SalesModule {
  id: number;
  title: string;
  description: string;
  type: string;
  icon: string;
  route: string;
  isActive: boolean;
  priority: 'high' | 'medium' | 'low';
}

// Constantes
const ITEMS_PER_PAGE = 10;
const HISTORY_ITEMS_PER_PAGE = 5;
const CART_MAX_ITEMS = 50;

// Utilidades
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

const generateId = (items: any[]): number => {
  return Math.max(...items.map((item) => item.id), 0) + 1;
};

// Hook para gestión de clientes
export const useClients = () => {
  const [clients, setClients] = useState<Client[]>(dbData.clients);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredClients = useMemo(() => {
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.nit.includes(searchTerm) ||
        client.phone.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentClients = filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const addClient = (newClient: Omit<Client, 'id'>): void => {
    const client: Client = {
      ...newClient,
      id: generateId(clients),
    };
    setClients((prev) => [...prev, client]);
  };

  const updateClient = (clientId: number, updates: Partial<Client>): void => {
    setClients((prev) =>
      prev.map((client) => (client.id === clientId ? { ...client, ...updates } : client))
    );
  };

  const deleteClient = (clientId: number): void => {
    setClients((prev) => prev.filter((client) => client.id !== clientId));
  };

  const validateClient = (client: Omit<Client, 'id'>): string | null => {
    if (!client.name.trim()) return 'El nombre del cliente es obligatorio';
    if (!client.nit.trim()) return 'El NIT es obligatorio';
    if (client.nit.length < 7) return 'El NIT debe tener al menos 7 dígitos';
    if (!client.phone.trim()) return 'El teléfono es obligatorio';
    if (client.phone.length < 7) return 'El teléfono debe tener al menos 7 dígitos';
    if (client.email && !validateEmail(client.email)) return 'Por favor ingrese un email válido';
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
    clients,
    currentClients,
    filteredClients,
    searchTerm,
    currentPage,
    totalPages,
    addClient,
    updateClient,
    deleteClient,
    validateClient,
    handleSearchChange,
    handlePageChange,
    ITEMS_PER_PAGE,
  };
};

// Hook para gestión de productos
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(dbData.products);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map((p) => p.category))];
    return ['all', ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const addProduct = (newProduct: Omit<Product, 'id' | 'status'>): void => {
    const product: Product = {
      ...newProduct,
      id: generateId(products),
      status:
        newProduct.stock < newProduct.minStock
          ? 'Crítico'
          : newProduct.stock < newProduct.minStock * 1.5
            ? 'Bajo Stock'
            : 'Disponible',
    };
    setProducts((prev) => [...prev, product]);
  };

  const updateProduct = (productId: number, updates: Partial<Product>): void => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          const updated = { ...product, ...updates };
          updated.status =
            updated.stock < updated.minStock
              ? 'Crítico'
              : updated.stock < updated.minStock * 1.5
                ? 'Bajo Stock'
                : 'Disponible';
          return updated;
        }
        return product;
      })
    );
  };

  const deleteProduct = (productId: number): void => {
    setProducts((prev) => prev.filter((product) => product.id !== productId));
  };

  const updateStock = (productId: number, newStock: number): void => {
    updateProduct(productId, { stock: Math.max(0, newStock) });
  };

  const validateProduct = (product: Omit<Product, 'id' | 'status'>): string | null => {
    if (!product.name.trim()) return 'El nombre del producto es obligatorio';
    if (!product.code.trim()) return 'El código del producto es obligatorio';
    if (!product.category.trim()) return 'La categoría es obligatoria';
    if (product.price <= 0) return 'El precio debe ser mayor a 0';
    if (product.cost < 0) return 'El costo no puede ser negativo';
    if (product.minStock < 0) return 'El stock mínimo no puede ser negativo';
    if (product.maxStock < product.minStock) return 'El stock máximo debe ser mayor al mínimo';
    if (product.stock < 0) return 'El stock actual no puede ser negativo';
    return null;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string): void => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  return {
    products,
    currentProducts,
    filteredProducts,
    categories,
    searchTerm,
    selectedCategory,
    currentPage,
    totalPages,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    validateProduct,
    handleSearchChange,
    handleCategoryChange,
    handlePageChange,
    ITEMS_PER_PAGE,
  };
};

// Hook para carrito de compras (POS)
export const useCart = () => {
  const [cartItems, setCartItems] = useState<SaleProduct[]>([]);
  const [discount, setDiscount] = useState(0);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cartItems]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount);
  }, [subtotal, discount]);

  const addToCart = (product: Product, quantity: number = 1): void => {
    if (cartItems.length >= CART_MAX_ITEMS) return;

    const existingItem = cartItems.find((item) => item.id === product.id);

    if (existingItem) {
      updateCartItem(product.id, existingItem.quantity + quantity);
    } else {
      const cartItem: SaleProduct = {
        id: product.id,
        name: product.name,
        code: product.code,
        price: product.price,
        quantity,
        subtotal: product.price * quantity,
      };
      setCartItems((prev) => [...prev, cartItem]);
    }
  };

  const updateCartItem = (productId: number, quantity: number): void => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity, subtotal: item.price * quantity } : item
      )
    );
  };

  const removeFromCart = (productId: number): void => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = (): void => {
    setCartItems([]);
    setDiscount(0);
    setSelectedClientId(null);
  };

  const applyDiscount = (amount: number): void => {
    setDiscount(Math.max(0, Math.min(amount, subtotal)));
  };

  return {
    cartItems,
    discount,
    subtotal,
    total,
    selectedClientId,
    setSelectedClientId,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyDiscount,
    CART_MAX_ITEMS,
  };
};

// Hook para gestión de ventas
export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>(dbData.sales);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredSales = useMemo(() => {
    return sales.filter(
      (sale) =>
        sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.date.includes(searchTerm) ||
        sale.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sales, searchTerm]);

  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentSales = filteredSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const addSale = (newSale: Omit<Sale, 'id' | 'date' | 'time'>): void => {
    const now = new Date();
    const sale: Sale = {
      ...newSale,
      id: generateId(sales),
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
    };
    setSales((prev) => [sale, ...prev]);
  };

  const updateSaleStatus = (saleId: number, status: Sale['status']): void => {
    setSales((prev) => prev.map((sale) => (sale.id === saleId ? { ...sale, status } : sale)));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  return {
    sales,
    currentSales,
    filteredSales,
    searchTerm,
    currentPage,
    totalPages,
    addSale,
    updateSaleStatus,
    handleSearchChange,
    handlePageChange,
    ITEMS_PER_PAGE,
  };
};

// Hook para órdenes de venta
export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>(dbData.orders);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.date.includes(searchTerm) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const addOrder = (newOrder: Omit<Order, 'id' | 'date'>): void => {
    const order: Order = {
      ...newOrder,
      id: generateId(orders),
      date: new Date().toISOString().split('T')[0],
    };
    setOrders((prev) => [order, ...prev]);
  };

  const updateOrderStatus = (orderId: number, status: Order['status']): void => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)));
  };

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
    updateOrderStatus,
    handleSearchChange,
    handlePageChange,
    ITEMS_PER_PAGE,
  };
};

// Hook para cotizaciones
export const useQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>(dbData.quotes);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredQuotes = useMemo(() => {
    return quotes.filter(
      (quote) =>
        quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.date.includes(searchTerm) ||
        quote.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [quotes, searchTerm]);

  const totalPages = Math.ceil(filteredQuotes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentQuotes = filteredQuotes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const addQuote = (newQuote: Omit<Quote, 'id' | 'date'>): void => {
    const quote: Quote = {
      ...newQuote,
      id: generateId(quotes),
      date: new Date().toISOString().split('T')[0],
    };
    setQuotes((prev) => [quote, ...prev]);
  };

  const updateQuoteStatus = (quoteId: number, status: Quote['status']): void => {
    setQuotes((prev) => prev.map((quote) => (quote.id === quoteId ? { ...quote, status } : quote)));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  return {
    quotes,
    currentQuotes,
    filteredQuotes,
    searchTerm,
    currentPage,
    totalPages,
    addQuote,
    updateQuoteStatus,
    handleSearchChange,
    handlePageChange,
    ITEMS_PER_PAGE,
  };
};

// Hook para módulos de sales
export const useSalesModules = () => {
  const [modules] = useState<SalesModule[]>(dbData.salesModules);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredModules = useMemo(() => {
    return modules.filter(
      (module) =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [modules, searchTerm]);

  const getModuleQuantity = (moduleId: number): number => {
    switch (moduleId) {
      case 1: // Punto de Venta
        return dbData.sales.length;
      case 2: // Clientes
        return dbData.clients.length;
      case 3: // Órdenes de Venta
        return dbData.orders.length;
      case 4: // Cotizaciones
        return dbData.quotes.length;
      case 5: // Productos
        return dbData.products.length;
      case 6: // Historial de Ventas
        return dbData.sales.length;
      case 7: // Reportes
        return 15; // Placeholder
      default:
        return 0;
    }
  };

  const getModuleStatus = (module: SalesModule): 'Normal' | 'Revisar' => {
    if (!module.isActive && module.priority === 'medium') return 'Revisar';
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

// Hook para historial de clientes
export const useHistory = () => {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const getClientHistory = (clientId: number): HistoryItem[] => {
    const historyKey = clientId.toString();
    return (dbData.historyData as Record<string, HistoryItem[]>)[historyKey] || [];
  };

  const historyData = selectedClientId ? getClientHistory(selectedClientId) : [];

  const filteredHistory = useMemo(() => {
    return historyData.filter(
      (item) =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [historyData, searchTerm]);

  const totalPages = Math.ceil(filteredHistory.length / HISTORY_ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * HISTORY_ITEMS_PER_PAGE;
  const currentHistoryItems = filteredHistory.slice(
    startIndex,
    startIndex + HISTORY_ITEMS_PER_PAGE
  );

  const getTotalAmount = (): number => {
    return filteredHistory
      .filter((item) => item.status === 'completed')
      .reduce((total, item) => total + item.amount, 0);
  };

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
      sale: '🛒',
      payment: '💰',
      credit: '💳',
      refund: '↩️',
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

  const selectClient = (clientId: number): void => {
    setSelectedClientId(clientId);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const clearSelection = (): void => {
    setSelectedClientId(null);
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
    selectedClientId,
    historyData: filteredHistory,
    currentHistoryItems,
    searchTerm,
    currentPage,
    totalPages,
    getTotalAmount,
    getStatusColor,
    getTypeIcon,
    getStatusText,
    selectClient,
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
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  return {
    showAddClientModal,
    showAddProductModal,
    showEditProductModal,
    showHistoryModal,
    showQuoteModal,
    showOrderModal,
    openAddClientModal: () => setShowAddClientModal(true),
    closeAddClientModal: () => setShowAddClientModal(false),
    openAddProductModal: () => setShowAddProductModal(true),
    closeAddProductModal: () => setShowAddProductModal(false),
    openEditProductModal: () => setShowEditProductModal(true),
    closeEditProductModal: () => setShowEditProductModal(false),
    openHistoryModal: () => setShowHistoryModal(true),
    closeHistoryModal: () => setShowHistoryModal(false),
    openQuoteModal: () => setShowQuoteModal(true),
    closeQuoteModal: () => setShowQuoteModal(false),
    openOrderModal: () => setShowOrderModal(true),
    closeOrderModal: () => setShowOrderModal(false),
  };
};

// Hook para formulario de clientes
export const useClientForm = () => {
  const initialForm: Omit<Client, 'id'> = {
    name: '',
    email: '',
    phone: '',
    nit: '',
    address: '',
    type: 'regular',
    creditLimit: 0,
    currentDebt: 0,
    lastPurchase: '',
  };

  const [form, setForm] = useState(initialForm);

  const updateField = (field: keyof typeof form, value: string | number): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = (): void => {
    setForm(initialForm);
  };

  const loadClient = (client: Client): void => {
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      nit: client.nit,
      address: client.address,
      type: client.type,
      creditLimit: client.creditLimit,
      currentDebt: client.currentDebt,
      lastPurchase: client.lastPurchase,
    });
  };

  const handleFormInputChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      let value: string | number = e.target.value;

      switch (field) {
        case 'nit':
          value = sanitizeNumericInput(value as string, 13);
          break;
        case 'phone':
          value = sanitizeNumericInput(value as string, 8);
          break;
        case 'email':
          value = sanitizeEmailInput(value as string);
          break;
        case 'creditLimit':
        case 'currentDebt':
          value = Math.max(0, parseFloat(value as string) || 0);
          break;
        default:
          value = (value as string).trim();
      }

      updateField(field, value);
    };

  return {
    form,
    updateField,
    resetForm,
    loadClient,
    handleFormInputChange,
  };
};

// Hook para formulario de productos
export const useProductForm = () => {
  const initialForm: Omit<Product, 'id' | 'status'> = {
    name: '',
    code: '',
    category: '',
    price: 0,
    cost: 0,
    stock: 0,
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

  const loadProduct = (product: Product): void => {
    setForm({
      name: product.name,
      code: product.code,
      category: product.category,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      minStock: product.minStock,
      maxStock: product.maxStock,
    });
  };

  return {
    form,
    updateField,
    resetForm,
    loadProduct,
  };
};

export { formatCurrency, formatDate };

// Exportación explícita de todos los tipos
export type { Client, Product, SaleProduct, Sale, Order, Quote, HistoryItem, SalesModule };

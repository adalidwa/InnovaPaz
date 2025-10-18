import { useState, useMemo, useEffect } from 'react';
import SalesService from '../services/salesService';
import type {
  Client,
  Product,
  SaleProduct,
  Sale,
  Order,
  Quote,
  HistoryItem,
  SalesModule,
} from '../types';

// Re-exportar tipos para compatibilidad
export type { Client, Product, SaleProduct, Sale, Order, Quote, HistoryItem, SalesModule };

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

// Hook para gestión de clientes
export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        const data = await SalesService.getAllClients();
        setClients(data);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
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

  const addClient = async (newClient: Omit<Client, 'id'>): Promise<void> => {
    try {
      const client = await SalesService.createClient(newClient);
      setClients((prev) => [client, ...prev]);
    } catch (error) {
      console.error('Error al crear cliente:', error);
      throw error;
    }
  };

  const updateClient = async (clientId: number, updates: Partial<Client>): Promise<void> => {
    try {
      const updatedClient = await SalesService.updateClient(clientId, updates);
      setClients((prev) => prev.map((client) => (client.id === clientId ? updatedClient : client)));
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      throw error;
    }
  };

  const deleteClient = async (clientId: number): Promise<void> => {
    try {
      await SalesService.deleteClient(clientId);
      setClients((prev) => prev.filter((client) => client.id !== clientId));
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      throw error;
    }
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
    loading,
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await SalesService.getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

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
    loading,
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
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadSales = async () => {
      try {
        setLoading(true);
        const data = await SalesService.getAllSales();
        setSales(data);
      } catch (error) {
        console.error('Error al cargar ventas:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSales();
  }, []);

  const filteredSales = useMemo(() => {
    if (!searchTerm) return sales;
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

  const addSale = async (saleData: {
    clientId: number;
    clientName: string;
    products: SaleProduct[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: 'cash' | 'credit' | 'debit' | 'transfer';
  }): Promise<void> => {
    try {
      const newSale = await SalesService.createSale(saleData);
      setSales((prev) => [newSale, ...prev]);
    } catch (error) {
      console.error('Error al crear venta:', error);
      throw error;
    }
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
    loading,
    addSale,
    handleSearchChange,
    handlePageChange,
    ITEMS_PER_PAGE,
  };
};

// Hook para órdenes de venta
export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await SalesService.getAllOrders();
        setOrders(data);
      } catch (error) {
        console.error('Error al cargar órdenes:', error);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
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
    handleSearchChange,
    handlePageChange,
    ITEMS_PER_PAGE,
  };
};

// Hook para cotizaciones
export const useQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        setLoading(true);
        const data = await SalesService.getAllQuotes(localStorage.getItem('empresaId') || '');
        setQuotes(data);
      } catch (error) {
        console.error('Error al cargar cotizaciones:', error);
      } finally {
        setLoading(false);
      }
    };
    loadQuotes();
  }, []);

  const filteredQuotes = useMemo(() => {
    if (!searchTerm) return quotes;
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
    loading,
    handleSearchChange,
    handlePageChange,
    ITEMS_PER_PAGE,
  };
};

// Hook para módulos de sales
export const useSalesModules = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const modules: SalesModule[] = [
    {
      id: 1,
      title: 'Punto de Venta',
      description: 'Sistema de ventas rápido',
      type: 'sales',
      icon: '💰',
      route: '/app-erp/ventas/pos',
      isActive: true,
      priority: 'high',
    },
    {
      id: 2,
      title: 'Clientes',
      description: 'Gestión de clientes',
      type: 'clients',
      icon: '👥',
      route: '/app-erp/ventas/clientes',
      isActive: true,
      priority: 'high',
    },
    {
      id: 3,
      title: 'Historial',
      description: 'Historial de ventas',
      type: 'history',
      icon: '📋',
      route: '/app-erp/ventas/historial',
      isActive: true,
      priority: 'medium',
    },
  ];

  const filteredModules = useMemo(() => {
    if (!searchTerm) return modules;
    return modules.filter(
      (module) =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  return {
    modules: filteredModules,
    searchTerm,
    handleSearchChange,
  };
};

// Hook para historial de clientes
export const useHistory = () => {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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
    searchTerm,
    currentPage,
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
          value = value as string;
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

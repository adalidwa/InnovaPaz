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

// Hook para tabla de historial
export const useHistory = () => {
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Obtener historial del proveedor seleccionado
  const getProviderHistory = (providerId: number): HistoryItem[] => {
    const historyKey = providerId.toString();
    return (
      (dbData.historyData as Record<string, HistoryItem[]>)[historyKey] || [
        {
          id: providerId * 100 + 1,
          date: '2024-09-20',
          type: 'purchase',
          description: 'Compra productos varios',
          amount: 8500.0,
          status: 'completed',
        },
        {
          id: providerId * 100 + 2,
          date: '2024-09-15',
          type: 'order',
          description: 'Orden de compra estándar',
          amount: 5200.3,
          status: 'pending',
        },
        {
          id: providerId * 100 + 3,
          date: '2024-09-10',
          type: 'payment',
          description: 'Pago factura mensual',
          amount: 12800.75,
          status: 'completed',
        },
      ]
    );
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

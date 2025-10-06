import { Product, SaleProduct, Client, Sale, Order, Quote } from '../hooks/hooks';

// Utilidades de formateo
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-BO');
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('es-BO');
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals);
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

// Utilidades de validación
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateNIT = (nit: string): boolean => {
  // Validación básica para NIT boliviano
  return /^\d{7,13}$/.test(nit);
};

export const validatePhone = (phone: string): boolean => {
  // Validación básica para teléfonos bolivianos
  return /^\d{7,8}$/.test(phone);
};

export const validateProductCode = (code: string): boolean => {
  // Código de producto debe tener al menos 3 caracteres
  return code.trim().length >= 3;
};

// Utilidades de cálculo
export const calculateSubtotal = (price: number, quantity: number): number => {
  return price * quantity;
};

export const calculateDiscount = (subtotal: number, discountPercent: number): number => {
  return (subtotal * discountPercent) / 100;
};

export const calculateTotal = (subtotal: number, discount: number = 0): number => {
  return Math.max(0, subtotal - discount);
};

export const calculateTax = (subtotal: number, taxRate: number = 0.13): number => {
  return subtotal * taxRate;
};

export const calculateMargin = (sellingPrice: number, cost: number): number => {
  if (cost === 0) return 0;
  return ((sellingPrice - cost) / cost) * 100;
};

export const calculateProfitMargin = (sellingPrice: number, cost: number): number => {
  if (sellingPrice === 0) return 0;
  return ((sellingPrice - cost) / sellingPrice) * 100;
};

// Utilidades de carrito de compras
export const addToCart = (
  cartItems: SaleProduct[],
  product: Product,
  quantity: number = 1
): SaleProduct[] => {
  const existingItemIndex = cartItems.findIndex((item) => item.id === product.id);

  if (existingItemIndex >= 0) {
    // Si el producto ya existe, actualizar cantidad
    const updatedItems = [...cartItems];
    updatedItems[existingItemIndex] = {
      ...updatedItems[existingItemIndex],
      quantity: updatedItems[existingItemIndex].quantity + quantity,
      subtotal: calculateSubtotal(
        product.price,
        updatedItems[existingItemIndex].quantity + quantity
      ),
    };
    return updatedItems;
  } else {
    // Si es un producto nuevo, agregarlo
    const newItem: SaleProduct = {
      id: product.id,
      name: product.name,
      code: product.code,
      price: product.price,
      quantity,
      subtotal: calculateSubtotal(product.price, quantity),
    };
    return [...cartItems, newItem];
  }
};

export const updateCartItemQuantity = (
  cartItems: SaleProduct[],
  productId: number,
  newQuantity: number
): SaleProduct[] => {
  if (newQuantity <= 0) {
    return cartItems.filter((item) => item.id !== productId);
  }

  return cartItems.map((item) =>
    item.id === productId
      ? {
          ...item,
          quantity: newQuantity,
          subtotal: calculateSubtotal(item.price, newQuantity),
        }
      : item
  );
};

export const removeFromCart = (cartItems: SaleProduct[], productId: number): SaleProduct[] => {
  return cartItems.filter((item) => item.id !== productId);
};

export const calculateCartTotals = (cartItems: SaleProduct[], discount: number = 0) => {
  const subtotal = cartItems.reduce((total, item) => total + item.subtotal, 0);
  const total = calculateTotal(subtotal, discount);

  return {
    subtotal,
    discount,
    total,
    itemCount: cartItems.reduce((count, item) => count + item.quantity, 0),
  };
};

// Utilidades de búsqueda y filtrado
export const searchProducts = (products: Product[], query: string): Product[] => {
  if (!query.trim()) return products;

  const searchTerm = query.toLowerCase().trim();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.code.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
  );
};

export const filterProductsByCategory = (products: Product[], category: string): Product[] => {
  if (category === 'all' || !category) return products;
  return products.filter((product) => product.category === category);
};

export const filterProductsByStatus = (products: Product[], status: string): Product[] => {
  if (status === 'all' || !status) return products;
  return products.filter((product) => product.status === status);
};

export const searchClients = (clients: Client[], query: string): Client[] => {
  if (!query.trim()) return clients;

  const searchTerm = query.toLowerCase().trim();
  return clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm) ||
      client.nit.includes(searchTerm) ||
      client.phone.includes(searchTerm)
  );
};

export const filterClientsByType = (clients: Client[], type: string): Client[] => {
  if (type === 'all' || !type) return clients;
  return clients.filter((client) => client.type === type);
};

// Utilidades de estado y clasificación
export const getProductStatusColor = (status: string) => {
  const statusColors = {
    Disponible: { bg: 'var(--sec-100)', text: 'var(--sec-800)' },
    'Bajo Stock': { bg: 'var(--warning-100)', text: 'var(--warning-800)' },
    Crítico: { bg: 'var(--acc-100)', text: 'var(--acc-800)' },
  };
  return (
    statusColors[status as keyof typeof statusColors] || {
      bg: 'var(--pri-100)',
      text: 'var(--pri-800)',
    }
  );
};

export const getSaleStatusColor = (status: string) => {
  const statusColors = {
    completed: { bg: 'var(--sec-100)', text: 'var(--sec-800)' },
    pending: { bg: 'var(--warning-100)', text: 'var(--warning-800)' },
    cancelled: { bg: 'var(--acc-100)', text: 'var(--acc-800)' },
  };
  return (
    statusColors[status as keyof typeof statusColors] || {
      bg: 'var(--pri-100)',
      text: 'var(--pri-800)',
    }
  );
};

export const getOrderStatusColor = (status: string) => {
  const statusColors = {
    pending: { bg: 'var(--warning-100)', text: 'var(--warning-800)' },
    confirmed: { bg: 'var(--pri-100)', text: 'var(--pri-800)' },
    delivered: { bg: 'var(--sec-100)', text: 'var(--sec-800)' },
    cancelled: { bg: 'var(--acc-100)', text: 'var(--acc-800)' },
  };
  return (
    statusColors[status as keyof typeof statusColors] || {
      bg: 'var(--pri-100)',
      text: 'var(--pri-800)',
    }
  );
};

export const getClientTypeLabel = (type: string): string => {
  const typeLabels = {
    regular: 'Cliente Regular',
    corporate: 'Empresa/Corporativo',
    wholesale: 'Cliente Mayorista',
  };
  return typeLabels[type as keyof typeof typeLabels] || type;
};

export const getPaymentMethodLabel = (method: string): string => {
  const methodLabels = {
    cash: 'Efectivo',
    credit: 'Tarjeta de Crédito',
    debit: 'Tarjeta de Débito',
    transfer: 'Transferencia',
  };
  return methodLabels[method as keyof typeof methodLabels] || method;
};

// Utilidades de ordenamiento
export const sortProductsByName = (products: Product[], ascending: boolean = true): Product[] => {
  return [...products].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return ascending ? comparison : -comparison;
  });
};

export const sortProductsByPrice = (products: Product[], ascending: boolean = true): Product[] => {
  return [...products].sort((a, b) => {
    const comparison = a.price - b.price;
    return ascending ? comparison : -comparison;
  });
};

export const sortProductsByStock = (products: Product[], ascending: boolean = true): Product[] => {
  return [...products].sort((a, b) => {
    const comparison = a.stock - b.stock;
    return ascending ? comparison : -comparison;
  });
};

export const sortClientsByName = (clients: Client[], ascending: boolean = true): Client[] => {
  return [...clients].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return ascending ? comparison : -comparison;
  });
};

export const sortSalesByDate = (sales: Sale[], ascending: boolean = false): Sale[] => {
  return [...sales].sort((a, b) => {
    const comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    return ascending ? comparison : -comparison;
  });
};

// Utilidades de generación de IDs y códigos
export const generateId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

export const generateProductCode = (name: string, category: string): string => {
  const nameCode = name.substring(0, 2).toUpperCase();
  const categoryCode = category.substring(0, 2).toUpperCase();
  const randomNum = Math.floor(Math.random() * 999)
    .toString()
    .padStart(3, '0');
  return `${nameCode}${categoryCode}${randomNum}`;
};

export const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().substring(2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, '0');
  return `INV${year}${month}${day}${random}`;
};

// Utilidades de análisis y reportes
export const calculateSalesGrowth = (currentSales: number, previousSales: number): number => {
  if (previousSales === 0) return currentSales > 0 ? 100 : 0;
  return ((currentSales - previousSales) / previousSales) * 100;
};

export const getTopSellingProducts = (sales: Sale[], limit: number = 5) => {
  const productSales: Record<
    number,
    { product: SaleProduct; totalQuantity: number; totalRevenue: number }
  > = {};

  sales.forEach((sale) => {
    if (sale.status === 'completed') {
      sale.products.forEach((product) => {
        if (!productSales[product.id]) {
          productSales[product.id] = {
            product,
            totalQuantity: 0,
            totalRevenue: 0,
          };
        }
        productSales[product.id].totalQuantity += product.quantity;
        productSales[product.id].totalRevenue += product.subtotal;
      });
    }
  });

  return Object.values(productSales)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, limit);
};

export const getTopClients = (sales: Sale[], limit: number = 5) => {
  const clientSales: Record<
    number,
    { clientName: string; totalSpent: number; purchaseCount: number }
  > = {};

  sales.forEach((sale) => {
    if (sale.status === 'completed') {
      if (!clientSales[sale.clientId]) {
        clientSales[sale.clientId] = {
          clientName: sale.clientName,
          totalSpent: 0,
          purchaseCount: 0,
        };
      }
      clientSales[sale.clientId].totalSpent += sale.total;
      clientSales[sale.clientId].purchaseCount += 1;
    }
  });

  return Object.values(clientSales)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);
};

export const getSalesByPeriod = (sales: Sale[], period: 'today' | 'week' | 'month' | 'year') => {
  const now = new Date();
  const filterDate = new Date();

  switch (period) {
    case 'today':
      filterDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      filterDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      filterDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      filterDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return sales.filter((sale) => sale.status === 'completed' && new Date(sale.date) >= filterDate);
};

// Utilidades de localStorage (para persistencia local)
export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Utilidades de exportación
export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

// Utilidades de impresión
export const printReceipt = (sale: Sale): void => {
  const receiptWindow = window.open('', '_blank');
  if (!receiptWindow) return;

  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Recibo de Venta #${sale.id}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 300px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .customer-info, .products, .totals { margin: 10px 0; }
        .product-line { display: flex; justify-content: space-between; margin: 5px 0; }
        .totals { border-top: 2px solid #000; padding-top: 10px; }
        .total { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h3>RECIBO DE VENTA</h3>
        <p>Fecha: ${formatDate(sale.date)} ${sale.time}</p>
        <p>Recibo #: ${sale.id}</p>
      </div>
      
      <div class="customer-info">
        <strong>Cliente:</strong> ${sale.clientName}
      </div>
      
      <div class="products">
        <strong>Productos:</strong>
        ${sale.products
          .map(
            (product) => `
          <div class="product-line">
            <span>${product.name}</span>
            <span>${product.quantity} x ${formatCurrency(product.price)} = ${formatCurrency(product.subtotal)}</span>
          </div>
        `
          )
          .join('')}
      </div>
      
      <div class="totals">
        <div class="product-line">
          <span>Subtotal:</span>
          <span>${formatCurrency(sale.subtotal)}</span>
        </div>
        <div class="product-line">
          <span>Descuento:</span>
          <span>-${formatCurrency(sale.discount)}</span>
        </div>
        <div class="product-line total">
          <span>Total:</span>
          <span>${formatCurrency(sale.total)}</span>
        </div>
        <div class="product-line">
          <span>Método de pago:</span>
          <span>${getPaymentMethodLabel(sale.paymentMethod)}</span>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; font-size: 12px;">
        ¡Gracias por su compra!
      </div>
    </body>
    </html>
  `;

  receiptWindow.document.write(receiptHTML);
  receiptWindow.document.close();
  receiptWindow.focus();
  receiptWindow.print();
};

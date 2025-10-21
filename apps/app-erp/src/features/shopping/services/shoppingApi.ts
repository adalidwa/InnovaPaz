const API_BASE_URL = 'http://localhost:4000/api/shopping';

// Types
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

export interface Product {
  id: number;
  name: string;
  description?: string;
  category?: string;
  unit?: string;
  supplier_id?: number;
  supplier_name?: string;
  unit_price?: number;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  status: string;
}

export interface PurchaseOrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface PurchaseOrder {
  id: number;
  order_number: string;
  date: string;
  supplier_id: number;
  supplier_name: string;
  items: PurchaseOrderItem[];
  total_items: number;
  total_amount: number;
  status: string;
  notes?: string;
}

export interface ReceptionItem {
  product_id: number;
  product_name: string;
  expected_quantity: number;
  received_quantity: number;
  difference?: number;
  unit_price: number;
}

export interface Reception {
  id: number;
  reception_number: string;
  date: string;
  order_number?: string;
  supplier_id?: number;
  supplier_name?: string;
  received_by?: string;
  items: ReceptionItem[];
  status: string;
  notes?: string;
}

export interface Contract {
  id: number;
  contract_number: string;
  provider_id: number;
  provider_name: string;
  type: string;
  start_date: string;
  end_date: string;
  amount?: number;
  status: string;
  terms?: string;
  document_path?: string;
  renewal_alert: boolean;
}

// ========== PROVIDERS API ==========
export const providersApi = {
  getAll: async (): Promise<Provider[]> => {
    const response = await fetch(`${API_BASE_URL}/providers`);
    if (!response.ok) throw new Error('Error fetching providers');
    return response.json();
  },

  getById: async (id: number): Promise<Provider> => {
    const response = await fetch(`${API_BASE_URL}/providers/${id}`);
    if (!response.ok) throw new Error('Error fetching provider');
    return response.json();
  },

  create: async (provider: Omit<Provider, 'id'>): Promise<Provider> => {
    const response = await fetch(`${API_BASE_URL}/providers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(provider),
    });
    if (!response.ok) throw new Error('Error creating provider');
    return response.json();
  },

  update: async (id: number, provider: Omit<Provider, 'id'>): Promise<Provider> => {
    const response = await fetch(`${API_BASE_URL}/providers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(provider),
    });
    if (!response.ok) throw new Error('Error updating provider');
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/providers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error deleting provider');
  },
  getHistory: async (providerId: number): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/providers/${providerId}/history`);
    if (!response.ok) throw new Error('Error fetching provider history');
    return response.json();
  },
};

// ========== PRODUCTS API ==========
export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('Error fetching products');
    return response.json();
  },

  getById: async (id: number): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error('Error fetching product');
    return response.json();
  },

  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Error creating product');
    return response.json();
  },

  update: async (id: number, product: Partial<Product>): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Error updating product');
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error deleting product');
  },
};

// ========== PURCHASE ORDERS API ==========
export const purchaseOrdersApi = {
  getAll: async (): Promise<PurchaseOrder[]> => {
    const response = await fetch(`${API_BASE_URL}/purchase-orders`);
    if (!response.ok) throw new Error('Error fetching purchase orders');
    return response.json();
  },

  getById: async (id: number): Promise<PurchaseOrder> => {
    const response = await fetch(`${API_BASE_URL}/purchase-orders/${id}`);
    if (!response.ok) throw new Error('Error fetching purchase order');
    return response.json();
  },

  create: async (order: Omit<PurchaseOrder, 'id'>): Promise<PurchaseOrder> => {
    const response = await fetch(`${API_BASE_URL}/purchase-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!response.ok) throw new Error('Error creating purchase order');
    return response.json();
  },

  update: async (id: number, order: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    const response = await fetch(`${API_BASE_URL}/purchase-orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!response.ok) throw new Error('Error updating purchase order');
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/purchase-orders/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error deleting purchase order');
  },
};

// ========== RECEPTIONS API ==========
export const receptionsApi = {
  getAll: async (supplierId?: number): Promise<Reception[]> => {
    const url = supplierId
      ? `${API_BASE_URL}/receptions?supplier_id=${supplierId}`
      : `${API_BASE_URL}/receptions`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error fetching receptions');
    return response.json();
  },

  create: async (reception: Omit<Reception, 'id'>): Promise<Reception> => {
    const response = await fetch(`${API_BASE_URL}/receptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reception),
    });
    if (!response.ok) throw new Error('Error creating reception');
    return response.json();
  },
};

// ========== CONTRACTS API ==========
export const contractsApi = {
  getAll: async (): Promise<Contract[]> => {
    const response = await fetch(`${API_BASE_URL}/contracts`);
    if (!response.ok) throw new Error('Error fetching contracts');
    return response.json();
  },

  getById: async (id: number): Promise<Contract> => {
    const response = await fetch(`${API_BASE_URL}/contracts/${id}`);
    if (!response.ok) throw new Error('Error fetching contract');
    return response.json();
  },

  create: async (contract: Omit<Contract, 'id'>): Promise<Contract> => {
    const response = await fetch(`${API_BASE_URL}/contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contract),
    });
    if (!response.ok) throw new Error('Error creating contract');
    return response.json();
  },

  update: async (id: number, contract: Partial<Contract>): Promise<Contract> => {
    const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contract),
    });
    if (!response.ok) throw new Error('Error updating contract');
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error deleting contract');
  },
};

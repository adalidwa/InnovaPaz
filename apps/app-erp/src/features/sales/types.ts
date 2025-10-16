// Tipos para Sales
export type Client = {
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
};

export type Product = {
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
};

export type SaleProduct = {
  id: number;
  name: string;
  code: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export type Sale = {
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
};

export type Order = {
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
};

export type Quote = {
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
};

export type HistoryItem = {
  id: number;
  date: string;
  type: 'sale' | 'payment' | 'credit' | 'refund';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
};

export type SalesModule = {
  id: number;
  title: string;
  description: string;
  type: string;
  icon: string;
  route: string;
  isActive: boolean;
  priority: 'high' | 'medium' | 'low';
};

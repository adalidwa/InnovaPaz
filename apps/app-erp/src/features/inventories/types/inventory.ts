export interface CriticalProduct {
  id: string | number;
  name: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  category: string;
  supplier?: string;
  lastUpdated: string;
  status: 'critico' | 'bajo';
  location?: string;
  unit: string;
}

export interface StockAction {
  productId: string | number;
  action: 'restock' | 'adjust' | 'transfer';
  quantity: number;
  notes?: string;
}

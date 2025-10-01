import { useMemo } from 'react';

// Datos de ejemplo simulando métricas agregadas y tablas detalladas.
export function useDummyReportsData() {
  const randomPastDate = (daysBack: number) => {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
    return d.toISOString().slice(0, 10);
  };

  const sales = useMemo(() => {
    const products = ['Laptop', 'Mouse', 'Teclado', 'Monitor', 'Silla'];
    return Array.from({ length: 60 })
      .map((_, i) => ({
        id: i + 1,
        fecha: randomPastDate(14),
        producto: products[i % products.length],
        cantidad: Math.floor(Math.random() * 5) + 1,
        precioUnitario: Number((50 + Math.random() * 900).toFixed(2)),
      }))
      .map((r) => ({ ...r, total: Number((r.cantidad * r.precioUnitario).toFixed(2)) }));
  }, []);

  const purchases = useMemo(() => {
    const suppliers = ['Proveedor A', 'Proveedor B', 'Proveedor C'];
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i + 1,
      fecha: randomPastDate(14),
      proveedor: suppliers[i % suppliers.length],
      items: Math.floor(Math.random() * 10) + 1,
      costo: Number((100 + Math.random() * 1500).toFixed(2)),
    }));
  }, []);

  const inventory = useMemo(() => {
    const sku = ['SKU-001', 'SKU-002', 'SKU-003', 'SKU-004'];
    return sku
      .map((code, i) => ({
        sku: code,
        descripcion: 'Producto ' + (i + 1),
        stock: Math.floor(Math.random() * 120),
        minimo: 20,
        costoPromedio: Number((20 + Math.random() * 200).toFixed(2)),
      }))
      .map((r) => ({ ...r, valuacion: Number((r.stock * r.costoPromedio).toFixed(2)) }));
  }, []);

  const metrics = useMemo(() => {
    const salesTotal = sales.reduce((sum, r) => sum + r.total, 0);
    const avgTicket = salesTotal / sales.length || 0;
    const purchaseTotal = purchases.reduce((sum, r) => sum + r.costo, 0);
    const stockValuation = inventory.reduce((sum, r) => sum + r.valuacion, 0);
    return {
      salesTotal: Number(salesTotal.toFixed(2)),
      avgTicket: Number(avgTicket.toFixed(2)),
      purchaseTotal: Number(purchaseTotal.toFixed(2)),
      stockValuation: Number(stockValuation.toFixed(2)),
    };
  }, [sales, purchases, inventory]);

  return { sales, purchases, inventory, metrics };
}

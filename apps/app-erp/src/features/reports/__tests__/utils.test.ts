import { describe, it, expect } from 'vitest';
// Nota: evitamos invocar hooks directamente en pruebas unitarias sin entorno React.

// Nota: exportToCsv crea un Blob y link. Probamos estructura del CSV string indirectamente generando la cadena manual.

function createCsvLike(rows: Record<string, unknown>[]) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (val: unknown) => {
    if (val == null) return '';
    const s = String(val);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [headers.join(',')]
    .concat(rows.map((r) => headers.map((h) => escape(r[h])).join(',')))
    .join('\n');
}

describe('dummy reports utils', () => {
  it('should build synthetic sales rows with total field (logic replica)', () => {
    const today = new Date().toISOString().slice(0, 10);
    const products = ['Laptop', 'Mouse'];
    const sales = Array.from({ length: 3 })
      .map((_, i) => ({
        id: i + 1,
        fecha: today,
        producto: products[i % products.length],
        cantidad: 2,
        precioUnitario: 100,
      }))
      .map((r) => ({ ...r, total: r.cantidad * r.precioUnitario }));
    expect(sales[0]).toHaveProperty('total');
    expect(sales[0].total).toBe(200);
  });

  it('should build a csv string like exportToCsv output headers first line', () => {
    const rows = [
      { a: 1, b: 'x' },
      { a: 2, b: 'y' },
    ];
    const csv = createCsvLike(rows);
    expect(csv.split('\n')[0]).toBe('a,b');
  });
});

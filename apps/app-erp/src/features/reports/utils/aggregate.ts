export type Grouping = 'dia' | 'semana' | 'mes';

// Agrupa una colección de registros con campo fecha ISO (YYYY-MM-DD) por unidad.
export function groupByDate<T extends Record<string, any>>(
  rows: T[],
  dateKey: keyof T,
  unit: Grouping,
  valueSelector: (row: T) => number
) {
  const acc = new Map<string, { key: string; total: number }>();
  for (const r of rows) {
    const raw = r[dateKey];
    if (typeof raw !== 'string') continue;
    let bucket: string = raw;
    if (unit === 'semana') {
      bucket = isoWeek(raw);
    } else if (unit === 'mes') {
      bucket = raw.slice(0, 7); // YYYY-MM
    }
    const cur = acc.get(bucket) || { key: bucket, total: 0 };
    cur.total += valueSelector(r);
    acc.set(bucket, cur);
  }
  return Array.from(acc.values()).sort((a, b) => a.key.localeCompare(b.key));
}

function isoWeek(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  // Set to nearest Thursday: current date + 4 - current day number
  const dayNum = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() + 3 - dayNum);
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  const firstDayNum = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() + 3 - firstDayNum);
  const week = 1 + Math.round(((d.getTime() - firstThursday.getTime()) / 86400000 - 3) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}
